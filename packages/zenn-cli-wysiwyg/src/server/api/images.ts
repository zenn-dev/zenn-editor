import Express from 'express';
import path from 'path';

export function postImage(req: Express.Request, res: Express.Response) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  return res.json({ url: path.join('/', file.destination, file.filename) });
}
