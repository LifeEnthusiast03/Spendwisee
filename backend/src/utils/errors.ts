import { Response } from "express";

// ─── AppError base ────────────────────────────────────────────────────────────

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

// ─── Convenience subclasses ───────────────────────────────────────────────────

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

// ─── Prisma P2025 helper ──────────────────────────────────────────────────────

type PrismaKnownError = { code?: string };

export const isPrismaKnownError = (err: unknown): err is PrismaKnownError => {
  return typeof err === "object" && err !== null && "code" in err;
};

// ─── Controller error-response helper ────────────────────────────────────────

export function handleControllerError(
  res: Response,
  err: unknown,
  fallbackMessage: string
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error(err);
  return res.status(500).json({ message: fallbackMessage });
}
