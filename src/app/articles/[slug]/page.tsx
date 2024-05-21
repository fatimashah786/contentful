import { BlogItem } from "@/app/types";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { createClient } from "contentful";
import Image from "next/image"; // Import Image from next/image

const SPACE_ID = process.env.SPACE_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

if (!SPACE_ID || !ACCESS_TOKEN) {
  throw new Error(
    "Space ID or Access Token is missing. Please check your environment variables."
  );
}

const client = createClient({
  space: SPACE_ID,
  accessToken: ACCESS_TOKEN,
});

type BlogPageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const queryOptions = {
    content_type: "test",
    select: "fields.slug",
  };

  const articles = await client.getEntries(queryOptions);
  return articles.items.map((article) => ({
    slug: article.fields.slug,
  }));
}

const fetchBlogPost = async (slug: string): Promise<BlogItem> => {
  const queryOptions = {
    content_type: "test",
    "fields.slug[match]": slug,
  };
  const queryResult = await client.getEntries(queryOptions);
  const entry = queryResult.items[0];

  if (!entry) {
    throw new Error(`No blog post found for slug: ${slug}`);
  }

  const { title, slug: postSlug, date, content, thumbnail } = entry.fields;

  const blogItem: BlogItem = {
    fields: {
      title: title as string,
      slug: postSlug as string,
      date: new Date(date as string),
      content: content as any,
      thumbnail: thumbnail ?? null,
    },
  };

  return blogItem;
};

export default async function BlogPage(props: BlogPageProps) {
  const { params } = props;
  const { slug } = params;
  const article = await fetchBlogPost(slug);
  const { title, date, content, thumbnail } = article.fields;

  return (
    <main className="min-h-screen p-6 flex justify-center bg-gray-100">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
        {thumbnail && (
          <div className="relative w-full h-60 mb-4">
            <Image
              src={`https:${thumbnail.fields.file.url}`}
              alt={title}
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg h-full w-full"
            />
          </div>
        )}
        <h1 className="font-extrabold text-3xl mb-2">{title}</h1>
        <p className="mb-6 text-slate-400">
          Posted on{" "}
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="[&>p]:mb-8 [&>h2]:font-extrabold">
          {documentToReactComponents(content)}
        </div>
      </div>
    </main>
  );
}
