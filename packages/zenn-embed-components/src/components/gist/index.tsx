import { Fragment } from 'react';
import { EmbedGistError } from './EmbedGistError';
import { EmbedGistLoading } from './EmbedGistLoading';

export type GistApiResponse = {
  div: string;
  stylesheet: string;
};

export interface EmbedGistProps {
  url?: string;
  data?: GistApiResponse;
  error?: Error;
}

export const EmbedGist = ({ url, data, error }: EmbedGistProps) => {
  if (error) return <EmbedGistError url={url} error={error} />;
  if (!data) return <EmbedGistLoading url={url} />;

  return (
    <div className="embed-gist">
      {url ? (
        <Fragment>
          <link rel="stylesheet" href={data.stylesheet} />
          <div dangerouslySetInnerHTML={{ __html: data.div }} />
        </Fragment>
      ) : (
        <p>Not Found</p>
      )}
    </div>
  );
};
