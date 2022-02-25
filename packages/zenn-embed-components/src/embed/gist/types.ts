export type GistApiResponse = {
  div: string;
  stylesheet: string;
};

export interface EmbedGistProps {
  url?: string;
  data?: GistApiResponse;
  error?: Error;
}
