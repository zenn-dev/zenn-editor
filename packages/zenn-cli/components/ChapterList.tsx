import Link from "next/link";
import { Chapter } from "@types";

type Props = { bookSlug: string; chapters: Chapter[] };

export const ChapterList: React.FC<Props> = ({ chapters, bookSlug }) => {
  return (
    <div>
      <ul>
        {chapters.map((chapter) => {
          const realPath = `/books/${bookSlug}/${chapter.position}`;
          return (
            <li key={`ch${chapter.position}`}>
              <Link href="/books/[slug]/[position]" as={realPath}>
                <a href={realPath}>
                  {chapter.title || `${chapter.position}.md`}
                </a>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
