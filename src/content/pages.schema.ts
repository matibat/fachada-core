import { z } from "astro/zod";

export const pagesSchema = z.object({
  title: z.string(),
  description: z.string(),
  apps: z
    .union([z.array(z.string()), z.literal("*")])
    .optional()
    .default("*"),
  path: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  llmSummary: z.string().optional(),
  ogImage: z.string().optional(),
  downloadFilename: z.string().optional(),
  backLink: z.object({ href: z.string(), label: z.string() }).optional(),
  nextLink: z.object({ href: z.string(), label: z.string() }).optional(),
});
