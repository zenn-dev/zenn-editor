import { Fragment } from 'react';

import { EmbedGistError } from './EmbedGistError';
import { EmbedGistLoading } from './EmbedGistLoading';
import { SendWindowSize } from '../../components/SendWindowSize';

import { GistApiResponse } from './types';

export interface EmbedGistProps {
  url?: string;
  error?: Error;
  data?: GistApiResponse;
}

const Contents = ({ url, data, error }: EmbedGistProps) => {
  if (error) return <EmbedGistError url={url} error={error} />;
  if (!data) return <EmbedGistLoading url={url} />;
  if (!url) return <p>Not Found</p>;

  return (
    <Fragment>
      <link rel="stylesheet" href={data.stylesheet} />
      <div dangerouslySetInnerHTML={{ __html: data.div }} />
    </Fragment>
  );
};

export const EmbedGist = (props: EmbedGistProps) => {
  return (
    <SendWindowSize url={props.url || ''} className="embed-gist">
      <Contents {...props} />
    </SendWindowSize>
  );
};
