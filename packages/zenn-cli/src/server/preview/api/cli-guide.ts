import Express from 'express';
import fetch from 'node-fetch';

type ArticleResponse = { article: { title: string; body_html: string } };

export async function getCliGuide(req: Express.Request, res: Express.Response) {
  const slug = req.params.slug;
  try {
    const response = await fetch(`https://zenn.dev/api/articles/${slug}`);
    const { article }: ArticleResponse = await response.json();
    const { body_html, title } = article;
    res.setHeader('Cache-Control', 'public, max-age=7200'); // cache on browser
    res.json({ bodyHtml: body_html, title });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'エラー' });
  }
}
