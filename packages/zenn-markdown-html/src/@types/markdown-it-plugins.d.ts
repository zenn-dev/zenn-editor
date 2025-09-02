declare module 'markdown-it-container' {
  import { PluginWithOptions } from 'markdown-it';
  const plugin: PluginWithOptions<any>;
  export = plugin;
}

declare module 'markdown-it-footnote' {
  import { PluginSimple } from 'markdown-it';
  const plugin: PluginSimple;
  export = plugin;
}

declare module 'markdown-it-task-lists' {
  import { PluginWithOptions } from 'markdown-it';
  const plugin: PluginWithOptions<any>;
  export = plugin;
}

declare module 'markdown-it-inline-comments' {
  import { PluginSimple } from 'markdown-it';
  const plugin: PluginSimple;
  export = plugin;
}

declare module 'markdown-it-link-attributes' {
  import { PluginWithOptions } from 'markdown-it';
  const plugin: PluginWithOptions<any>;
  export = plugin;
}
