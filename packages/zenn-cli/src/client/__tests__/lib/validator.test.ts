import { Article, Book, Chapter } from '../../../common/types';
import {
  getArticleErrors,
  getBookErrors,
  getChapterErrors,
} from '../../lib/validator';

describe('getArticleErrors', () => {
  const validArticle: Article = {
    slug: 'example-slug',
    title: 'title',
    bodyHtml: 'Hello',
    emoji: '😸',
    type: 'tech',
    topics: ['zenn', 'cli'],
    published: false,
    publication_name: 'team_publisher',
  };

  test('return no errors with valid article', () => {
    const errors = getArticleErrors(validArticle);
    expect(errors).toEqual([]);
  });

  describe('validateItemSlug', () => {
    test('return error with too short slug', () => {
      const errors = getArticleErrors({
        ...validArticle,
        slug: 'too-short',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('12〜50字の組み合わせ');
    });
    test('return error with slug which includes invalid letters', () => {
      const errors = getArticleErrors({
        ...validArticle,
        slug: 'invalid/slug',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('半角英数字');
    });
  });

  describe('validateMissingTitle', () => {
    test('return error without title', () => {
      const errors = getArticleErrors({
        ...validArticle,
        title: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'title（タイトル）を文字列で入力してください'
      );
    });
    test('return error with empty title', () => {
      const errors = getArticleErrors({
        ...validArticle,
        title: '',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'title（タイトル）を文字列で入力してください'
      );
    });
  });

  describe('validateTitleLength', () => {
    test('return error with too long title', () => {
      const errors = getArticleErrors({
        ...validArticle,
        title:
          'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxabcdefghijklmnopqrstu', // 71 letters
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('タイトルは70字以内にしてください');
    });
  });

  describe('validatePublishedStatus', () => {
    test('return error if published is specified as string', () => {
      const errors = getArticleErrors({
        ...validArticle,
        published: 'true' as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'published（公開設定）を true か false で指定してください（クオテーション " で囲まないでください）'
      );
    });
    test('return error if published is specified as string', () => {
      const errors = getArticleErrors({
        ...validArticle,
        published: 1 as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'published（公開設定）を true か false で指定してください（クオテーション " で囲まないでください）'
      );
    });
  });

  describe('validateArticleType', () => {
    test('return error if articleType is neither tech or idea', () => {
      const errors = getArticleErrors({
        ...validArticle,
        type: 'hello' as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'type（記事のタイプ）に tech もしくは idea を指定してください。技術記事の場合は tech を指定してください'
      );
    });
    test('return error if articleType is missing', () => {
      const errors = getArticleErrors({
        ...validArticle,
        type: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'type（記事のタイプ）に tech もしくは idea を指定してください。技術記事の場合は tech を指定してください'
      );
    });
  });

  describe('validateMissingEmoji', () => {
    test('return error with undefined emoji', () => {
      const errors = getArticleErrors({
        ...validArticle,
        emoji: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'アイキャッチとなる emoji（絵文字）を指定してください'
      );
    });
    test('return error with empty emoji', () => {
      const errors = getArticleErrors({
        ...validArticle,
        emoji: '',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'アイキャッチとなる emoji（絵文字）を指定してください'
      );
    });
  });

  describe('validateEmojiFormat', () => {
    test('return error with non emoji string for emoji property', () => {
      const errors = getArticleErrors({
        ...validArticle,
        emoji: '絵',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        '絵文字（emoji）を1つだけ指定してください'
      );
    });
  });
  describe('validateMissingTopics', () => {
    test('return error with undefined topics', () => {
      const errors = getArticleErrors({
        ...validArticle,
        topics: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topics（記事に関連する言語や技術）を配列で指定してください。'
      );
    });
    test('return error with empty topics', () => {
      const errors = getArticleErrors({
        ...validArticle,
        topics: [],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topics（記事に関連する言語や技術）を配列で指定してください。'
      );
    });
  });
  describe('validateTooManyTopics', () => {
    test('return error with 6 topics', () => {
      const errors = getArticleErrors({
        ...validArticle,
        topics: ['a', 'b', 'c', 'd', 'e', 'f'],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('topicsは最大5つまで指定できます');
    });
  });
  describe('validateInvalidTopicLetters', () => {
    test('return error with topic including symbols', () => {
      const errors = getArticleErrors({
        ...validArticle,
        topics: ['a', 'vue.js'],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topicsに記号やスペースを使用することはできません。'
      );
    });
  });
  describe('validateTopicType', () => {
    test('return error with number value', () => {
      const errors = getArticleErrors({
        ...validArticle,
        topics: [123] as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topicsは全て文字列で指定してください'
      );
    });
    test('return error with empty string topic', () => {
      const errors = getArticleErrors({
        ...validArticle,
        topics: [''],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topicsは全て文字列で指定してください'
      );
    });
  });
  describe('validateUseTags', () => {
    test('return error with tag property', () => {
      const errors = getArticleErrors({
        ...validArticle,
        tags: ['a', 'b'],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('tagsではなくtopicsを使ってください');
    });
  });
  describe('validatePublicationName', () => {
    test('return error with too short publication name', () => {
      const errors = getArticleErrors({
        ...validArticle,
        publication_name: 't',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('2〜15字の組み合わせ');
    });
    test('return error with publication name which includes invalid letters', () => {
      const errors = getArticleErrors({
        ...validArticle,
        publication_name: 'invalid/name',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('半角英数字');
    });
  });
});

describe('getBookErrors', () => {
  const validBook: Book = {
    slug: 'example-slug',
    title: 'title',
    summary: 'summary',
    price: 0,
    topics: ['zenn', 'cli'],
    published: false,
    specifiedChapterSlugs: ['example1', 'example2'],
    chapterOrderedByConfig: true,
    coverDataUrl: 'data:~',
    coverFilesize: 12600,
    coverWidth: 500,
    coverHeight: 700,
  };

  test('return no errors with valid book', () => {
    const errors = getBookErrors(validBook);
    expect(errors).toEqual([]);
  });

  describe('validateItemSlug', () => {
    describe('validateItemSlug', () => {
      test('return error with too short slug', () => {
        const errors = getBookErrors({
          ...validBook,
          slug: 'too-short',
        });
        expect(errors.length).toEqual(1);
        expect(errors[0].message).toContain('12〜50字の組み合わせ');
      });
      test('return error with slug which includes invalid letters', () => {
        const errors = getBookErrors({
          ...validBook,
          slug: 'invalid/slug',
        });
        expect(errors.length).toEqual(1);
        expect(errors[0].message).toContain('半角英数字');
      });
    });
  });

  describe('validateMissingTitle', () => {
    test('return error without title', () => {
      const errors = getBookErrors({
        ...validBook,
        title: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'title（タイトル）を文字列で入力してください'
      );
    });
    test('return error with empty title', () => {
      const errors = getBookErrors({
        ...validBook,
        title: '',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'title（タイトル）を文字列で入力してください'
      );
    });
  });

  describe('validateTitleLength', () => {
    test('return error with too long title', () => {
      const errors = getBookErrors({
        ...validBook,
        title:
          'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxabcdefghijklmnopqrstu', // 71 letters
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('タイトルは70字以内にしてください');
    });
  });

  describe('validatePublishedStatus', () => {
    test('return error if published is specified as string', () => {
      const errors = getBookErrors({
        ...validBook,
        published: 'true' as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'published（公開設定）を true か false で指定してください（クオテーション " で囲まないでください）'
      );
    });
    test('return error if published is specified as string', () => {
      const errors = getBookErrors({
        ...validBook,
        published: 1 as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'published（公開設定）を true か false で指定してください（クオテーション " で囲まないでください）'
      );
    });
  });

  describe('validateMissingTopics', () => {
    test('return error with undefined topics', () => {
      const errors = getBookErrors({
        ...validBook,
        topics: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topics（記事に関連する言語や技術）を配列で指定してください。'
      );
    });
    test('return error with empty topics', () => {
      const errors = getBookErrors({
        ...validBook,
        topics: [],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topics（記事に関連する言語や技術）を配列で指定してください。'
      );
    });
  });

  describe('validateTooManyTopics', () => {
    test('return error with 6 topics', () => {
      const errors = getBookErrors({
        ...validBook,
        topics: ['a', 'b', 'c', 'd', 'e', 'f'],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('topicsは最大5つまで指定できます');
    });
  });

  describe('validateInvalidTopicLetters', () => {
    test('return error with topic including symbols', () => {
      const errors = getBookErrors({
        ...validBook,
        topics: ['a', 'vue.js'],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topicsに記号やスペースを使用することはできません。'
      );
    });
  });

  describe('validateTopicType', () => {
    test('return error with number value', () => {
      const errors = getBookErrors({
        ...validBook,
        topics: [123] as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topicsは全て文字列で指定してください'
      );
    });
    test('return error with empty string topic', () => {
      const errors = getBookErrors({
        ...validBook,
        topics: [''],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topicsは全て文字列で指定してください'
      );
    });
  });

  describe('validateUseTags', () => {
    test('return error with tag property', () => {
      const errors = getBookErrors({
        ...validBook,
        tags: ['a', 'b'],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('tagsではなくtopicsを使ってください');
    });
  });

  describe('validateBookSummary', () => {
    test('return error with undefined summary', () => {
      const errors = getBookErrors({
        ...validBook,
        summary: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'summary（本の説明）の記載は必須です'
      );
    });
  });

  describe('validateBookPriceType', () => {
    test('return error with undefined price', () => {
      const errors = getBookErrors({
        ...validBook,
        price: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'price（本の価格）を半角数字で指定してください（クオテーション " で囲まないでください）'
      );
    });
  });

  describe('validateBookPriceRange', () => {
    test('return error with price more than 6000', () => {
      const errors = getBookErrors({
        ...validBook,
        price: 6000,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'price（本の価格）を有料にする場合、200〜5000の間で指定してください'
      );
    });
    test('return error with price less than 200', () => {
      const errors = getBookErrors({
        ...validBook,
        price: 100,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'price（本の価格）を有料にする場合、200〜5000の間で指定してください'
      );
    });
  });

  describe('validateBookPriceFraction', () => {
    test('return error if price is not divisible by 100', () => {
      const errors = getBookErrors({
        ...validBook,
        price: 1050,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'price（本の価格）は100円単位で指定してください'
      );
    });
  });

  describe('validateMissingBookCover', () => {
    test('return error with undefined coverDataUrl', () => {
      const errors = getBookErrors({
        ...validBook,
        coverDataUrl: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        '本のカバー画像（cover.pngもしくはcover.jpg）'
      );
    });
  });

  describe('validateBookCoverSize', () => {
    test('return error with undefined coverDataUrl', () => {
      const errors = getBookErrors({
        ...validBook,
        coverFilesize: 1024 * 1024 * 2,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        `カバー画像のサイズは1MB以内にしてください。現在のサイズ: ${1024 * 2}KB`
      );
    });
  });

  describe('validateBookCoverAspectRatio', () => {
    test('return error if cover aspect ratios is not 1.4', () => {
      const errors = getBookErrors({
        ...validBook,
        coverHeight: 800,
        coverWidth: 500,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        `カバー画像の「幅 : 高さ」の比率は「1 : 1.4」にすることをおすすめします`
      );
    });

    test('return error if cover aspect ratios is not 1.4', () => {
      const errors = getBookErrors({
        ...validBook,
        coverHeight: 500,
        coverWidth: 700,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        `カバー画像の「幅 : 高さ」の比率は「1 : 1.4」にすることをおすすめします`
      );
    });

    test('return no errors with allowable aspect ratio', () => {
      const errors = getBookErrors({
        ...validBook,
        coverHeight: 710,
        coverWidth: 500,
      });
      expect(errors).toEqual([]);
    });
  });

  describe('validateBookChapterSlugs', () => {
    test('return no errors with undefined specifiedChapterSlugs', () => {
      // specifiedChapterSlugs is optional
      const errors = getBookErrors({
        ...validBook,
        specifiedChapterSlugs: undefined,
        chapterOrderedByConfig: false,
      });
      expect(errors).toEqual([]);
    });
    test('return error if specifiedChapterSlugs is not array of string', () => {
      // specifiedChapterSlugs is optional
      const errors = getBookErrors({
        ...validBook,
        specifiedChapterSlugs: [123, 'text'] as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        `config.yamlの chapters の指定に誤りがあります`
      );
    });
  });

  describe('validateBookChaptersFormat', () => {
    test('return error if specifiedChapterSlugs includes .md', () => {
      const errors = getBookErrors({
        ...validBook,
        specifiedChapterSlugs: ['example1.md', 'example2.md'],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        `chapters に指定する文字列には拡張子（.md）を含めないでください`
      );
    });
  });
});

describe('getChapterErrors', () => {
  const validChapter: Chapter = {
    slug: 'example',
    filename: 'example.md',
    title: 'title',
    bodyHtml: 'Hello',
    free: false,
    position: 0,
  };

  test('return no errors with valid chapter', () => {
    const errors = getChapterErrors(validChapter);
    expect(errors).toEqual([]);
  });

  describe('validateChapterItemSlug', () => {
    test('return no errors with short slug', () => {
      const errors = getChapterErrors({
        ...validChapter,
        slug: 's',
      });
      expect(errors).toEqual([]);
    });
    test('return error with slug which includes invalid letters', () => {
      const errors = getChapterErrors({
        ...validChapter,
        slug: 'invalid/slug',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('半角英数字');
    });
  });

  describe('validateMissingTitle', () => {
    test('return error without title', () => {
      const errors = getChapterErrors({
        ...validChapter,
        title: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'title（タイトル）を文字列で入力してください'
      );
    });
    test('return error with empty title', () => {
      const errors = getChapterErrors({
        ...validChapter,
        title: '',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'title（タイトル）を文字列で入力してください'
      );
    });
  });

  describe('validateTitleLength', () => {
    test('return error with too long title', () => {
      const errors = getChapterErrors({
        ...validChapter,
        title:
          'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxabcdefghijklmnopqrstu', // 71 letters
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('タイトルは70字以内にしてください');
    });
  });

  describe('validateChapterFreeType', () => {
    test('return error if free property is not boolean', () => {
      const errors = getChapterErrors({
        ...validChapter,
        free: 'true' as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'free（無料公開設定）には true もしくは falseのみを指定してください'
      );
    });

    test('return no error if free property is undefined', () => {
      const errors = getChapterErrors({
        ...validChapter,
        free: undefined,
      });
      expect(errors).toEqual([]);
    });
  });
});
