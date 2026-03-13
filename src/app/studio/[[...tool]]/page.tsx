"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
