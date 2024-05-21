import Image from "next/image";
import Link from "next/link";
import { BlogQueryResult } from "./types";
import { createClient } from "contentful";
import Navbar from "../app/articles/[slug]/Navbar";
import Footer from "../app/articles/[slug]/Footer";
import { EntryCollection } from "contentful";

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

const getBlogEntries = async (): Promise<BlogQueryResult> => {
  const entries: EntryCollection<any> = await client.getEntries({
    content_type: "test",
  });
  const items: any = entries.items.map((entry) => ({
    fields: entry.fields,
  }));
  return { items };
};
export default async function Home() {
  const blogEntries = await getBlogEntries();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogEntries.items.map((singlePost) => {
            const { slug, title, date, thumbnail } = singlePost.fields;
            return (
              <div
                key={slug}
                className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col w-full h-full"
              >
                <Link className="group block h-full" href={`/articles/${slug}`}>
                  {thumbnail && (
                    <div className="relative w-full h-52">
                      <Image
                        src={`https:${thumbnail.fields.file.url}`}
                        alt={title}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-grow">
                    <h2 className="font-extrabold text-xl group-hover:text-blue-500 transition-colors mb-2">
                      {title}
                    </h2>
                    <span className="text-slate-400 mb-4">
                      Posted on{" "}
                      {new Date(date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
