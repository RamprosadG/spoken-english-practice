import { ipaSoundRecordingUrl } from "@/lib/ipa-sound-recordings";

export interface IpaSound {
  symbol: string;
  examples: readonly [string, string, string];
  audioUrls: readonly string[];
}

export interface IpaSoundCategory {
  slug: string;
  title: string;
  description: string;
  sounds: readonly IpaSound[];
}

export const IPA_SOUND_CATEGORIES: readonly IpaSoundCategory[] = [
  {
    slug: "short-vowel",
    title: "Short Vowel",
    description: "Seven short vowel sounds, including the unstressed schwa /ə/.",
    sounds: [
      {
        symbol: "ɪ",
        examples: ["sit", "fish", "milk"],
        audioUrls: [ipaSoundRecordingUrl("near-close-near-front-unrounded-vowel.mp3")],
      },
      {
        symbol: "e",
        examples: ["bed", "pen", "head"],
        audioUrls: [ipaSoundRecordingUrl("open-mid-front-unrounded-vowel.mp3")],
      },
      {
        symbol: "æ",
        examples: ["cat", "bag", "hand"],
        audioUrls: [ipaSoundRecordingUrl("near-open-front-unrounded-vowel.mp3")],
      },
      {
        symbol: "ʌ",
        examples: ["cup", "sun", "love"],
        audioUrls: [ipaSoundRecordingUrl("open-mid-back-unrounded-vowel.mp3")],
      },
      {
        symbol: "ɒ",
        examples: ["hot", "dog", "box"],
        audioUrls: [ipaSoundRecordingUrl("open-back-rounded-vowel.mp3")],
      },
      {
        symbol: "ʊ",
        examples: ["book", "foot", "good"],
        audioUrls: [ipaSoundRecordingUrl("near-close-near-back-rounded-vowel.mp3")],
      },
      {
        symbol: "ə",
        examples: ["about", "teacher", "banana"],
        audioUrls: [ipaSoundRecordingUrl("mid-central-vowel.mp3")],
      },
    ],
  },
  {
    slug: "long-vowel",
    title: "Long Vowel",
    description: "Five long vowel sounds. The /ː/ mark indicates vowel length.",
    sounds: [
      {
        symbol: "iː",
        examples: ["see", "tree", "green"],
        audioUrls: [ipaSoundRecordingUrl("close-front-unrounded-vowel.mp3")],
      },
      {
        symbol: "ɑː",
        examples: ["car", "father", "start"],
        audioUrls: [ipaSoundRecordingUrl("open-back-unrounded-vowel.mp3")],
      },
      {
        symbol: "ɔː",
        examples: ["saw", "law", "small"],
        audioUrls: [ipaSoundRecordingUrl("open-mid-back-rounded-vowel.mp3")],
      },
      {
        symbol: "uː",
        examples: ["blue", "food", "moon"],
        audioUrls: [ipaSoundRecordingUrl("close-back-rounded-vowel.mp3")],
      },
      {
        symbol: "ɜː",
        examples: ["bird", "work", "learn"],
        audioUrls: [ipaSoundRecordingUrl("open-mid-central-unrounded-vowel.mp3")],
      },
    ],
  },
  {
    slug: "diphthong",
    title: "Diphthong",
    description:
      "Eight vowel glides that move between two positions within one syllable, played here as component vowel recordings.",
    sounds: [
      {
        symbol: "eɪ",
        examples: ["day", "name", "train"],
        audioUrls: [
          ipaSoundRecordingUrl("open-mid-front-unrounded-vowel.mp3"),
          ipaSoundRecordingUrl("near-close-near-front-unrounded-vowel.mp3"),
        ],
      },
      {
        symbol: "aɪ",
        examples: ["my", "time", "light"],
        audioUrls: [
          ipaSoundRecordingUrl("open-front-unrounded-vowel.mp3"),
          ipaSoundRecordingUrl("near-close-near-front-unrounded-vowel.mp3"),
        ],
      },
      {
        symbol: "ɔɪ",
        examples: ["boy", "toy", "voice"],
        audioUrls: [
          ipaSoundRecordingUrl("open-mid-back-rounded-vowel.mp3"),
          ipaSoundRecordingUrl("near-close-near-front-unrounded-vowel.mp3"),
        ],
      },
      {
        symbol: "əʊ",
        examples: ["go", "home", "phone"],
        audioUrls: [
          ipaSoundRecordingUrl("mid-central-vowel.mp3"),
          ipaSoundRecordingUrl("near-close-near-back-rounded-vowel.mp3"),
        ],
      },
      {
        symbol: "aʊ",
        examples: ["now", "house", "mouth"],
        audioUrls: [
          ipaSoundRecordingUrl("open-front-unrounded-vowel.mp3"),
          ipaSoundRecordingUrl("near-close-near-back-rounded-vowel.mp3"),
        ],
      },
      {
        symbol: "ɪə",
        examples: ["near", "here", "ear"],
        audioUrls: [
          ipaSoundRecordingUrl("near-close-near-front-unrounded-vowel.mp3"),
          ipaSoundRecordingUrl("mid-central-vowel.mp3"),
        ],
      },
      {
        symbol: "eə",
        examples: ["hair", "care", "where"],
        audioUrls: [
          ipaSoundRecordingUrl("open-mid-front-unrounded-vowel.mp3"),
          ipaSoundRecordingUrl("mid-central-vowel.mp3"),
        ],
      },
      {
        symbol: "ʊə",
        examples: ["pure", "tour", "cure"],
        audioUrls: [
          ipaSoundRecordingUrl("near-close-near-back-rounded-vowel.mp3"),
          ipaSoundRecordingUrl("mid-central-vowel.mp3"),
        ],
      },
    ],
  },
  {
    slug: "consonant",
    title: "Consonant",
    description: "Twenty-four consonant sounds formed by shaping or interrupting airflow.",
    sounds: [
      {
        symbol: "p",
        examples: ["pen", "cup", "apple"],
        audioUrls: [ipaSoundRecordingUrl("voiceless-bilabial-plosive.mp3")],
      },
      {
        symbol: "b",
        examples: ["bad", "job", "rabbit"],
        audioUrls: [ipaSoundRecordingUrl("voiced-bilabial-plosive.mp3")],
      },
      {
        symbol: "t",
        examples: ["tea", "cat", "top"],
        audioUrls: [ipaSoundRecordingUrl("voiceless-alveolar-plosive.mp3")],
      },
      {
        symbol: "d",
        examples: ["dog", "bed", "lady"],
        audioUrls: [ipaSoundRecordingUrl("voiced-alveolar-plosive.mp3")],
      },
      {
        symbol: "k",
        examples: ["cat", "book", "kitchen"],
        audioUrls: [ipaSoundRecordingUrl("voiceless-velar-plosive.mp3")],
      },
      {
        symbol: "ɡ",
        examples: ["go", "bag", "tiger"],
        audioUrls: [ipaSoundRecordingUrl("voiced-velar-plosive.mp3")],
      },
      {
        symbol: "f",
        examples: ["fish", "leaf", "coffee"],
        audioUrls: [ipaSoundRecordingUrl("voiceless-labiodental-fricative.mp3")],
      },
      {
        symbol: "v",
        examples: ["van", "love", "seven"],
        audioUrls: [ipaSoundRecordingUrl("voiced-labiodental-fricative.mp3")],
      },
      {
        symbol: "θ",
        examples: ["think", "bath", "healthy"],
        audioUrls: [ipaSoundRecordingUrl("voiceless-dental-fricative.mp3")],
      },
      {
        symbol: "ð",
        examples: ["this", "mother", "breathe"],
        audioUrls: [ipaSoundRecordingUrl("voiced-dental-fricative.mp3")],
      },
      {
        symbol: "s",
        examples: ["sun", "bus", "sister"],
        audioUrls: [ipaSoundRecordingUrl("voiceless-alveolar-sibilant.mp3")],
      },
      {
        symbol: "z",
        examples: ["zoo", "noise", "puzzle"],
        audioUrls: [ipaSoundRecordingUrl("voiced-alveolar-sibilant.mp3")],
      },
      {
        symbol: "ʃ",
        examples: ["she", "fish", "nation"],
        audioUrls: [ipaSoundRecordingUrl("voiceless-palato-alveolar-sibilant.mp3")],
      },
      {
        symbol: "ʒ",
        examples: ["vision", "measure", "treasure"],
        audioUrls: [ipaSoundRecordingUrl("voiced-palato-alveolar-sibilant.mp3")],
      },
      {
        symbol: "h",
        examples: ["hat", "behind", "hello"],
        audioUrls: [ipaSoundRecordingUrl("voiceless-glottal-fricative.mp3")],
      },
      {
        symbol: "tʃ",
        examples: ["chair", "much", "teacher"],
        audioUrls: [ipaSoundRecordingUrl("voiceless-palato-alveolar-affricate.mp3")],
      },
      {
        symbol: "dʒ",
        examples: ["job", "page", "magic"],
        audioUrls: [ipaSoundRecordingUrl("voiced-palato-alveolar-affricate.mp3")],
      },
      {
        symbol: "m",
        examples: ["man", "time", "summer"],
        audioUrls: [ipaSoundRecordingUrl("bilabial-nasal.mp3")],
      },
      {
        symbol: "n",
        examples: ["no", "sun", "dinner"],
        audioUrls: [ipaSoundRecordingUrl("alveolar-nasal.mp3")],
      },
      {
        symbol: "ŋ",
        examples: ["sing", "long", "finger"],
        audioUrls: [ipaSoundRecordingUrl("velar-nasal.mp3")],
      },
      {
        symbol: "l",
        examples: ["leg", "ball", "yellow"],
        audioUrls: [ipaSoundRecordingUrl("alveolar-lateral-approximant.mp3")],
      },
      {
        symbol: "r",
        examples: ["red", "very", "around"],
        audioUrls: [ipaSoundRecordingUrl("alveolar-approximant.mp3")],
      },
      {
        symbol: "j",
        examples: ["yes", "yellow", "beyond"],
        audioUrls: [ipaSoundRecordingUrl("palatal-approximant.mp3")],
      },
      {
        symbol: "w",
        examples: ["wet", "away", "twelve"],
        audioUrls: [ipaSoundRecordingUrl("voiced-labio-velar-approximant.mp3")],
      },
    ],
  },
];

export const IPA_SOUND_COUNT = IPA_SOUND_CATEGORIES.reduce(
  (total, category) => total + category.sounds.length,
  0,
);

export function findIpaSoundCategory(slug: string) {
  return IPA_SOUND_CATEGORIES.find((category) => category.slug === slug);
}
