import mermaid from 'mermaid';
import { useEffect } from 'react';
import { EmbedMermaidError } from './EmbedMermaidError';
import { EmbedMermaidLoading } from './EmbedMermaidLoading';
import { EmbedMermaidNotFound } from './EmbedMermaidNotFound';
import { SendWindowSize } from '../../components/SendWindowSize';
import { DEFAULT_CONFIG, validateMermaidSource } from './utils';
import { EmbedComponentProps } from '../types';

export interface EmbedMermaidProps extends EmbedComponentProps {
  /** mermaidのConfig。Config型がexportされておらず利用できないので仕方なくany。 */
  config?: any;
}

const View = ({ src, config, isLoading }: EmbedMermaidProps) => {
  // 文法エラーやパフォーマンスリスクが検出された場合、注意書きをレンダリングして終了
  const results = validateMermaidSource(src || '');
  const errors = Object.values(results).filter((result) => result.hasError);
  const errorCount = errors.length;

  useEffect(() => {
    if (src && errorCount === 0) {
      mermaid.mermaidAPI.initialize({ ...DEFAULT_CONFIG, ...config });
      mermaid.contentLoaded();
    }
  }, [src, config, errorCount]);

  if (errorCount > 0) return <EmbedMermaidError errors={errors} />;
  if (isLoading) return <EmbedMermaidLoading />;
  if (!src) return <EmbedMermaidNotFound />;

  return <div className="mermaid">{src}</div>;
};

export const EmbedMermaid = (props: EmbedMermaidProps) => {
  return (
    <SendWindowSize id={props.id} className="embed-mermaid">
      <View {...props} />
    </SendWindowSize>
  );
};
