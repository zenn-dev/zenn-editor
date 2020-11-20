## Test

How zenn-editor is tested
### kind of tests
- unit test
- snapshot test

### snapshot

zenn-cli is based on NextJS application and `components` and `pages` folder is implementation for view.
`components` are tested by `jest` snapshot testing.
For details, see documents listed below.

- [snapshot testing with jest](https://jestjs.io/docs/ja/snapshot-testing)
- [option for jest config](https://jestjs.io/docs/ja/configuration)
- [NextJS with jest example](https://github.com/vercel/next.js/tree/master/examples/with-jest)
- [ts-jest configuration](https://kulshekhar.github.io/ts-jest/user/config/)