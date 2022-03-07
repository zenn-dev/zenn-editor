import { ComponentStory, ComponentMeta } from '@storybook/react';

import { EmbedTweet } from './index';

export default {
  title: 'Embedded/TweetCard',
  component: EmbedTweet,
} as ComponentMeta<typeof EmbedTweet>;

const Template: ComponentStory<typeof EmbedTweet> = (args) => (
  <EmbedTweet {...args} />
);

export const onDefault = Template.bind({});
onDefault.args = {
  src: 'https://twitter.com/jack/status/20',
};

export const onBadUrl = Template.bind({});
onBadUrl.args = {
  src: 'https://twitter.com/@weo-w983/status/ofiejp9q8323',
};

export const onLoading = Template.bind({});
onLoading.args = {
  isLoading: true,
};

export const onNotFound = Template.bind({});
onNotFound.args = {};

export const onError = Template.bind({});
onError.args = {
  error: new Error(''),
};
