import { Fragment } from 'react';

import { EmbedGistError } from './EmbedGistError';
import { EmbedGistLoading } from './EmbedGistLoading';
import { SendWindowSize } from '../../components/SendWindowSize';

import { GistApiResponse, EmbedComponentProps } from '../types';

export interface EmbedGistProps extends EmbedComponentProps {
  data?: GistApiResponse;
}

const View = ({ src, data, error, isLoading }: EmbedGistProps) => {
  if (error) return <EmbedGistError url={src} error={error} />;
  if (isLoading) return <EmbedGistLoading url={src} />;
  if (!data) return <p>Not Found</p>;

  return (
    <Fragment>
      <link rel="stylesheet" href={data.stylesheet} />
      <div dangerouslySetInnerHTML={{ __html: data.div }} />
    </Fragment>
  );
};

export const EmbedGist = (props: EmbedGistProps) => {
  return (
    <SendWindowSize id={props.id} className="embed-gist">
      <View {...props} />
    </SendWindowSize>
  );
};
