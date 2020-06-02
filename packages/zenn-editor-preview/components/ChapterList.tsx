import Link from "next/link";
import { Chapter } from "@types";

type ChapterListProps = { bookSlug: string; chapters: Chapter[] };

const ChapterList: React.FC<ChapterListProps> = ({ chapters, bookSlug }) => {
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

export default ChapterList;
