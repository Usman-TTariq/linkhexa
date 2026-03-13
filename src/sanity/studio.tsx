"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schema } from "./schema";

const config = defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  basePath: "/studio",
  schema,
  plugins: [structureTool()],
});

export default config;
