module.exports = function styleNamePlugin() {
  return {
    name: 'react-stylename',
    enforce: 'post',

    transform(src, id) {
      if (id.endsWith('tsx') || id.endsWith('jsx')) {
        return transformScript(src)
      }
    }
  }
}


function transformScript(src) {
  /*
  找到引用 CSS Module 样式的地方，保证样式模块会导出一个变量到 JavaScript 里

  Find the first reference to a modular style file.
  Make sure it export a variable info script.
  */
  const pattern = /(?<=\s*)import .+?\.module\.(?:css|less|sass|scss)";/
  const match = src.match(pattern)
  if (!match) return

  const [importLine, importLineIndex] = [match[0], match.index]
  let clsVar = ''
  if (importLine.match(/^import\s+"/)) {
    // Transform `import 'xxx.module.css'` to `import xxx from 'xxx.module.css'`
    clsVar = '__cls'
    const changedImportLine = importLine.replace(/^import\s+/, `import ${clsVar} from `)
    src = src.slice(0, match.index) + changedImportLine + src.slice(importLineIndex + importLine.length)
  } else {
    const clsMatch = importLine.match(/(?<=^import\s+).+?(?=\s+)/)
    if (!clsMatch) return  // cannot find cls var name
    clsVar = clsMatch[0]
  }

  /*
  修改 JavaScript 代码，用自定义的 CreateElement 代替 React.createElement，并对传入的 styleName props 进行转义

  Update source, use custom CreateElement replaces React.createElement to transform styleName props.
  */
  src = src.replace(/React.createElement\(/, `TransformStyleNameCreateElement(${clsVar}, `)
  src = TransformStyleNameCreateElement.toString() + '\n\n' + src

  return {
    code: src,
    map: null
  }
}

/**
 * This function will inject into source.
 */
function TransformStyleNameCreateElement(clsObj, name, rawProps, ...extra) {
  const props = {...rawProps}
  if ('styleName' in props) {
    const transformed = (props.styleName || '')
      .split(' ')
      .map(name => clsObj[name])
      .filter(v => v)
      .join(' ')
    if (transformed.length) props.className = props.className ? `${props.className} ${transformed}` : transformed

    delete props.styleName
  }
  return React.createElement(name, props, ...extra)
}
