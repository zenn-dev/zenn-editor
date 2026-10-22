// markdown-it v15 は PluginSimple / PluginWithOptions 型を提供しないため、各モジュール内で定義する
declare module 'markdown-it-container' {
  import type {
    MarkdownIt,
    MarkdownItOptions,
    Renderer,
    Token,
  } from 'markdown-it';
  interface ContainerOptions {
    marker?: string;
    validate?: (params: string) => boolean;
    render?: (
      tokens: Token[],
      idx: number,
      options: MarkdownItOptions,
      env: unknown,
      self: Renderer
    ) => string;
  }
  const plugin: (
    md: MarkdownIt,
    name: string,
    options?: ContainerOptions
  ) => void;
  export default plugin;
}

declare module 'markdown-it-footnote' {
  import type { MarkdownIt } from 'markdown-it';
  const plugin: (md: MarkdownIt) => void;
  export default plugin;
}

declare module 'markdown-it-task-lists' {
  import type { MarkdownIt } from 'markdown-it';
  interface TaskListsOptions {
    enabled?: boolean;
    label?: boolean;
    labelAfter?: boolean;
  }
  const plugin: (md: MarkdownIt, options?: TaskListsOptions) => void;
  export default plugin;
}

declare module 'markdown-it-inline-comments' {
  import type { MarkdownIt } from 'markdown-it';
  const plugin: (md: MarkdownIt) => void;
  export default plugin;
}

declare module 'markdown-it-link-attributes' {
  import type { MarkdownIt } from 'markdown-it';
  interface LinkAttributesOptions {
    matcher?: (href: string) => boolean;
    attrs: Record<string, string>;
  }
  const plugin: (
    md: MarkdownIt,
    options?: LinkAttributesOptions | LinkAttributesOptions[]
  ) => void;
  export default plugin;
}
