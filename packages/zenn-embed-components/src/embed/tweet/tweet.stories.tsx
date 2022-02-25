import { ComponentStory, ComponentMeta } from '@storybook/react';

import { EmbedTweetCard } from './index';

export default {
  title: 'Embedded/TweetCard',
  component: EmbedTweetCard,
} as ComponentMeta<typeof EmbedTweetCard>;

const Template: ComponentStory<typeof EmbedTweetCard> = (args) => (
  <EmbedTweetCard {...args} />
);

export const Default = Template.bind({});
Default.args = {
  url: 'https://twitter.com/jack/status/20',
};

export const BadUrl = Template.bind({});
BadUrl.args = {
  url: 'https://twitter.com/@weo-w983/status/ofiejp9q8323',
};

export const NotFound = Template.bind({});
NotFound.args = {};
