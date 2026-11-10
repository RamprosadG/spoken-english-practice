import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import {
  HiOutlineBookOpen,
  HiOutlineChatAlt2,
  HiOutlineClipboardCheck,
  HiOutlineMicrophone,
  HiOutlinePresentationChartBar,
  HiOutlineUserGroup,
  HiOutlineUsers,
  HiOutlineVolumeUp,
} from "react-icons/hi";
import type { IconType } from "react-icons";
import StatCard from "@/components/ui/stats/StatCard";
import type { HomeSummary } from "@/types/home";

const numberFormatter = new Intl.NumberFormat("en-US");

interface HomeCard {
  title: string;
  href: string;
  description: string;
  action: string;
  icon: IconType;
  tint: string;
  /** A private library is only ever offered to a reader who can open it. */
  adminOnly?: boolean;
}

interface HomeStat {
  title: string;
  value: number;
  subtitle: string;
  meta?: string;
  icon: IconType;
  iconBgColor: string;
  iconColor: string;
  adminOnly?: boolean;
}

// Both card lists follow the sidebar order so the home page reads the same way
// as the navigation rail next to it — admin-only entries included, in place.
const destinations: HomeCard[] = [
  {
    title: "Vocabulary",
    href: "/vocabulary",
    description:
      "Words with meaning, example, synonym, and antonym — each with its own IPA and audio.",
    action: "Open Vocabulary",
    icon: HiOutlineBookOpen,
    tint: "bg-violet-50 text-violet-600",
  },
  {
    title: "Sentence",
    href: "/sentence",
    description:
      "Daily-use English lines with Bengali meanings. Expand any row and listen as many times as you need.",
    action: "Open Sentence",
    icon: HiOutlineChatAlt2,
    tint: "bg-sky-50 text-sky-600",
  },
  {
    title: "Conversation",
    href: "/conversation",
    description:
      "Two-speaker dialogues with a separate voice for each side, so you can rehearse a real exchange turn by turn.",
    action: "Open Conversation",
    icon: HiOutlineUserGroup,
    tint: "bg-teal-50 text-teal-600",
  },
  {
    title: "Presentation",
    href: "/presentation",
    description:
      "Full passages to rehearse aloud, with a read-only practice workspace for every saved text.",
    action: "Open Presentation",
    icon: HiOutlinePresentationChartBar,
    tint: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Listening",
    href: "/listening",
    description:
      "Play one hidden sentence at a time, type what you hear, and fix only the words you missed.",
    action: "Start A Dictation",
    icon: HiOutlineVolumeUp,
    tint: "bg-amber-50 text-amber-600",
  },
  {
    title: "Question",
    href: "/question",
    description:
      "Saved questions with a model answer, grouped by category and topic and set to a difficulty.",
    action: "Open Question",
    icon: HiOutlineClipboardCheck,
    tint: "bg-rose-50 text-rose-600",
    adminOnly: true,
  },
  {
    title: "Learner",
    href: "/learner",
    description:
      "Every account that can sign in, with its role, ready to add, edit, or remove.",
    action: "Manage Learner",
    icon: HiOutlineUsers,
    tint: "bg-blue-50 text-blue-600",
    adminOnly: true,
  },
  {
    title: "Practice",
    href: "/practice",
    description:
      "Paste your own text, pick an accent and speed, then play it back sentence by sentence.",
    action: "Start Practicing",
    icon: HiOutlineMicrophone,
    tint: "bg-emerald-50 text-emerald-600",
  },
];

interface HomeViewProps {
  summary: HomeSummary;
}

function categoryLabel(count: number): string {
  return `${numberFormatter.format(count)} ${count === 1 ? "Category" : "Categories"}`;
}

/**
 * Below `lg` the list is two columns, and an odd total hands the first card the
 * whole row so the rest still pair up. From `lg` the twelve-column grid keeps a
 * six-card list at three per row and splits a seven-card list into 3 + 4.
 */
function statSpanClass(index: number, total: number): string {
  const mobile = total % 2 === 1 && index === 0 ? "col-span-2" : "";
  const large = total > 6 && index >= 3 ? "lg:col-span-3" : "lg:col-span-4";

  return `${mobile} ${large}`.trim();
}

export function HomeView({ summary }: HomeViewProps) {
  const isAdmin = summary.question !== null;

  const stats: HomeStat[] = [
    {
      title: "Vocabulary",
      value: summary.vocabularies,
      subtitle: "Words with examples",
      meta: categoryLabel(summary.categories.vocabulary),
      icon: HiOutlineBookOpen,
      iconBgColor: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      title: "Sentence",
      value: summary.sentences,
      subtitle: "Lines with audio",
      meta: categoryLabel(summary.categories.sentence),
      icon: HiOutlineChatAlt2,
      iconBgColor: "bg-sky-50",
      iconColor: "text-sky-600",
    },
    {
      title: "Conversation",
      value: summary.conversations,
      subtitle: "Dialogues with two voices",
      meta: categoryLabel(summary.categories.conversation),
      icon: HiOutlineUserGroup,
      iconBgColor: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      title: "Presentation",
      value: summary.presentations,
      subtitle: "Passages to rehearse",
      meta: categoryLabel(summary.categories.presentation),
      icon: HiOutlinePresentationChartBar,
      iconBgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Listening",
      value: summary.listenings,
      subtitle: "Sentences to dictate",
      meta: categoryLabel(summary.categories.listening),
      icon: HiOutlineVolumeUp,
      iconBgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Question",
      value: summary.question?.questions ?? 0,
      subtitle: "Questions with model answers",
      meta: categoryLabel(summary.question?.categories ?? 0),
      icon: HiOutlineClipboardCheck,
      iconBgColor: "bg-rose-50",
      iconColor: "text-rose-600",
      adminOnly: true,
    },
    {
      title: "Learner",
      value: summary.users,
      subtitle: "Registered accounts",
      icon: HiOutlineUsers,
      iconBgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  const visibleStats = stats.filter((stat) => !stat.adminOnly || isAdmin);
  const visibleDestinations = destinations.filter(
    (destination) => !destination.adminOnly || isAdmin,
  );

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="home-overview-heading" className="flex flex-col gap-4">
        <h2
          id="home-overview-heading"
          className="text-lg font-semibold tracking-tight text-slate-900"
        >
          What Is Inside Today
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-12">
          {visibleStats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={numberFormatter.format(stat.value)}
                subtitle={stat.subtitle}
                meta={stat.meta}
                icon={<Icon className="h-5 w-5" />}
                iconBgColor={stat.iconBgColor}
                iconColor={stat.iconColor}
                className={statSpanClass(index, visibleStats.length)}
              />
            );
          })}
        </div>
      </section>

      <section aria-labelledby="home-destinations-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2
            id="home-destinations-heading"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            Choose Where To Practise
          </h2>
          <p className="text-sm text-slate-500">
            Every page plays real audio in the browser — no download, no setup.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {visibleDestinations.map((destination) => {
            const Icon = destination.icon;

            return (
              <Link
                key={destination.href}
                href={destination.href}
                className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white max-sm:p-3"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg max-sm:h-9 max-sm:w-9 ${destination.tint}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900 max-sm:mt-3 max-sm:text-sm max-sm:leading-5">
                  {destination.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500 max-sm:text-xs max-sm:leading-5">
                  {destination.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-all duration-200 group-hover:gap-2.5 group-hover:text-indigo-700 max-sm:mt-3 max-sm:text-xs max-sm:leading-5">
                  {destination.action}
                  <FiArrowRight className="h-4 w-4 shrink-0 max-sm:h-3.5 max-sm:w-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
