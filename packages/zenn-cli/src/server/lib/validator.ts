import cheerio from 'cheerio';
import path from 'path';
import url from 'url';
import { ValidationError } from '../../common/types';

export function validateHtml(html: string): ValidationError[] {
  const $ = cheerio.load(html);
  const errors = $('img')
    .map((i, el) => {
      const src = el.attribs['src'];
      // srcがURLの場合はチェックしない
      if (isUrl(src)) return null;

      // 先頭が `/images/` であること
      if (!path.isAbsolute(src)) {
        return {
          message: `不正な画像のパスが検出されました: '${src}'. ローカルの画像を指定する場合は、パスを '/images/*' で指定してください。`,
          isCritical: true,
        };
      }

      // 拡張子が png,jpg,jpeg,gif であること
      if (!src.match(/(.png|.jpg|.jpeg|.gif)$/)) {
        return {
          message: `非対応の拡張子の画像が検出されました: '${src}'. 対応している画像の拡張子は png,jpg,jpeg,gif です。`,
          isCritical: true,
        };
      }

      return null;
    })
    .get()
    .filter((i) => i);

  return errors;
}

function isUrl(text: string): Boolean {
  try {
    return new url.URL(text) && true;
  } catch {
    return false;
  }
}
