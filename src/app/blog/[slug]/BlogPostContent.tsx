"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import type { Post } from "@/sanity/queries";

export default function BlogPostContent({ post }: { post: Post }) {
  return (
    <article className="relative py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-indigo-400"
          >
            <span className="transition-transform hover:-translate-x-1">←</span>
            Back to blog
          </Link>

          {post.mainImage?.asset?.url && (
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/5">
              <Image
                src={post.mainImage.asset.url}
                alt={post.mainImage.alt || post.title}
                width={1200}
                height={630}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          )}

          <div className="mt-8">
            <time className="text-sm text-zinc-500">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-zinc-400">{post.excerpt}</p>
          </div>

          <div className="prose-invert mt-12 max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white prose-p:text-zinc-300 prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-li:text-zinc-300 prose-img:rounded-2xl">
            <PortableText value={post.body as never} />
          </div>
        </motion.div>
      </div>
    </article>
  );
}
