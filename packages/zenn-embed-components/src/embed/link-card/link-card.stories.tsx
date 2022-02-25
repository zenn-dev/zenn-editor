import { ComponentStory, ComponentMeta } from '@storybook/react';

import { EmbedLinkCard } from './index';

export default {
  title: 'Embedded/LinkCard',
  component: EmbedLinkCard,
} as ComponentMeta<typeof EmbedLinkCard>;

const Template: ComponentStory<typeof EmbedLinkCard> = (args) => (
  <EmbedLinkCard {...args} />
);

export const Loading = Template.bind({});
Loading.args = {
  isLoading: true,
};

export const Base = Template.bind({});
Base.args = {
  isLoading: false,
  linkData: {
    url: 'https://example.com',
    title: 'Example Sites',
    hostname: 'example.com',
    urlOrigin: 'https://exmaple.com',
  },
};

export const BaseWithZenn = Template.bind({});
BaseWithZenn.args = {
  isLoading: false,
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

export const GithubLinkCard = Template.bind({});
GithubLinkCard.args = {
  isLoading: false,
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
