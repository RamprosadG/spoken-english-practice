import prisma from "@/lib/prisma";
import type { CategoryKind, CategoryOption, CategoryRow } from "@/server/types/category";

export interface CategoryWriteData {
  name: string;
  sequence: number;
}

/**
 * Each library has its own category table, so every read and write dispatches on
 * the kind instead of sharing one table with a type column. The shapes are
 * normalised here so callers never see which Prisma model answered. The interview
 * library is the only one with two lookup tables — categories and topics — and the
 * topic picker is managed through this same module.
 */
const CATEGORY_LIST_ORDER = [
  { sequence: "asc" as const },
  { createdAt: "asc" as const },
];

export async function findCategoryOptions(
  kind: CategoryKind,
): Promise<CategoryOption[]> {
  if (kind === "presentation") {
    return prisma.presentationCategory.findMany({
      orderBy: CATEGORY_LIST_ORDER,
      select: { id: true, name: true },
    });
  }

  if (kind === "sentence") {
    return prisma.sentenceCategory.findMany({
      orderBy: CATEGORY_LIST_ORDER,
      select: { id: true, name: true },
    });
  }

  if (kind === "conversation") {
    return prisma.conversationCategory.findMany({
      orderBy: CATEGORY_LIST_ORDER,
      select: { id: true, name: true },
    });
  }

  if (kind === "listening") {
    return prisma.listeningCategory.findMany({
      orderBy: CATEGORY_LIST_ORDER,
      select: { id: true, name: true },
    });
  }

  if (kind === "interview") {
    return prisma.interviewCategory.findMany({
      orderBy: CATEGORY_LIST_ORDER,
      select: { id: true, name: true },
    });
  }

  return prisma.interviewTopic.findMany({
    orderBy: CATEGORY_LIST_ORDER,
    select: { id: true, name: true },
  });
}

