"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getLatestPosts, type Post } from "@/sanity/queries";
import { getAllStaticPostsForList } from "@/data/blogPosts";

type ListPost = Post;

function mergeAndSort(staticPosts: ListPost[], sanityPosts: Post[]): ListPost[] {
  const combined = [...staticPosts, ...sanityPosts];
  return combined.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export default function BlogPreview() {
  const [posts, setPosts] = useState<ListPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const staticPosts = getAllStaticPostsForList();
    getLatestPosts(10)
      .then((sanityPosts) => mergeAndSort(staticPosts, sanityPosts))
      .then((merged) => setPosts(merged.slice(0, 3)))
      .finally(() => setLoading(false));
  }, []);

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

        {loading ? (
          <div className="mt-10 grid gap-6 sm:mt-16 sm:gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl border border-white/5 bg-zinc-800/50"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="mt-10 text-center text-zinc-500 sm:mt-16">
            No posts yet. Check back soon!
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:mt-16 sm:gap-8 md:grid-cols-3">
            {posts.map((post, i) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="h-full"
              >
                <Link
                  href={`/blog/${post.slug.current}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 glass transition-all hover:border-white/10"
                >
                  {post.mainImage?.asset?.url && (
                    <div className="aspect-[16/9] w-full overflow-hidden">
                      <Image
                        src={post.mainImage.asset.url}
                        alt={post.mainImage.alt || post.title}
                        width={600}
                        height={338}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-sm text-zinc-500">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
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
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
