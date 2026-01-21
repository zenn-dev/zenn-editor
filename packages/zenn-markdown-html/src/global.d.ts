declare module 'markdown-it-container' {
  import type MarkdownIt from 'markdown-it';
  interface ContainerOptions {
    marker?: string;
    validate?: (params: string) => boolean;
    render?: (
      tokens: MarkdownIt.Token[],
      idx: number,
      options: MarkdownIt.Options,
      env: unknown,
      self: MarkdownIt.Renderer
    ) => string;
  }
  const plugin: MarkdownIt.PluginWithOptions<ContainerOptions>;
  export default plugin;
}

declare module 'markdown-it-footnote' {
  import type MarkdownIt from 'markdown-it';
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module 'markdown-it-task-lists' {
  import type MarkdownIt from 'markdown-it';
  interface TaskListsOptions {
    enabled?: boolean;
    label?: boolean;
    labelAfter?: boolean;
  }
  const plugin: MarkdownIt.PluginWithOptions<TaskListsOptions>;
  export default plugin;
}

declare module 'markdown-it-inline-comments' {
  import type MarkdownIt from 'markdown-it';
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module 'markdown-it-link-attributes' {
  import type MarkdownIt from 'markdown-it';
  interface LinkAttributesOptions {
    matcher?: (href: string) => boolean;
    attrs: Record<string, string>;
  }
  const plugin: MarkdownIt.PluginWithOptions<
    LinkAttributesOptions | LinkAttributesOptions[]
  >;
  export default plugin;
}
