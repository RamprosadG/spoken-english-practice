// JS-native wrapper around the espeak-ng wasm module (dist/wasm/espeak-ng.mjs),
// mirroring piper1-gpl's own espeak binding, src/piper/espeakbridge.c, name for
// name: initialize(dataDir) / setVoice(voice) / getPhonemes(text).
//
// Language data ships as two files under dist/data/: data.data (everything
// except Russian — shared tables, every voice's lang/ definition, and every
// non-Russian dictionary) and ru.data (just the ~9MB Russian dictionary).
// data.data is always loaded by initialize(); ru.data only if the caller
// passes includeRussian: true, since most sessions never need it.
//
// Usage:
//   import { initialize, setVoice, getPhonemes } from "espeak-phonemizer";
//   await initialize();               // Node: resolves this package's own dist/ automatically
//   await setVoice("en-us");
//   getPhonemes("Hello world.");      // -> [{ phonemes, terminator, isSentenceEnd }]
//   // Outside Node (browser/bundler), pass an explicit base path/URL:
//   //   await initialize("https://your-cdn.example/espeak-phonemizer/dist");
//   // Need Russian too:
//   //   await initialize(undefined, true);
//   // Offline/PWA: hand initialize() the exact bytes/URLs to use for each
//   // file instead of a base dir, e.g. pulled straight out of the Cache API:
//   //   await initialize({
//   //     wasm: wasmBlob, manifest: manifestObjOrBlob, data: dataBlob, ru: ruBlob,
//   //   }, true);

import createEspeakModule from '../dist/wasm/espeak-ng.mjs';
import {
  espeakCHARS_AUTO,
  espeakPHONEMES_IPA,
  AUDIO_OUTPUT_SYNCHRONOUS,
  decodeTerminator,
} from './constants.mjs';
import { PACKAGE_VERSION } from './version.mjs';

// The virtual filesystem path data files get written under (matches the
// path passed to espeak_Initialize below).
const ESPEAK_DATA_VIRTUAL_PATH = '/espeak-ng-data';

const isNode = typeof globalThis.process?.versions?.node === 'string' && globalThis.process?.type !== 'renderer';

let Module = null;
let manifest = null;
let espeak_SetVoiceByName = null;
let espeak_TextToPhonemesWithTerminator = null;
let russianLoaded = false;

/**
 * One file `initialize()` needs, as either a URL/path string or a Blob
 * (e.g. retrieved from the Cache API or IndexedDB for offline/PWA use).
 * @typedef {string | Blob} AssetSource
 */

/**
 * Per-file sources for `initialize()`, as an alternative to a single base
 * `dataDir` string — lets a caller (e.g. a PWA with no network access) hand
 * over exactly the bytes/URLs to use for each file, bypassing this module's
 * own fetch/readFile entirely.
 * @typedef {{
 *   wasm: AssetSource,
 *   manifest: AssetSource | object,
 *   data: AssetSource,
 *   ru?: AssetSource,
 * }} EspeakDataSources
 */

