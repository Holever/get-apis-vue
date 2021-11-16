const path = require('path')
const fse = require('fs-extra')

const exts = ['.vue', '.js']

/**
 * 添加对应后缀
 * @param {String} filePath 文件路径
 * @returns 文件路径
 */
exports.ensureExt = function(filePath){
  let extName = path.extname(filePath)
  let tempPath = ''
  for(let ext of exts){
    if(extName !== ext){
      tempPath = filePath + ext
      if(fse.existsSync(tempPath)){
        return tempPath
      }
      tempPath = path.join(filePath, './index' + ext)
      if(fse.existsSync(tempPath)){
        return tempPath
      }
    }
  }
  return filePath
}