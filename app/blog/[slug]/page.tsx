import { client } from "@/app/lib/sanity";

// Allow params to be a plain object or a promise that resolves to the object.
interface PostPageProps {
  params: { slug: string } | Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await client.fetch(`*[_type == "post"]{ "slug": slug.current }`);
  return slugs.map((post: { slug: string }) => ({ slug: post.slug }));
}

async function getPost(slug: string) {
  try {
    return await client.fetch(
      `*[_type == "post" && slug.current == $slug][0]{
        title,
        publishedAt,
        mainImage{ asset->{url} },
        body
      }`,
      { slug }
    );
  } catch (error) {
    console.error("Sanity Fetch Error:", error);
    return null;
  }
}

export default async function PostPage({ params }: PostPageProps) {
  // Await params in case it's a promise.
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return <h1>Post Not Found</h1>;
  }

  return (
    <div>
      <h1>{post.title}</h1>
      {post.mainImage?.asset?.url && (
        <img src={post.mainImage.asset.url} alt={post.title} width="800" />
      )}
      <p>Published on: {new Date(post.publishedAt).toISOString().split("T")[0]}</p>
      <div>
        {post.body?.map((block: any, index: number) => (
          <p key={index}>{block?.children?.[0]?.text}</p>
        ))}
      </div>
    </div>
  );
}
