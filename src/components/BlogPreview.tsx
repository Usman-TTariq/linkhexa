"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const posts = [
  {
    title: "How we reduced support tickets by 40% with automation",
    excerpt:
      "A deep dive into the workflows we built to triage and resolve common requests automatically.",
    date: "Mar 8, 2025",
    slug: "#",
  },
  {
    title: "Building your first no-code integration in 10 minutes",
    excerpt:
      "Step-by-step guide to connecting your first app and triggering your first automation.",
    date: "Mar 5, 2025",
    slug: "#",
  },
  {
    title: "The state of SaaS automation in 2025",
    excerpt:
      "Trends, benchmarks, and predictions from our annual survey of 2,000+ teams.",
    date: "Mar 1, 2025",
    slug: "#",
  },
];

export default function BlogPreview() {
  return (
    <section id="blog" className="relative py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-400 sm:text-sm">
            Blog
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:mt-4 sm:text-3xl lg:text-4xl">
            Latest from our blog
          </h2>
          <p className="mt-3 text-base text-zinc-400 sm:mt-4 sm:text-lg">
            Tips, tutorials, and updates from the LinkHexa team.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-6 sm:mt-16 sm:gap-8 md:grid-cols-3">
          {posts.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="h-full"
            >
              <Link
                href={post.slug}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 glass p-6 transition-all hover:border-white/10"
              >
                <span className="text-sm text-zinc-500">{post.date}</span>
                <h3 className="mt-2 text-base font-semibold text-white transition-colors group-hover:text-indigo-400 sm:text-lg">
                  {post.title}
                </h3>
                <p className="mt-2 flex-1 text-zinc-400">{post.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-400">
                  Read more
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
