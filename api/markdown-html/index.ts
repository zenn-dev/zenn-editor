// todo: req res type
// ref: https://expressjs.com/en/api.html#req
export const markdownHtml = async (req: any, res: any) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }

  if (req.get("content-type") !== "application/json") {
    res.status(400).send({ message: "Invalid Content Type" });
    return;
  }

  if (req.method !== "POST") {
    res.status(403).send({ message: "Invalid Method" });
    return;
  }

  const markdown = req.body.markdown;

  if (!markdown) {
    res.status(400).send({ message: "マークダウンが含まれていません" });
    return;
  }

  let html;
  if (req.query.comment) {
    const { markdownToCommentHtml } = await import(
      "zenn-markdown-html/lib/comment"
    );
    html = markdownToCommentHtml(markdown);
  } else {
    const { default: markdownToHtml } = await import("zenn-markdown-html");
    html = markdownToHtml(markdown);
  }
  res.json({ html });
};
