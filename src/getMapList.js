const fse = require('fs-extra')
const path = require('path')
const compiler = require('vue-template-compiler')
const compilerUtil = require('@vue/component-compiler-utils')
const parser = require('@babel/parser');
const traverse = require("@babel/traverse").default;
const { ensureExt } = require('./util')
const { baseDir } = require('./config')


module.exports = function getMapList(filePath, apiFnNames = new Map()){

  var targetFile = fse.readFileSync(filePath, {encoding: 'utf-8'})

  let scriptContent = ''

  if(path.extname(filePath) === '.vue'){
    let descriptor = compilerUtil.parse({
      source: targetFile,
      compiler: compiler,
      needMap: false,
      sourceRoot: baseDir
    })
    scriptContent = descriptor.script.content
  } else {
    scriptContent = targetFile
  }

  const ast = parser.parse(scriptContent, {
    sourceType: 'unambiguous',
    plugins: ['jsx']
  });

  traverse(ast, {
    ImportDeclaration: function(tPath) {
      let importPath = tPath.node.source.value
      if(/^@/.test(importPath)){ // 别名处理
        importPath = path.join(baseDir, importPath.replace(/@/, './src'))
      } else if(/^\./.test(importPath)) { // 相对路径处理
        importPath = path.join(filePath, '../', importPath)
      }
      importPath = ensureExt(importPath)
      if(/\\api/.test(importPath)){ // api则获取接口
        tPath.node.curMap = {
          path: importPath,
          names: new Set()
        }
        tPath.traverse({
          ImportSpecifier: importSpecifierFn,
        })
      } 
      if(/\\components/.test(importPath)){ // vue组件文件夹继续循环
        getMapList(importPath, apiFnNames)
      }
    },
    exit(imPath){
      const curMap = imPath.node.curMap
      if(curMap){
        let names = curMap.names
        let oldNames = apiFnNames.get(curMap.path) || new Set()
        apiFnNames.set(curMap.path, new Set([...names, ...oldNames]))
      }
    }
  })

  function importSpecifierFn(iPath){
    let curMap = iPath.parentPath.node.curMap
    let name = iPath.node.imported.name
    curMap.names.add(name)
  }

  return apiFnNames
}