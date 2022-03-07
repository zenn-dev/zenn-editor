import { ComponentStory, ComponentMeta } from '@storybook/react';

import { EmbedLinkCard } from './index';

export default {
  title: 'Embedded/LinkCard',
  component: EmbedLinkCard,
} as ComponentMeta<typeof EmbedLinkCard>;

const Template: ComponentStory<typeof EmbedLinkCard> = (args) => (
  <EmbedLinkCard {...args} />
);

export const onError = Template.bind({});
onError.args = {
  error: new Error('example error'),
};

export const onLoading = Template.bind({});
onLoading.args = {
  isLoading: true,
};

export const onNotFound = Template.bind({});
onNotFound.args = {};

export const onDefault = Template.bind({});
onDefault.args = {
  src: 'https://zenn.dev',
  linkData: {
    url: 'https://example.com',
    title: 'Example Sites',
    hostname: 'example.com',
    urlOrigin: 'https://exmaple.com',
  },
};

export const onWithThumbnail = Template.bind({});
onWithThumbnail.args = {
  src: 'https://zenn.dev',
  linkData: {
    url: 'https://zenn.dev',
    hostname: 'zenn.dev',
    urlOrigin: 'https://zenn.dev',
    title: 'Zenn｜エンジニアのための情報共有コミュニティ',
    imageUrl: 'https://zenn.dev/images/logo-only-dark.png',
    description:
      'Zennはエンジニアが技術・開発についての知見をシェアする場所です。ウェブ上での本の販売や、読者からのサポートにより対価を受け取ることができます。',
  },
};

export const onGithub = Template.bind({});
onGithub.args = {
  src: 'https://github.com/zenn-dev/zenn-editor',
  githubRepo: {
    url: 'https://github.com/zenn-dev/zenn-editor',
    fullName: 'zenn-dev/zenn-editor',
    name: 'zenn-editor',
    owner: 'zenn-dev',
    description: 'Convert markdown to html in Zenn format',
    forksCount: 50,
    stargazersCount: 334,
    language: 'TypeScript',
  },
};

export const onGithubOtherPage = Template.bind({});
onGithubOtherPage.args = {
  src: 'https://github.com/zenn-dev/zenn-editorhttps://github.com/zenn-dev/zenn-editor/blob/canary/lerna.json',
  linkData: {
    url: 'https://github.com/zenn-dev/zenn-editor/blob/canary/lerna.json',
    hostname: 'github.com',
    urlOrigin: 'https://github.com',
    title: 'zenn-editor/package.json at canary · zenn-dev/zenn-editor',
    imageUrl:
      'https://opengraph.githubassets.com/4bbcca5661650bf33de71a40caa0acd3a749a9fe6b94c8cde13a52b1aa451e7a/zenn-dev/zenn-editor',
    description:
      'Convert markdown to html in Zenn format. Contribute to zenn-dev/zenn-editor development by creating an account on GitHub.',
  },
};
