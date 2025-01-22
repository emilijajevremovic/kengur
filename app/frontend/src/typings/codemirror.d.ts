import 'codemirror';

declare module 'codemirror/mode/clike/clike' {
  const clike: any;
  export default clike;
}

declare module 'codemirror/mode/python/python' {
  const python: any;
  export default python;
}

declare module 'codemirror' {
  interface EditorConfiguration {
    autoCloseBrackets?: boolean;
  }
}
