import { client } from "./client";

export interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  publishedAt: string;
  body: unknown[];
  mainImage?: {
    asset: { _ref: string; _type: string; url?: string };
    alt?: string;
  };
}

const postFields = `
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  body,
  mainImage { asset->{url}, alt }
`;

export async function getAllPosts(): Promise<Post[]> {
  try {
    return await client.fetch(
      `*[_type == "post"] | order(publishedAt desc) { ${postFields} }`
    );
  } catch {
    return [];
  }
}

export async function getLatestPosts(count = 3): Promise<Post[]> {
  try {
    return await client.fetch(
      `*[_type == "post"] | order(publishedAt desc) [0...$count] { ${postFields} }`,
      { count }
    );
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    return await client.fetch(
      `*[_type == "post" && slug.current == $slug][0] { ${postFields} }`,
      { slug }
    );
  } catch {
    return null;
  }
}
