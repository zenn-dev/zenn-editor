import Express from 'express';
import fetch from 'node-fetch';
import markdownToHtml from 'zenn-markdown-html';
import matter from 'gray-matter';

export async function getCliGuide(req: Express.Request, res: Express.Response) {
  const slug = req.params.slug;
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/zenn-dev/zenn-docs/master/articles/${slug}.md`
    );
    const raw = await response.text();
    const { content, data } = matter(raw);
    const title = typeof data?.title === 'string' ? data.title : undefined;
    const html = markdownToHtml(content);
    res.setHeader('Cache-Control', 'public, max-age=7200'); // cache on browser
    res.json({ html, title });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'エラー' });
  }
}
