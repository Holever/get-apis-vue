const fse = require('fs-extra')
const parser = require('@babel/parser');
const traverse = require("@babel/traverse").default;
const generator = require('@babel/generator').default;
const { transformFromAstSync } = require('@babel/core');
const path = require('path')
const { baseDir, varsPath } = require('./config')

// 用到的变量配置
let varsConfigFile = path.join(baseDir, varsPath)

let configContent = fse.readFileSync(varsConfigFile, {encoding: 'utf-8'})

let ast = parser.parse(configContent, {
  sourceType: 'module',
})

const { code } = transformFromAstSync(ast, configContent, {
  presets: [["env", {
    "targets": {
      "node": "current"
    },
  }]]
})

let configs = eval(code)

module.exports = function(apiFnNames){
  let retApi = []
  for(let [path, names] of apiFnNames){
    const oFileContent = fse.readFileSync(path, {encoding: 'utf-8'})
    const ast = parser.parse(oFileContent, {
      sourceType: 'unambiguous'
    });
    traverse(ast, {
      ExportNamedDeclaration(ePath){
        let name = ePath.node.declaration.id.name
        if(names.has(name)){
          ePath.traverse({
            TemplateLiteral(tPath){
              let { code } = generator(tPath.node)
              code = code.replace(/\$\{(.+?)\}/g, ($0, $1) => {
                if(configs[$1]){
                  return configs[$1]
                }
                return $1
              })
              retApi.push(code)
            }
          })
        }
      }
    })
  }
  return retApi
}