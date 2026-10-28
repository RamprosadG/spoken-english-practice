import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * The unique keys on presentation title, sentence text and vocabulary text are
 * the only guard against duplicate entries, so a race between two admins
 * surfaces as P2002 rather than a pre-check miss.
 */
export function uniqueViolationError(error: unknown, message: string): unknown {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return new ApiError(409, message);
  }

  return error;
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: error.issues[0]?.message ?? "Invalid request.",
      },
      { status: 400 },
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status },
    );
  }

  console.error("[api] Unhandled error:", error);

  return NextResponse.json(
    { success: false, message: "Internal server error. Please try again." },
    { status: 500 },
  );
}
