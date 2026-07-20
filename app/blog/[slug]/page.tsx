import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { LinkCardGrid } from "@/components/shared/LinkCardGrid";
import { AdSlot } from "@/components/ads/AdSlot";
import { prisma } from "@/lib/prisma";
import { excerpt } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { TOOLS } from "@/lib/tools-directory";

export const revalidate = 3600;

interface BlogPageParams {
  slug: string;
}

async function getPost(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug } });
}

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({ select: { slug: true } });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<BlogPageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const description = excerpt(post.content);
  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${post.title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
    },
    twitter: {
      card: "summary",
      title: `${post.title} | ${SITE_NAME}`,
      description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<BlogPageParams>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const otherPosts = await prisma.blogPost.findMany({
    where: { slug: { not: post.slug } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const paragraphs = post.content.split("\n\n").filter(Boolean);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.publishedAt.toISOString(),
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />

      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {post.publishedAt.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <article className="mt-8 space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="leading-relaxed text-muted-foreground">
            {paragraph}
          </p>
        ))}
      </article>

      <div className="mt-10">
        <AdSlot slot={`blog-${post.slug}-in-content`} format="in-content" />
      </div>

      <LinkCardGrid
        heading="More articles"
        items={otherPosts.map((related) => ({
          href: `/blog/${related.slug}`,
          title: related.title,
        }))}
      />

      <LinkCardGrid
        heading="Related tools"
        items={TOOLS.map((tool) => ({
          href: tool.href,
          title: tool.title,
          subtitle: tool.subtitle,
          badge: tool.status === "coming-soon" ? "Coming soon" : undefined,
        }))}
      />
    </div>
  );
}