export async function findCategoryRows(kind: CategoryKind): Promise<CategoryRow[]> {
  if (kind === "presentation") {
    const rows = await prisma.presentationCategory.findMany({
      orderBy: CATEGORY_LIST_ORDER,
      select: {
        id: true,
        name: true,
        sequence: true,
        _count: { select: { presentations: true } },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      sequence: row.sequence,
      usageCount: row._count.presentations,
    }));
  }

  if (kind === "sentence") {
    const rows = await prisma.sentenceCategory.findMany({
      orderBy: CATEGORY_LIST_ORDER,
      select: {
        id: true,
        name: true,
        sequence: true,
        _count: { select: { sentences: true } },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      sequence: row.sequence,
      usageCount: row._count.sentences,
    }));
  }

  if (kind === "conversation") {
    const rows = await prisma.conversationCategory.findMany({
      orderBy: CATEGORY_LIST_ORDER,
      select: {
        id: true,
        name: true,
        sequence: true,
        _count: { select: { conversations: true } },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      sequence: row.sequence,
      usageCount: row._count.conversations,
    }));
  }

  if (kind === "listening") {
    const rows = await prisma.listeningCategory.findMany({
      orderBy: CATEGORY_LIST_ORDER,
      select: {
        id: true,
        name: true,
        sequence: true,
        _count: { select: { listenings: true } },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      sequence: row.sequence,
      usageCount: row._count.listenings,
    }));
  }

  if (kind === "interview") {
    const rows = await prisma.interviewCategory.findMany({
      orderBy: CATEGORY_LIST_ORDER,
      select: {
        id: true,
        name: true,
        sequence: true,
        _count: { select: { interviewQuestions: true } },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      sequence: row.sequence,
      usageCount: row._count.interviewQuestions,
    }));
  }

  const rows = await prisma.interviewTopic.findMany({
    orderBy: CATEGORY_LIST_ORDER,
    select: {
      id: true,
      name: true,
      sequence: true,
      _count: { select: { interviewQuestions: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    sequence: row.sequence,
    usageCount: row._count.interviewQuestions,
  }));
}

export async function findCategoryById(
  kind: CategoryKind,
  id: string,
): Promise<{ id: string; name: string; sequence: number } | null> {
  const select = { id: true, name: true, sequence: true } as const;

  if (kind === "presentation") {
    return prisma.presentationCategory.findUnique({ where: { id }, select });
  }

  if (kind === "sentence") {
    return prisma.sentenceCategory.findUnique({ where: { id }, select });
  }

  if (kind === "conversation") {
    return prisma.conversationCategory.findUnique({ where: { id }, select });
  }

  if (kind === "listening") {
    return prisma.listeningCategory.findUnique({ where: { id }, select });
  }

  if (kind === "interview") {
    return prisma.interviewCategory.findUnique({ where: { id }, select });
  }

  return prisma.interviewTopic.findUnique({ where: { id }, select });
}

export async function countCategoryUsage(
  kind: CategoryKind,
  id: string,
): Promise<number> {
  if (kind === "presentation") {
    return prisma.presentation.count({ where: { categoryId: id } });
  }

  if (kind === "sentence") {
    return prisma.sentence.count({ where: { categoryId: id } });
  }

  if (kind === "conversation") {
    return prisma.conversation.count({ where: { categoryId: id } });
  }

  if (kind === "listening") {
    return prisma.listening.count({ where: { categoryId: id } });
  }

  if (kind === "interview") {
    return prisma.interviewQuestion.count({ where: { categoryId: id } });
  }

  return prisma.interviewQuestion.count({ where: { topicId: id } });
}

export function countCategories(kind: CategoryKind): Promise<number> {
  if (kind === "presentation") {
    return prisma.presentationCategory.count();
  }

  if (kind === "sentence") {
    return prisma.sentenceCategory.count();
  }

  if (kind === "conversation") {
    return prisma.conversationCategory.count();
  }

  if (kind === "listening") {
    return prisma.listeningCategory.count();
  }

  if (kind === "interview") {
    return prisma.interviewCategory.count();
  }

  return prisma.interviewTopic.count();
}

function nextSequenceOf(latest: { sequence: number } | null): number {
  return (latest?.sequence ?? 0) + 1;
}

export async function findNextCategorySequence(
  kind: CategoryKind,
): Promise<number> {
  const select = { sequence: true } as const;
  const orderBy = { sequence: "desc" as const };

  if (kind === "presentation") {
    return nextSequenceOf(
      await prisma.presentationCategory.findFirst({ orderBy, select }),
    );
  }

  if (kind === "sentence") {
    return nextSequenceOf(
      await prisma.sentenceCategory.findFirst({ orderBy, select }),
    );
  }

  if (kind === "conversation") {
    return nextSequenceOf(
      await prisma.conversationCategory.findFirst({ orderBy, select }),
    );
  }

  if (kind === "listening") {
    return nextSequenceOf(
      await prisma.listeningCategory.findFirst({ orderBy, select }),
    );
  }

  if (kind === "interview") {
    return nextSequenceOf(
      await prisma.interviewCategory.findFirst({ orderBy, select }),
    );
  }

  return nextSequenceOf(
    await prisma.interviewTopic.findFirst({ orderBy, select }),
  );
}

export async function createCategory(
  kind: CategoryKind,
  data: CategoryWriteData,
): Promise<CategoryRow> {
  if (kind === "presentation") {
    const row = await prisma.presentationCategory.create({
      data,
      select: {
        id: true,
        name: true,
        sequence: true,
        _count: { select: { presentations: true } },
      },
    });

    return {
      id: row.id,
      name: row.name,
      sequence: row.sequence,
      usageCount: row._count.presentations,
    };
  }

  if (kind === "sentence") {
    const row = await prisma.sentenceCategory.create({
      data,
      select: {
        id: true,
        name: true,
        sequence: true,
        _count: { select: { sentences: true } },
      },
    });

    return {
      id: row.id,
      name: row.name,
      sequence: row.sequence,
      usageCount: row._count.sentences,
    };
  }

  if (kind === "conversation") {
    const row = await prisma.conversationCategory.create({
      data,
      select: {
        id: true,
        name: true,
        sequence: true,
        _count: { select: { conversations: true } },
      },
    });

    return {
      id: row.id,
      name: row.name,
      sequence: row.sequence,
      usageCount: row._count.conversations,
    };
  }

  if (kind === "listening") {
    const row = await prisma.listeningCategory.create({
      data,
      select: {
        id: true,
        name: true,
        sequence: true,
        _count: { select: { listenings: true } },
      },
    });

    return {
      id: row.id,
      name: row.name,
      sequence: row.sequence,
      usageCount: row._count.listenings,
    };
  }

  if (kind === "interview") {
    const row = await prisma.interviewCategory.create({
      data,
      select: {
        id: true,
        name: true,
        sequence: true,
        _count: { select: { interviewQuestions: true } },
      },
    });

    return {
      id: row.id,
      name: row.name,
      sequence: row.sequence,
      usageCount: row._count.interviewQuestions,
    };
  }

  const row = await prisma.interviewTopic.create({
    data,
    select: {
      id: true,
      name: true,
      sequence: true,
      _count: { select: { interviewQuestions: true } },
    },
  });

  return {
    id: row.id,
    name: row.name,
    sequence: row.sequence,
    usageCount: row._count.interviewQuestions,
  };
}

export async function updateCategory(
  kind: CategoryKind,
  id: string,
  data: CategoryWriteData,
): Promise<CategoryRow> {
  if (kind === "presentation") {
    const row = await prisma.presentationCategory.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        sequence: true,
        _count: { select: { presentations: true } },
      },
    });

    return {
      id: row.id,
      name: row.name,
      sequence: row.sequence,
      usageCount: row._count.presentations,
    };
  }

  if (kind === "sentence") {
    const row = await prisma.sentenceCategory.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        sequence: true,
        _count: { select: { sentences: true } },
      },
    });

    return {
      id: row.id,
      name: row.name,
      sequence: row.sequence,
      usageCount: row._count.sentences,
    };
  }

  if (kind === "conversation") {
    const row = await prisma.conversationCategory.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        sequence: true,
        _count: { select: { conversations: true } },
      },
    });

    return {
      id: row.id,
      name: row.name,
      sequence: row.sequence,
      usageCount: row._count.conversations,
    };
  }

  if (kind === "listening") {
    const row = await prisma.listeningCategory.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        sequence: true,
        _count: { select: { listenings: true } },
      },
    });

    return {
      id: row.id,
      name: row.name,
      sequence: row.sequence,
      usageCount: row._count.listenings,
    };
  }

  if (kind === "interview") {
    const row = await prisma.interviewCategory.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        sequence: true,
        _count: { select: { interviewQuestions: true } },
      },
    });

    return {
      id: row.id,
      name: row.name,
      sequence: row.sequence,
      usageCount: row._count.interviewQuestions,
    };
  }

  const row = await prisma.interviewTopic.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      sequence: true,
      _count: { select: { interviewQuestions: true } },
    },
  });

  return {
    id: row.id,
    name: row.name,
    sequence: row.sequence,
    usageCount: row._count.interviewQuestions,
  };
}

export function deleteCategory(kind: CategoryKind, id: string): Promise<unknown> {
  if (kind === "presentation") {
    return prisma.presentationCategory.delete({ where: { id } });
  }

  if (kind === "sentence") {
    return prisma.sentenceCategory.delete({ where: { id } });
  }

  if (kind === "conversation") {
    return prisma.conversationCategory.delete({ where: { id } });
  }

  if (kind === "listening") {
    return prisma.listeningCategory.delete({ where: { id } });
  }

  if (kind === "interview") {
    return prisma.interviewCategory.delete({ where: { id } });
  }

  return prisma.interviewTopic.delete({ where: { id } });
}
