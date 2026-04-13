import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { pagesSchema } from "../content/pages.schema";
import { resolveAppContentPath } from "../content/AppContentPathResolver";

const activeApp = process.env.APP ?? "default-fachada";

const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    stack: z.array(z.string()),
    date: z.coerce.date(),
    featured: z.boolean().default(false),
    liveUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    coverImage: z.string(),
    roles: z.array(z.string()).optional(),
  }),
});

const blog = defineCollection({
  loader: glob({
    pattern: "*.md",
    base: resolveAppContentPath(activeApp, "blog"),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    coverImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({
    pattern: "*.md",
    base: resolveAppContentPath(activeApp, "pages"),
  }),
  schema: pagesSchema,
});

export const collections = {
  projects,
  blog,
  pages,
};
