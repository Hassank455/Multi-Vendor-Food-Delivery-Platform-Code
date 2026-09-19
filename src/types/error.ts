export interface AppError extends Error {
  statusCode: number;
  code?: string; // Prisma or custom code
  meta?: unknown; // Prisma meta or anything else
  errors?: { [key: string]: string };
  isOperational?: boolean;
}
