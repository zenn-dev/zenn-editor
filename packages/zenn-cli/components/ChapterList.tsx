import Link from "next/link";
import { Chapter } from "@types";

type Props = { bookSlug: string; chapters: Chapter[] };

export const ChapterList: React.FC<Props> = ({ chapters, bookSlug }) => {
  return (
    <div>
      <ol>
        {chapters.map((chapter) => {
          return (
            <li key={`ch${chapter.position}`}>
              <Link
                href="/books/[slug]/[position]"
                as={`/books/${bookSlug}/${chapter.position}`}
                passHref
              >
                <a>{chapter.title || `${chapter.position}.md`}</a>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
