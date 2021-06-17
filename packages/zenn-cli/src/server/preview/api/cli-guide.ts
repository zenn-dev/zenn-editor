import Express from 'express';
import fetch from 'node-fetch';
import markdownToHtml from 'zenn-markdown-html';
import matter from 'gray-matter';
const guideMdUrl = `https://raw.githubusercontent.com/zenn-dev/zenn-docs/master/articles/zenn-cli-guide.md`;

export async function getCliGuide(
  _req: Express.Request,
  res: Express.Response
) {
  try {
    const response = await fetch(guideMdUrl);
    const raw = await response.text();
    const { content } = matter(raw);
    const html = markdownToHtml(content);
    res.setHeader('Cache-Control', 'public, max-age=7200'); // cache on browser
    res.json({ html });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'エラー' });
  }
}
