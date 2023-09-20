import {
  validateArticle,
  validateBook,
  validateBookChapter,
} from '../src/index';

describe('validateArticle()のテスト', () => {
  const validArticle = {
    slug: 'example-slug',
    title: 'title',
    bodyHtml: 'Hello',
    emoji: '😸',
    type: 'tech',
    topics: ['zenn', 'cli'],
    published: false,
    publication_name: 'team_publisher',
  };

  test('有効な記事ならエラーを返さない', () => {
    const errors = validateArticle(validArticle);
    expect(errors).toEqual([]);
  });

  describe('validateItemSlug()のテスト', () => {
    test('短すぎる slug ならエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        slug: 'too-short',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('12〜50字の組み合わせ');
    });
    test('slug に使えない文字が含まれている場合はエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        slug: 'invalid/slug',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('半角英数字');
    });
  });

  describe('validateMissingTitle()のテスト', () => {
    test('タイトルが無かったらエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        title: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'title（タイトル）を文字列で入力してください'
      );
    });
    test('タイトルが空文字列ならエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        title: '',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'title（タイトル）を文字列で入力してください'
      );
    });
  });

  describe('validateTitleLength()のテスト', () => {
    test('タイトルが長すぎる場合はエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        title:
          'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxabcdefghijklmnopqrstu', // 71 letters
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('タイトルは70字以内にしてください');
    });
  });

  describe('validatePublishedStatus()のテスト', () => {
    test('published の値が string 型ならエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        published: 'true' as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'published（公開設定）を true か false で指定してください（クオテーション " で囲まないでください）'
      );
    });
    test('published の値が number 型ならエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        published: 1 as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'published（公開設定）を true か false で指定してください（クオテーション " で囲まないでください）'
      );
    });
  });

  describe('validateArticleType()のテスト', () => {
    test('articleType が "tech" または "idea" 以外ならエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        type: 'hello' as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'type（記事のタイプ）に tech もしくは idea を指定してください。技術記事の場合は tech を指定してください'
      );
    });
    test('articleType が指定されてなければエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        type: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'type（記事のタイプ）に tech もしくは idea を指定してください。技術記事の場合は tech を指定してください'
      );
    });
  });

  describe('validateMissingEmoji()のテスト', () => {
    test('emoji の値が undefined ならエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        emoji: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'アイキャッチとなる emoji（絵文字）を指定してください'
      );
    });
    test('emoji の値が空文字列ならエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        emoji: '',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'アイキャッチとなる emoji（絵文字）を指定してください'
      );
    });
  });

  describe('validateEmojiFormat()のテスト', () => {
    test('絵文字以外の文字列ならエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        emoji: '絵',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        '絵文字（emoji）を1つだけ指定してください'
      );
    });
  });
  describe('validateMissingTopics()のテスト', () => {
    test('topics の値が undefined ならエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        topics: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topics（記事に関連する言語や技術）を配列で指定してください。'
      );
    });
    test('topics の値が空配列ならエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        topics: [],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topics（記事に関連する言語や技術）を配列で指定してください。'
      );
    });
  });
  describe('validateTooManyTopics()のテスト', () => {
    test('topics の数が 6 以上ならエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        topics: ['a', 'b', 'c', 'd', 'e', 'f'],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('topicsは最大5つまで指定できます');
    });
  });
  describe('validateInvalidTopicLetters()のテスト', () => {
    test('topics に記号が含まれている場合はエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        topics: ['a', 'vue.js'],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topicsに記号やスペースを使用することはできません。'
      );
    });
  });
  describe('validateTopicType()のテスト', () => {
    test('topics の配列に number 型があればエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        topics: [123] as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topicsは全て文字列で指定してください'
      );
    });
    test('topics の配列に空文字列があればエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        topics: [''],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topicsは全て文字列で指定してください'
      );
    });
  });
  describe('validateUseTags()のテスト', () => {
    test('tags プロパティを使っている場合はエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        tags: ['a', 'b'],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('tagsではなくtopicsを使ってください');
    });
  });
  describe('validatePublicationName()のテスト', () => {
    test('Publication 名が短すぎる場合はエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        publication_name: 't',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('2〜15字の組み合わせ');
    });
    test('Publication 名に使えない文字列が含まれる場合はエラーを返す', () => {
      const errors = validateArticle({
        ...validArticle,
        publication_name: 'invalid/name',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('半角英数字');
    });
  });
});

