import * as cheerio from 'cheerio';

type Toc = {
  text: string;
  id: string;
  level: number;
  children: Toc[];
};

// WYSIWYG エディタに必要な見出しID一覧を取得
export function parseHeadingIds(html: string): string[] {
  const $ = cheerio.load(html);
  const headings = $('body > h1, body > h2, body > h3').toArray();
  return headings.map((heading) => heading.attribs.id);
}

export function parseToc(html: string): Toc[] {
  const $ = cheerio.load(html);
  const headings = $('body > h1, body > h2, body > h3').toArray();
  const headingsToc = headings.map((heading) => ({
    level: parseInt(heading.name.slice(1), 10),

    // eslint-disable-next-line no-control-regex
    text: $(heading).text().replace(/\x08/g, '').trim(),

    id: heading.attribs.id,
    children: [],
  }));

  // 先頭に出現したHeadingタグは最上位の階層とする
  // 以降に出現したHeadingタグは、最上位の階層の最後のHeadingタグのレベルと比較して同じか大きければ末尾に追加、
  // 小さい場合は一つ下の階層で同様の判定を行う。最下位の階層の最後のHeadingタグのレベルよりも低い場合は、さらに下の階層に追加する。
  return headingsToc.reduce((acc: Toc[], current: Toc): Toc[] => {
    let array = acc; // current TOC を投入するターゲットとなる配列。トップレベルから初めて条件を満たすたびにネストする
    do {
      if (
        array.length === 0 ||
        array[array.length - 1].level >= current.level
      ) {
        // ターゲット配列が空（最初のheadings）のときはcurrentを先頭に追加
        // ターゲット配列の末尾レベルがcurrentと比べて同じか大きければarrayの末尾に追加
        break;
      }

      // それ以外の場合は走査するarrayを末尾のchildrenにする
      array = array[array.length - 1].children;

      // eslint-disable-next-line no-constant-condition
    } while (true);

    array.push(current);
    return acc;
  }, []);
}
