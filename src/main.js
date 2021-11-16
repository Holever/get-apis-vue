const fse = require('fs-extra')
const path = require('path')
const getMapList = require('./getMapList')
const getApiPath = require('./getApiPath')

const fileDir = 'D:\\hand\\code\\oc-mobile\\src\\modules\\workflow\\views'


let fileArr = fse.readdirSync(fileDir).filter(f => {
  let ff = path.join(fileDir, f)
  return fse.statSync(ff).isFile()
})

let allApis = []

fileArr.forEach(file => {
  const fileName = path.join(fileDir, file)
  let apiUrlList = getApiPath(getMapList(fileName))
  allApis = allApis.concat(apiUrlList)
})

console.log('allApis: ', allApis.sort());

