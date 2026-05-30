import { z } from "zod";

const ServerEnvSchema = z.object({
  API_BASE_URL: z.string().url().default("http://localhost:3000"),
});

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .default("")
    .refine((v) => v === "" || /^https?:\/\//.test(v), {
      message: "NEXT_PUBLIC_API_URL must be empty or an http(s) URL",
    }),
});

export const serverEnv = ServerEnvSchema.parse({
  API_BASE_URL: process.env.API_BASE_URL,
});

export const clientEnv = ClientEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

/** Returns the base URL the current execution context should call. */
export function apiBase(): string {
  if (typeof window === "undefined") return serverEnv.API_BASE_URL;
  return clientEnv.NEXT_PUBLIC_API_URL; // "" → same-origin via Next.js rewrites
}
