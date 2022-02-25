import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { EmbedGitHub } from './index';

export default {
  title: 'Embedded/Github',
  component: EmbedGitHub,
} as ComponentMeta<typeof EmbedGitHub>;

const Template: ComponentStory<typeof EmbedGitHub> = (args) => (
  <EmbedGitHub {...args} />
);

export const onPreview = Template.bind({});
onPreview.args = {
  url: 'https://github.com/zenn-dev/zenn-editor/blob/canary/lerna.json',
  content: `{
  "packages": [
    "packages/*"
  ],
  "version": "0.1.106",
  "npmClient": "yarn",
  "useWorkspaces": true
}`,
};

export const onLoading = Template.bind({});
onLoading.args = {
  url: 'https://github.com/zenn-dev/zenn-editor/blob/canary/lerna.json',
};

export const onError = Template.bind({});
onError.args = {
  url: 'https://github.com/zenn-dev/zenn-editor/blob/canary/lerna.json',
  error: new Error(''),
};
