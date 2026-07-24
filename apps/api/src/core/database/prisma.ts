import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function checkDatabase(): Promise<"ok" | "unavailable"> {
  if (!process.env.DATABASE_URL) {
    return "unavailable";
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return "ok";
  } catch {
    return "unavailable";
  }
}
