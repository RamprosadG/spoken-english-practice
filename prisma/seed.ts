import "dotenv/config";

import prisma from "@/lib/prisma";
import {
  countCategories,
  createCategory,
  findCategoryRows,
} from "@/server/repositories/category.repository";
import type { CategoryKind } from "@/server/types/category";

/**
 * Adds the study category lists to the five public library category tables.
 *
 * A name is matched against the rows already in the table, so a category that
 * exists keeps its own id and sequence: saved library rows point at the id, and
 * the admin may have reordered it in the Category modal. Nothing here deletes
 * or renumbers, which makes the script safe to re-run and leaves the
 * migration-seeded `General` rows — required by every legacy row — untouched.
 */
interface CategoryList {
  kind: CategoryKind;
  table: string;
  names: readonly string[];
}

const CATEGORY_LISTS: CategoryList[] = [
  {
    kind: "vocabulary",
    table: "vocabulary_categories",
    names: [
      "Greetings & Social Interaction",
      "Feelings & Emotions",
      "Daily Activities & Routine",
      "People & Relationships",
      "Work & Professional Life",
      "Time & Frequency",
      "Places & Directions",
      "Food & Shopping",
      "Health & Body",
      "Problems & Solutions",
    ],
  },
  {
    kind: "sentence",
    table: "sentence_categories",
    names: [
      "Greetings & Introductions",
      "Asking Questions",
      "Giving Answers & Responses",
      "Daily Activities",
      "Requests & Offers",
      "Likes & Dislikes",
      "Opinions & Suggestions",
      "Agreement & Disagreement",
      "Apologies & Thanks",
      "Invitations & Arrangements",
      "Problems & Help",
      "Goodbye & Closing Conversations",
    ],
  },
  {
    kind: "conversation",
    table: "conversation_categories",
    names: [
      "Meeting Someone",
      "Greetings & Small Talk",
      "Self Introduction",
      "Friends & Family",
      "Workplace Conversations",
      "Phone Conversations",
      "Shopping & Payments",
      "Food & Restaurants",
      "Travel & Transportation",
      "Asking for Help",
      "Making Plans",
      "Everyday Problems",
    ],
  },
  {
    kind: "presentation",
    table: "presentation_categories",
    names: [
      "Self Introduction",
      "Daily Routine",
      "Personal Experiences",
      "People & Relationships",
      "Places & Environment",
      "Work & Career",
      "Hobbies & Interests",
      "Opinions & Ideas",
      "Events & Occasions",
      "Storytelling",
    ],
  },
  {
    kind: "listening",
    table: "listening_categories",
    names: [
      "Greetings & Small Talk",
      "Self Introduction",
      "Daily Routine",
      "Family & Friends",
      "Workplace & Office",
      "Shopping & Restaurants",
      "Travel & Transportation",
      "Experiences & Events",
      "Problems & Solutions",
      "Stories & Descriptions",
    ],
  },
];

async function seedCategoryList({ kind, table, names }: CategoryList) {
  const rowsBefore = await countCategories(kind);
  const existingNames = new Set(
    (await findCategoryRows(kind)).map((row) => row.name),
  );

  const kept: string[] = [];
  let created = 0;

  for (const [index, name] of names.entries()) {
    if (existingNames.has(name)) {
      kept.push(name);
      continue;
    }

    await createCategory(kind, { name, sequence: index + 1 });
    created += 1;
  }

  const rowsAfter = await countCategories(kind);

  console.log(
    `${table}: ${created} created, ${kept.length} already existed — ${rowsBefore} rows before, ${rowsAfter} after.`,
  );

  if (kept.length > 0) {
    console.log(`  left as they are: ${kept.join(", ")}`);
  }
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
