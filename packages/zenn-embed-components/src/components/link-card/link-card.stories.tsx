import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { LinkCard } from './index';

export default {
  title: 'Embedded/LinkCard',
  component: LinkCard,
} as ComponentMeta<typeof LinkCard>;

const Template: ComponentStory<typeof LinkCard> = (args) => (
  <LinkCard {...args} />
);

export const onDefault = Template.bind({});
onDefault.args = {};
