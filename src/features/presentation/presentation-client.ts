interface ApiPayload<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export class PresentationRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PresentationRequestError";
  }
}

export async function presentationRequest<T>(
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
    throw new PresentationRequestError(
      payload?.message ?? "Something went wrong. Please try again.",
    );
  }

  return payload.data as T;
}
