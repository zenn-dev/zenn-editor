declare module 'zenn-content-css' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}
