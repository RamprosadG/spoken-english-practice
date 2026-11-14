import { IPA_SOUND_COUNT, type IpaSoundCategory } from "@/lib/ipa-sounds";

export function IpaSoundHeader({ category }: { category?: IpaSoundCategory }) {
  return (
    <header className="border-b border-slate-200 pb-5">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 max-sm:text-lg">
        {category?.title ?? "IPA Sound"}
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        {category
          ? `${category.sounds.length} sounds. Hear each sound twice before each of its three example words.`
          : `${IPA_SOUND_COUNT} English sounds in four categories. Hear each sound twice, then its first example word, repeated twice.`}
      </p>
    </header>
  );
}
