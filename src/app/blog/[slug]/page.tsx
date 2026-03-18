import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, getAllPosts } from "@/sanity/queries";
import { getStaticPostBySlug, getAllStaticPosts } from "@/data/blogPosts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogPostContent from "./BlogPostContent";
import StaticBlogPostContent from "./StaticBlogPostContent";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const staticPost = getStaticPostBySlug(slug);
  if (staticPost) {
    return {
      title: `${staticPost.title} | LinkHexa Blog`,
      description: staticPost.excerpt,
    };
  }
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} | LinkHexa Blog`,
    description: post.excerpt,
  };
}

export async function generateStaticParams() {
  const staticSlugs = getAllStaticPosts().map((p) => ({ slug: p.slug }));
  const sanityPosts = await getAllPosts();
  const sanitySlugs = sanityPosts.map((p) => ({ slug: p.slug.current }));
  return [...staticSlugs, ...sanitySlugs];
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const staticPost = getStaticPostBySlug(slug);
  if (staticPost) {
    return (
      <>
        <Navbar />
        <main>
          <StaticBlogPostContent post={staticPost} />
        </main>
        <Footer />
      </>
    );
  }
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
