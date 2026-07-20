import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { prisma } from "@/lib/prisma";
import { excerpt } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const revalidate = 3600;

const TITLE = "Railway Booking Guides & Articles";
const DESCRIPTION =
  "Plain-language guides to current booking, chart preparation, Tatkal, waiting lists, and how Indian Railways reservation actually works.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: `${SITE_URL}/blog`,
    siteName: SITE_NAME,
    type: "website",
  },
};

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />

      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Railway Booking Guides & Articles
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
        Plain-language explainers on how current booking, chart preparation, Tatkal, and
        waiting lists actually work.
      </p>

      <div className="mt-8 space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block rounded-md border border-border p-5 transition-colors hover:border-primary/40 hover:bg-muted/40"
          >
            <p className="text-lg font-medium text-foreground">{post.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {excerpt(post.content)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {post.publishedAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
