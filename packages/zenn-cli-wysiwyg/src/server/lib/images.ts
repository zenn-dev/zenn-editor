import * as Express from 'express';

import multer from 'multer';
import { validateSlug } from 'common/helper';
import fs from 'fs-extra';
import { getWorkingPath } from './helper';

const storage = multer.diskStorage({
  destination: function (req, __, cb) {
    if (!validateSlug(req.params.slug)) {
      return cb(
        new Error(
          `slugの値（${req.params.slug}）が不正です。マークダウンのファイル名を修正して、再度アップロードしてください。`
        ),
        ''
      );
    }

    const p = `images/${req.params.slug}`;
    fs.mkdirsSync(getWorkingPath(p));
    cb(null, p);
  },
  filename: function (_, file, cb) {
    const uniqueID = crypto.randomUUID();
    const ext = file.originalname.split('.').pop();
    cb(null, uniqueID + '.' + ext);
  },
});

const uploadImageMulter = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
}).single('image');

export function uploadImageMiddleware(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  uploadImageMulter(req, res, function (err) {
    if (err) {
      return res.status(400).json({
        message: err.message,
      });
    }

    next();
  });
}
