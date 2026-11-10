import type { CategoryKind } from "@/types/category";

interface ApiPayload<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export class CategoryRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CategoryRequestError";
  }
}

export function categoryPath(kind: CategoryKind, id?: string): string {
  return id
    ? `/api/categories/${kind}/${id}`
    : `/api/categories/${kind}`;
}

export async function categoryRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(path, {
    ...init,
    headers,
    cache: "no-store",
    credentials: "same-origin",
  });

  const payload = (await response
    .json()
    .catch(() => null)) as ApiPayload<T> | null;

  if (!response.ok || !payload?.success) {
    throw new CategoryRequestError(
      payload?.message ?? "Something went wrong. Please try again.",
    );
  }

  return payload.data as T;
}
