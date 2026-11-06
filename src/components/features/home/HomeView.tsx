import Link from "next/link";
import type { ReactNode } from "react";
import { FiArrowRight } from "react-icons/fi";
import {
  HiOutlineBookOpen,
  HiOutlineChatAlt2,
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

interface DestinationCard {
  title: string;
  href: string;
  description: string;
  action: string;
  icon: IconType;
  tint: string;
}

// Both card lists follow the sidebar order so the home page reads the same way
// as the navigation rail next to it.
const destinations: DestinationCard[] = [
  {
    title: "Important Vocabularies",
    href: "/vocabulary",
    description:
      "Words with meaning, example, synonym, and antonym — each with its own IPA and audio.",
    action: "Open vocabulary",
    icon: HiOutlineBookOpen,
    tint: "bg-violet-50 text-violet-600",
  },
  {
    title: "Common sentences",
    href: "/sentences",
    description:
      "Daily-use English lines with Bengali meanings. Expand any row and listen as many times as you need.",
    action: "Open sentences",
    icon: HiOutlineChatAlt2,
    tint: "bg-sky-50 text-sky-600",
  },
  {
    title: "Regular conversation",
    href: "/conversations",
    description:
      "Two-speaker dialogues with a separate voice for each side, so you can rehearse a real exchange turn by turn.",
    action: "Open conversations",
    icon: HiOutlineUserGroup,
    tint: "bg-teal-50 text-teal-600",
  },
  {
    title: "Daily Presentations",
    href: "/presentation",
    description:
      "Full passages to rehearse aloud, with a read-only practice workspace for every saved text.",
    action: "Open presentations",
    icon: HiOutlinePresentationChartBar,
    tint: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Listening practice",
    href: "/listenings",
    description:
      "Play one hidden sentence at a time, type what you hear, and fix only the words you missed.",
    action: "Start a dictation",
    icon: HiOutlineVolumeUp,
    tint: "bg-amber-50 text-amber-600",
  },
  {
    title: "Live practice",
    href: "/practice",
    description:
      "Paste your own text, pick an accent and speed, then play it back sentence by sentence.",
    action: "Start practicing",
    icon: HiOutlineMicrophone,
    tint: "bg-emerald-50 text-emerald-600",
  },
];

interface HomeViewProps {
  summary: HomeSummary;
}

function categoryLabel(count: number): string {
  return `${numberFormatter.format(count)} ${count === 1 ? "category" : "categories"}`;
}

export function HomeView({ summary }: HomeViewProps) {
  const stats: {
    title: string;
    value: number;
    subtitle: string;
    meta?: string;
    icon: ReactNode;
    iconBgColor: string;
    iconColor: string;
  }[] = [
    {
      title: "Learners",
      value: summary.users,
      subtitle: "Registered accounts",
      icon: <HiOutlineUsers className="h-5 w-5" />,
      iconBgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Important Vocabularies",
      value: summary.vocabularies,
      subtitle: "Words with examples",
      meta: categoryLabel(summary.categories.vocabulary),
      icon: <HiOutlineBookOpen className="h-5 w-5" />,
      iconBgColor: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      title: "Common sentences",
      value: summary.sentences,
      subtitle: "Lines with audio",
      meta: categoryLabel(summary.categories.sentence),
      icon: <HiOutlineChatAlt2 className="h-5 w-5" />,
      iconBgColor: "bg-sky-50",
      iconColor: "text-sky-600",
    },
    {
      title: "Regular conversation",
      value: summary.conversations,
      subtitle: "Dialogues with two voices",
      meta: categoryLabel(summary.categories.conversation),
      icon: <HiOutlineUserGroup className="h-5 w-5" />,
      iconBgColor: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      title: "Daily Presentations",
      value: summary.presentations,
      subtitle: "Passages to rehearse",
      meta: categoryLabel(summary.categories.presentation),
      icon: <HiOutlinePresentationChartBar className="h-5 w-5" />,
      iconBgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Listening practice",
      value: summary.listenings,
      subtitle: "Sentences to dictate",
      meta: categoryLabel(summary.categories.listening),
      icon: <HiOutlineVolumeUp className="h-5 w-5" />,
      iconBgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="home-overview-heading" className="flex flex-col gap-4">
        <h2
          id="home-overview-heading"
          className="text-lg font-semibold tracking-tight text-slate-900"
        >
          What is inside today
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={numberFormatter.format(stat.value)}
              subtitle={stat.subtitle}
              meta={stat.meta}
              icon={stat.icon}
              iconBgColor={stat.iconBgColor}
              iconColor={stat.iconColor}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="home-destinations-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2
            id="home-destinations-heading"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            Choose where to practise
          </h2>
          <p className="text-sm text-slate-500">
            Every page plays real audio in the browser — no download, no setup.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {destinations.map((destination) => {
            const Icon = destination.icon;

            return (
              <Link
                key={destination.href}
                href={destination.href}
                className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white max-sm:p-4"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg max-sm:h-9 max-sm:w-9 ${destination.tint}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {destination.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {destination.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-all duration-200 group-hover:gap-2.5 group-hover:text-indigo-700">
                  {destination.action}
                  <FiArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
