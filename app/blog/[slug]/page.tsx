import { client } from "@/app/lib/sanity";

// ✅ Ensure correct type
interface PageProps {
  params: { slug: string };
}

// ✅ Fetch static params for pre-rendering
export async function generateStaticParams() {
  const slugs = await client.fetch(`*[_type == "post"]{ "slug": slug.current }`);
  return slugs.map((post: { slug: string }) => ({ slug: post.slug }));
}

// ✅ Fetch post data
async function getPost(slug: string) {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
      title,
      publishedAt,
      mainImage{ asset->{url} },
      body
    }`,
    { slug }
  );
}

// ✅ Server Component for Blog Post Page
export default async function PostPage({ params }: PageProps) {
  const post = await getPost(params.slug);

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
