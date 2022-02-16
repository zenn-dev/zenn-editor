import { ComponentStory, ComponentMeta } from '@storybook/react';

import { EmbedGist } from './index';

export default {
  title: 'Embedded/Gist',
  component: EmbedGist,
} as ComponentMeta<typeof EmbedGist>;

const Template: ComponentStory<typeof EmbedGist> = (args, { loaded }) => (
  <EmbedGist {...args} {...loaded} />
);

export const onLoading = Template.bind({});
onLoading.args = {};

export const onError = Template.bind({});
onError.args = {
  error: new Error('example error'),
};

export const Default = Template.bind({});
Default.args = {
  url: 'https://gist.github.com/octocat/6cad326836d38bd3a7ae',
};
Default.loaders = [
  () => {
    return new Promise<{ data: any }>((resolve) => {
      const head = document.head;
      const script = document.createElement('script');
      const callbackName = 'resolveGistRequest';

      // prettier-ignore
      script.setAttribute('src', `https://gist.github.com/octocat/6cad326836d38bd3a7ae.json?callback=${callbackName}`);
      script.setAttribute('charset', 'UTF-8');

      (window as any)[callbackName] = (res: any) => {
        resolve({ data: res });
        head.removeChild(script);
      };

      head.appendChild(script);
    });
  },
];
