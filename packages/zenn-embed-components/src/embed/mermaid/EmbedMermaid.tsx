import mermaid from 'mermaid';
import { useEffect } from 'react';
import { EmbedMermaidError } from './EmbedMermaidError';
import { EmbedMermaidNotFound } from './EmbedMermaidNotFound';
import { SendWindowSize } from '../../components/SendWindowSize';
import { DEFAULT_CONFIG, validateMermaidSource } from './utils';

export interface EmbedMermaidProps {
  /** mermaidのConfig。Config型がexportされておらず利用できないので仕方なくany。 */
  config?: any;

  /** mermaidの記述 */
  content?: string;
}

const View = ({ content, config }: EmbedMermaidProps) => {
  // 文法エラーやパフォーマンスリスクが検出された場合、注意書きをレンダリングして終了
  const results = validateMermaidSource(content || '');
  const errors = Object.values(results).filter((result) => result.hasError);
  const errorCount = errors.length;

  useEffect(() => {
    if (content && errorCount === 0) {
      mermaid.mermaidAPI.initialize({ ...DEFAULT_CONFIG, ...config });
      mermaid.contentLoaded();
    }
  }, [content, config, errorCount]);

  if (errorCount > 0) return <EmbedMermaidError errors={errors} />;
  if (!content) return <EmbedMermaidNotFound />;

  return <div className="mermaid">{content}</div>;
};

export const EmbedMermaid = (props: EmbedMermaidProps) => {
  return (
    <SendWindowSize src={props.content} className="embed-mermaid">
      <View {...props} />
    </SendWindowSize>
  );
};
