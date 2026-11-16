import "dotenv/config";

import prisma from "@/lib/prisma";
import {
  countCategories,
  createCategory,
  findCategoryRows,
  updateCategory,
} from "@/server/repositories/category.repository";
import type { CategoryKind } from "@/server/types/category";

interface CategoryList {
  kind: CategoryKind;
  table: string;
  items: readonly { name: string; sequence: number }[];
}

const CATEGORY_LISTS: CategoryList[] = [
  {
    kind: "vocabulary",
    table: "vocabulary_categories",
    items: [
      { name: "Greetings & Social Interaction", sequence: 1 },
      { name: "Feelings & Emotions", sequence: 2 },
      { name: "Daily Activities & Routine", sequence: 3 },
      { name: "People & Relationships", sequence: 4 },
      { name: "Work & Professional Life", sequence: 5 },
      { name: "Time & Frequency", sequence: 6 },
      { name: "Places & Directions", sequence: 7 },
      { name: "Food & Shopping", sequence: 8 },
      { name: "Health & Body", sequence: 9 },
      { name: "Problems & Solutions", sequence: 10 },
      { name: "Fruits & Vegetables", sequence: 11 },
    ],
  },
  {
    kind: "sentence",
    table: "sentence_categories",
    items: [
      { name: "Greetings & Introductions", sequence: 1 },
      { name: "Asking Questions", sequence: 2 },
      { name: "Giving Answers & Responses", sequence: 3 },
      { name: "Daily Activities", sequence: 4 },
      { name: "Requests & Offers", sequence: 5 },
      { name: "Likes & Dislikes", sequence: 6 },
      { name: "Opinions & Suggestions", sequence: 7 },
      { name: "Agreement & Disagreement", sequence: 8 },
      { name: "Apologies & Thanks", sequence: 9 },
      { name: "Invitations & Arrangements", sequence: 10 },
      { name: "Problems & Help", sequence: 11 },
      { name: "Goodbye & Closing Conversations", sequence: 12 },
    ],
  },
  {
    kind: "conversation",
    table: "conversation_categories",
    items: [
      { name: "Meeting Someone", sequence: 1 },
      { name: "Greetings & Small Talk", sequence: 2 },
      { name: "Daily Routine & Small Talk", sequence: 2 },
      { name: "Self Introduction", sequence: 3 },
      { name: "Friends & Family", sequence: 4 },
      { name: "Workplace Conversations", sequence: 5 },
      { name: "Phone Conversations", sequence: 6 },
      { name: "Shopping & Payments", sequence: 7 },
      { name: "Food & Restaurants", sequence: 8 },
      { name: "Travel & Transportation", sequence: 9 },
      { name: "Asking for Help", sequence: 10 },
      { name: "Making Plans", sequence: 11 },
      { name: "Everyday Problems", sequence: 12 },
    ],
  },
  {
    kind: "presentation",
    table: "presentation_categories",
    items: [
      { name: "General", sequence: 1 },
      { name: "Self Introduction", sequence: 1 },
      { name: "Daily Routine", sequence: 2 },
      { name: "Personal Experiences", sequence: 3 },
      { name: "People & Relationships", sequence: 4 },
      { name: "Places & Environment", sequence: 5 },
      { name: "Work & Career", sequence: 6 },
      { name: "Hobbies & Interests", sequence: 7 },
      { name: "Opinions & Ideas", sequence: 8 },
      { name: "Events & Occasions", sequence: 9 },
      { name: "Storytelling", sequence: 10 },
    ],
  },
  {
    kind: "listening",
    table: "listening_categories",
    items: [
      { name: "Greetings & Small Talk", sequence: 1 },
      { name: "Self Introduction", sequence: 2 },
      { name: "Daily Routine", sequence: 3 },
      { name: "Family & Friends", sequence: 4 },
      { name: "Workplace & Office", sequence: 5 },
      { name: "Shopping & Restaurants", sequence: 6 },
      { name: "Travel & Transportation", sequence: 7 },
      { name: "Experiences & Events", sequence: 8 },
      { name: "Problems & Solutions", sequence: 9 },
      { name: "Stories & Descriptions", sequence: 10 },
    ],
  },
  {
    kind: "story",
    table: "story_categories",
    items: [
      { name: "Daily Life", sequence: 1 },
      { name: "Adventure", sequence: 2 },
      { name: "Fantasy", sequence: 3 },
      { name: "Science Fiction", sequence: 4 },
      { name: "Mystery", sequence: 5 },
      { name: "Funny", sequence: 6 },
      { name: "Moral / Inspirational", sequence: 7 },
      { name: "Historical / Biography", sequence: 8 },
      { name: "Horror", sequence: 9 },
      { name: "Romance / Emotional", sequence: 10 },
    ],
  },
  {
    kind: "video",
    table: "video_categories",
    items: [
      { name: "Shadowing Practice", sequence: 1 },
      { name: "Songs and Lyrics", sequence: 2 },
      { name: "Conversations and Dialogues", sequence: 3 },
      { name: "Pronunciation and Accent", sequence: 4 },
      { name: "Grammar Lessons", sequence: 5 },
      { name: "Vocabulary and Idioms", sequence: 6 },
      { name: "Listening Practice", sequence: 7 },
      { name: "Speeches and Talks", sequence: 8 },
      { name: "Movies and TV Clips", sequence: 9 },
      { name: "Interview and Professional English", sequence: 10 },
    ],
  },
  {
    kind: "question",
    table: "question_categories",
    items: [
      { name: "Technical", sequence: 1 },
      { name: "Coding", sequence: 2 },
      { name: "System Design", sequence: 3 },
      { name: "Behavioral", sequence: 4 },
      { name: "Situational", sequence: 5 },
      { name: "Project Based", sequence: 6 },
      { name: "HR / Culture Fit", sequence: 7 },
      { name: "Leadership", sequence: 8 },
    ],
  },
  {
    kind: "topic",
    table: "question_topics",
    items: [
      { name: "Data Structures and Algorithms", sequence: 1 },
      { name: "OOP and Design Patterns", sequence: 2 },
      { name: "System Design and Architecture", sequence: 3 },
      { name: "Database (SQL and NoSQL)", sequence: 4 },
      { name: "API and Backend Development", sequence: 5 },
      { name: "Frontend and Web Development", sequence: 6 },
      { name: "CS Fundamentals", sequence: 7 },
      { name: "DevOps, Cloud and Tools", sequence: 8 },
      { name: "Testing, Debugging and Code Quality", sequence: 9 },
      { name: "Teamwork, Leadership and Projects", sequence: 10 },
      { name: "Personal and Career", sequence: 11 },
    ],
  },
];

async function seedCategoryList({ kind, table, items }: CategoryList) {
  const rowsBefore = await countCategories(kind);
  const existingRows = await findCategoryRows(kind);
  const existingMap = new Map(existingRows.map((row) => [row.name, row]));

  let updated = 0;
  let created = 0;
  let unchanged = 0;

  for (const item of items) {
    const existing = existingMap.get(item.name);
    if (existing) {
      if (existing.sequence !== item.sequence) {
        await updateCategory(kind, existing.id, {
          name: item.name,
          sequence: item.sequence,
        });
        updated += 1;
      } else {
        unchanged += 1;
      }
      continue;
    }

    await createCategory(kind, {
      name: item.name,
      sequence: item.sequence,
    });
    created += 1;
  }

  const rowsAfter = await countCategories(kind);

  console.log(
    `${table}: ${created} created, ${updated} updated, ${unchanged} unchanged — ${rowsBefore} rows before, ${rowsAfter} after.`,
  );
}

async function main() {
  try {
    for (const list of CATEGORY_LISTS) {
      await seedCategoryList(list);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