describe('validateBook()のテスト', () => {
  const validBook = {
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

  test('有効な本であればエラーを返さない', () => {
    const errors = validateBook(validBook);
    expect(errors).toEqual([]);
  });

  describe('validateItemSlug()のテスト', () => {
    test('slug が短すぎる場合はエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        slug: 'too-short',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('12〜50字の組み合わせ');
    });
    test('slug に使えない文字列が含まれる場合はエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        slug: 'invalid/slug',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('半角英数字');
    });
  });

  describe('validateMissingTitle()のテスト', () => {
    test('title が無い場合はエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        title: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'title（タイトル）を文字列で入力してください'
      );
    });
    test('title が空文字列の場合はエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        title: '',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'title（タイトル）を文字列で入力してください'
      );
    });
  });

  describe('validateTitleLength()のテスト', () => {
    test('title が長すぎる場合はエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        title:
          'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxabcdefghijklmnopqrstu', // 71 letters
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('タイトルは70字以内にしてください');
    });
  });

  describe('validatePublishedStatus()のテスト', () => {
    test('published の値が string 型の場合はエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        published: 'true' as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'published（公開設定）を true か false で指定してください（クオテーション " で囲まないでください）'
      );
    });
    test('published の値が number 型の場合はエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        published: 1 as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'published（公開設定）を true か false で指定してください（クオテーション " で囲まないでください）'
      );
    });
  });

  describe('validateMissingTopics()のテスト', () => {
    test('topics の値が undefined ならエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        topics: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topics（記事に関連する言語や技術）を配列で指定してください。'
      );
    });
    test('topics の値が空配列ならエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        topics: [],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topics（記事に関連する言語や技術）を配列で指定してください。'
      );
    });
  });

  describe('validateTooManyTopics()のテスト', () => {
    test('topics の数が 6 以上ならエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        topics: ['a', 'b', 'c', 'd', 'e', 'f'],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('topicsは最大5つまで指定できます');
    });
  });

  describe('validateInvalidTopicLetters()のテスト', () => {
    test('topics に記号が含まれている場合はエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        topics: ['a', 'vue.js'],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topicsに記号やスペースを使用することはできません。'
      );
    });
  });

  describe('validateTopicType()のテスト', () => {
    test('topics の配列に number 型があればエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        topics: [123] as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topicsは全て文字列で指定してください'
      );
    });
    test('topics の配列に空文字列があればエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        topics: [''],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'topicsは全て文字列で指定してください'
      );
    });
  });

  describe('validateUseTags()のテスト', () => {
    test('tags プロパティを使っている場合はエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        tags: ['a', 'b'],
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('tagsではなくtopicsを使ってください');
    });
  });

  describe('validateBookSummary()のテスト', () => {
    test('summary が undefined の場合はエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        summary: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'summary（本の説明）の記載は必須です'
      );
    });
  });

  describe('validateBookPriceType()のテスト', () => {
    test('price が undefined の場合はエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        price: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'price（本の価格）を半角数字で指定してください（クオテーション " で囲まないでください）'
      );
    });
  });

  describe('validateBookPriceRange()のテスト', () => {
    test('price が 5000 よりも大きいならエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        price: 6000,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'price（本の価格）を有料にする場合、200〜5000の間で指定してください'
      );
    });
    test('price が 200 よりも小さいならエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        price: 100,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'price（本の価格）を有料にする場合、200〜5000の間で指定してください'
      );
    });
  });

  describe('validateBookPriceFraction()のテスト', () => {
    test('price が 100 で割り切れない場合はエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        price: 1050,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'price（本の価格）は100円単位で指定してください'
      );
    });
  });

  describe('validateMissingBookCover()のテスト', () => {
    test('coverDataUrl が undefined の場合はエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        coverDataUrl: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        '本のカバー画像（cover.pngもしくはcover.jpg）'
      );
    });
  });

  describe('validateBookCoverSize()のテスト', () => {
    test('カバー画像のサイズが1MBより大きい場合はエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        coverFilesize: 1024 * 1024 * 2,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        `カバー画像のサイズは1MB以内にしてください。現在のサイズ: ${1024 * 2}KB`
      );
    });
  });

  describe('validateBookCoverAspectRatio()のテスト', () => {
    test('カバー画像のアスペクト比が 1 : 1.4 でない場合はエラーを返す', () => {
      const errors = validateBook({
        ...validBook,
        coverHeight: 800,
        coverWidth: 500,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        `カバー画像の「幅 : 高さ」の比率は「1 : 1.4」にすることをおすすめします`
      );
    });

    test('カバー画像のアスペクト比が有効な場合はエラーを返さない', () => {
      const errors = validateBook({
        ...validBook,
        coverHeight: 710,
        coverWidth: 500,
      });
      expect(errors).toEqual([]);
    });
  });

  describe('validateBookChapterSlugs()のテスト', () => {
    test('specifiedChapterSlugs が undefined ならエラーを返さない', () => {
      // specifiedChapterSlugs is optional
      const errors = validateBook({
        ...validBook,
        specifiedChapterSlugs: undefined,
        chapterOrderedByConfig: false,
      });
      expect(errors).toEqual([]);
    });
    test('specifiedChapterSlugsが文字列の配列でない場合はエラーを返します', () => {
      // specifiedChapterSlugs is optional
      const errors = validateBook({
        ...validBook,
        specifiedChapterSlugs: [123, 'text'] as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        `config.yamlの chapters の指定に誤りがあります`
      );
    });
  });

  describe('validateBookChaptersFormat()のテスト', () => {
    test('specifiedChapterSlugsに".md"が含まれている場合はエラーを返す', () => {
      const errors = validateBook({
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

describe('validateBookChapter()のテスト', () => {
  const validChapter = {
    slug: 'example',
    filename: 'example.md',
    title: 'title',
    bodyHtml: 'Hello',
    free: false,
    position: 0,
  };

  test('有効なチャプターならエラーを返さない', () => {
    const errors = validateBookChapter(validChapter);
    expect(errors).toEqual([]);
  });

  describe('validateChapterItemSlug()のテスト', () => {
    test('slug が短すぎる場合はエラーを返す', () => {
      const errors = validateBookChapter({
        ...validChapter,
        slug: 's',
      });
      expect(errors).toEqual([]);
    });
    test('slug に使えない文字を含む場合はエラーを返す', () => {
      const errors = validateBookChapter({
        ...validChapter,
        slug: 'invalid/slug',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('半角英数字');
    });
  });

  describe('validateMissingTitle()のテスト', () => {
    test('title が無ければエラーを返す', () => {
      const errors = validateBookChapter({
        ...validChapter,
        title: undefined,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'title（タイトル）を文字列で入力してください'
      );
    });
    test('title が空文字列ならエラーを返す', () => {
      const errors = validateBookChapter({
        ...validChapter,
        title: '',
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'title（タイトル）を文字列で入力してください'
      );
    });
  });

  describe('validateTitleLength()のテスト', () => {
    test('title が長すぎる場合はエラーを返す', () => {
      const errors = validateBookChapter({
        ...validChapter,
        title:
          'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxabcdefghijklmnopqrstu', // 71 letters
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain('タイトルは70字以内にしてください');
    });
  });

  describe('validateChapterFreeType()のテスト', () => {
    test('free が boolean 型じゃ無ければエラーを返す', () => {
      const errors = validateBookChapter({
        ...validChapter,
        free: 'true' as any,
      });
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(
        'free（無料公開設定）には true もしくは falseのみを指定してください'
      );
    });

    test('free が undefined ならエラーを返さない', () => {
      const errors = validateBookChapter({
        ...validChapter,
        free: undefined,
      });
      expect(errors).toEqual([]);
    });
  });
});
