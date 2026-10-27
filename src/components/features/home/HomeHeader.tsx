import Link from "next/link";
import { FiArrowRight, FiPlayCircle } from "react-icons/fi";

export function HomeHeader() {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-700 px-6 py-10 shadow-sm sm:px-10 sm:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-16 h-56 w-56 rounded-full bg-violet-400/30 blur-3xl"
      />

      <span className="relative inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white ring-1 ring-white/25">
        Listen · Repeat · Speak
      </span>

      <h1 className="relative mt-4 max-w-3xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl xl:text-5xl">
        Build a speaking voice you are proud of
      </h1>

      <p className="mt-3 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base sm:leading-8">
        Short English sentences, full presentations, and vocabulary with Bengali
        meanings — every line carries its IPA transcription and native-accent
        audio, so you can hear it, read it, and say it out loud.
      </p>

      <div className="relative mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/practice"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-xs transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700"
        >
          <FiPlayCircle className="h-4 w-4" />
          Start practicing free
        </Link>
        <Link
          href="/vocabulary"
          className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/45 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700"
        >
          Explore the library
          <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
