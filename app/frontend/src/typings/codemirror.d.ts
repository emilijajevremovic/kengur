import 'codemirror';

declare module 'codemirror' {
  interface EditorConfiguration {
    autoCloseBrackets?: boolean;
  }
}