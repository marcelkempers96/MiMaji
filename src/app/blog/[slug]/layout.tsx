import type { Metadata } from "next";
import { getBlogPost } from "@/data/blogPosts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "This blog post does not exist.",
    };
  }

  const description =
    post.excerpt.length > 160 ? post.excerpt.slice(0, 157) + "..." : post.excerpt;

  const ogImages = post.heroImage
    ? [
        {
          url: post.heroImage,
          alt: post.heroImageAlt || post.title,
        },
      ]
    : undefined;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedDate,
      authors: [post.author],
      tags: [post.category],
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.heroImage ? [post.heroImage] : undefined,
    },
  };
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
