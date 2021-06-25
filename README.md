# vite-plugin-react-stylename

Support use `styleName` prop in `React` with `vite`.

With [babel-plugin-react-css-modules](https://github.com/gajus/babel-plugin-react-css-modules) we can use `styleName` instead of `className` to specify class names in style file that enables CSS module.

```js
import './app.module.css'

function App() {
  return <div styleName="app">content</div>
}
```

But `vite` does not use `Babel` by default.
This plugin provide the functional to use `styleName` in `vite`.

**Notice: Only use this plugin in development environment.**