// Fetches (browser) or reads (Node) one asset, returning its bytes. `source`
// may also be a Blob, in which case nothing is fetched/read at all.
async function readAsset(source) {
  if (source instanceof Blob) {
    return new Uint8Array(await source.arrayBuffer());
  }
  if (isNode) {
    const { readFile } = await import('node:fs/promises');
    return new Uint8Array(await readFile(source));
  }
  const res = await fetch(source);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${source}: ${res.status} ${res.statusText}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

// Resolves manifest.json from any AssetSource — or, as a convenience for
// callers who already have the parsed object on hand (e.g. cached in
// IndexedDB), passes a plain object straight through with no parsing at all.
async function readJSON(source) {
  if (source && typeof source === 'object' && !(source instanceof Blob)) {
    return source;
  }
  const bytes = await readAsset(source);
  return JSON.parse(new TextDecoder().decode(bytes));
}

// locateFile's return value is handed to the wasm glue's own fetch/readFile
// logic, which only understands URLs/paths — not Blobs — so a Blob source
// for the wasm binary is turned into a `blob:` object URL first (browser
// only; `fetch()` there follows `blob:` URLs natively).
function resolveWasmLocation(source) {
  if (typeof source === 'string') return source;
  if (source instanceof Blob) return URL.createObjectURL(source);
  throw new Error('initialize: "wasm" source must be a URL/path string or a Blob');
}

function virtualDirname(virtualPath) {
  const idx = virtualPath.lastIndexOf('/');
  return idx <= 0 ? '/' : virtualPath.slice(0, idx);
}

// Writes one already-fetched data file's contained files into MEMFS at their
// original relative path under ESPEAK_DATA_VIRTUAL_PATH.
function mountBucket(bucket, bytes) {
  for (const [relPath, { offset, length }] of Object.entries(bucket.files)) {
    const virtualPath = `${ESPEAK_DATA_VIRTUAL_PATH}/${relPath}`;
    Module.FS.mkdirTree(virtualDirname(virtualPath));
    Module.FS.writeFile(virtualPath, bytes.subarray(offset, offset + length));
  }
}

// In Node, defaults to this package's own installed `dist/` directory, so
// `initialize()` works with no arguments after `npm install`. There's no
// sensible default outside Node (no "install location" to resolve relative
// to) — browser/bundler callers must always pass an explicit dataDir.
async function defaultDistDir() {
  if (!isNode) {
    return '';
  }
  const { fileURLToPath } = await import('node:url');
  return fileURLToPath(new URL('../dist', import.meta.url));
}

function sourcesForBase(base) {
  return {
    wasm: `${base}/wasm/espeak-ng.wasm`,
    manifest: `${base}/data/manifest.json`,
    data: `${base}/data/data.data`,
    ru: `${base}/data/ru.data`,
  };
}

/**
 * Loads the wasm module and the always-needed language data (shared
 * phontab/phondata/phonindex/intonations tables plus every non-Russian
 * dictionary), then calls espeak_Initialize. Mirrors espeakbridge.c's
 * py_initialize(data_dir), adapted for async wasm loading.
 *
 * Safe to call more than once — subsequent calls are no-ops once loaded
 * (including with a different `includeRussian` value — call it once, up
 * front, with the value you need).
 *
 * @param {string | EspeakDataSources} [dataDir] base path/URL for this
 *   package's `dist/` directory (containing both `wasm/` and `data/`), e.g.
 *   "./dist" or an absolute URL — or an {@link EspeakDataSources} object
 *   giving an explicit URL/path/Blob for each individual file, for callers
 *   (e.g. a PWA) that want to serve everything from a cache with no network
 *   access. Defaults to this package's own installed location in Node.js;
 *   required when called outside Node. In a browser, if `data/` isn't
 *   reachable under this path (or the default) and `dataDir` is a string,
 *   falls back to fetching this exact release's data bundle from the npm
 *   CDN.
 * @param {boolean} [includeRussian] whether to also load the Russian
 *   dictionary (`ru.data`, ~9MB) into the wasm virtual filesystem, so that
 *   `setVoice("ru")` works. Defaults to false, since most sessions never
 *   need it and it dwarfs every other language's data combined.
 */
export async function initialize(dataDir, includeRussian = false) {
  if (Module) return;

  let sources;
  if (dataDir && typeof dataDir === 'object') {
    sources = dataDir;
    for (const required of ['wasm', 'manifest', 'data']) {
      if (!sources[required]) {
        throw new Error(`initialize: dataDir object is missing required "${required}" source`);
      }
    }
    manifest = await readJSON(sources.manifest);
  } else {
    let base = dataDir || (await defaultDistDir()).replace(/\/+$/, '');
    sources = sourcesForBase(base);
    try {
      manifest = await readJSON(sources.manifest);
    } catch {
      // Fall back to loading data from the npm CDN.
      base = `https://cdn.jsdelivr.net/npm/espeak-phonemizer@${PACKAGE_VERSION}/dist`;
      sources = sourcesForBase(base);
      manifest = await readJSON(sources.manifest);
    }
  }

  const loadedModule = await createEspeakModule({
    locateFile: () => resolveWasmLocation(sources.wasm),
  });

  Module = loadedModule;

  const dataBytes = await readAsset(sources.data);
  mountBucket(manifest.data, dataBytes);

  if (includeRussian) {
    if (!sources.ru) {
      throw new Error('initialize: includeRussian is true but no "ru" data source was provided');
    }
    const ruBytes = await readAsset(sources.ru);
    mountBucket(manifest.ru, ruBytes);
    russianLoaded = true;
  }

  const init = Module.cwrap('espeak_Initialize', 'number', ['number', 'number', 'string', 'number']);
  const rc = init(AUDIO_OUTPUT_SYNCHRONOUS, 0, ESPEAK_DATA_VIRTUAL_PATH, 0);
  if (rc < 0) {
    throw new Error('Failed to initialize espeak-ng');
  }

  espeak_SetVoiceByName = Module.cwrap('espeak_SetVoiceByName', 'number', ['string']);
  espeak_TextToPhonemesWithTerminator = Module.cwrap(
    'espeak_TextToPhonemesWithTerminator',
    'string',
    ['number', 'number', 'number', 'number']
  );
}

function requireInitialized() {
  if (!Module) {
    throw new Error('espeak-ng is not initialized — call initialize(dataDir) first.');
  }
}

/**
 * Mirrors espeakbridge.c's py_set_voice(voice), except async: sets the
 * active espeak-ng voice by name (e.g. "en-us", "es-419", "pt-br"). Throws/
 * rejects if the voice is unknown, wasn't bundled into this build, or is a
 * Russian voice that wasn't loaded (see the `includeRussian` option on
 * {@link initialize}).
 * @param {string} voice
 */
export async function setVoice(voice) {
  requireInitialized();

  if (!manifest.voices.includes(voice)) {
    throw new Error(`Unknown or unbundled voice: ${voice}`);
  }
  if (manifest.russianVoices.includes(voice) && !russianLoaded) {
    throw new Error(`Voice "${voice}" requires Russian data, which was not loaded — pass includeRussian: true to initialize().`);
  }

  if (espeak_SetVoiceByName(voice) !== 0 /* EE_OK */) {
    throw new Error(`Failed to set voice: ${voice}`);
  }
}

/**
 * Mirrors espeakbridge.c's py_get_phonemes(text): runs the
 * `while (text != NULL) { espeak_TextToPhonemesWithTerminator(...) }` loop
 * internally (using espeakCHARS_AUTO / espeakPHONEMES_IPA, matching both
 * piper-phonemize and espeakbridge.c) and returns one entry per clause. No
 * wasm pointers reach the caller — all heap allocation is freed before this
 * function returns. Synchronous — no I/O happens here.
 *
 * @param {string} text
 * @returns {Array<{ phonemes: string, terminator: string, isSentenceEnd: boolean }>}
 */
export function getPhonemes(text) {
  requireInitialized();

  const bytes = Module.lengthBytesUTF8(text) + 1;
  const textPtr = Module._malloc(bytes);
  Module.stringToUTF8(text, textPtr, bytes);

  const textPtrCell = Module._malloc(4); // holds the in/out `const void **textptr`
  Module.setValue(textPtrCell, textPtr, 'i32');
  const terminatorCell = Module._malloc(4); // holds the out `int *terminator`

  const results = [];
  try {
    while (Module.getValue(textPtrCell, 'i32') !== 0) {
      const phonemes = espeak_TextToPhonemesWithTerminator(
        textPtrCell,
        espeakCHARS_AUTO,
        espeakPHONEMES_IPA,
        terminatorCell
      );
      const terminator = Module.getValue(terminatorCell, 'i32');
      results.push({ phonemes: phonemes ?? '', ...decodeTerminator(terminator) });
    }
  } finally {
    Module._free(textPtr);
    Module._free(textPtrCell);
    Module._free(terminatorCell);
  }
  return results;
}
