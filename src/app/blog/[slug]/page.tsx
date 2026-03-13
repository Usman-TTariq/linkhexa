import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, getAllPosts } from "@/sanity/queries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogPostContent from "./BlogPostContent";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} | LinkHexa Blog`,
    description: post.excerpt,
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug.current }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <Navbar />
      <main>
        <BlogPostContent post={post} />
      </main>
      <Footer />
    </>
  );
}
