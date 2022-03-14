const fs = require('fs')
const path = require('path')
const utils = require('./utils')
const infoLog = utils.infoLog
const warnLog = utils.warnLog
const errorLog = utils.errorLog

function editPackage (fullPath, editPackageJSON, logContent) {
  let packageContent = fs.readFileSync(fullPath, 'utf-8') // package.jsn内容
  packageContent = JSON.parse(packageContent)
  const packageName = packageContent.name // 包名
  let newest
  try {
    newest = packageContent['dist-tags']['latest']
  } catch (e) {
    errorLog('No "dist-tags.latest" in ' + packageName)
    return
  }

  const targetDirectory = fullPath.split(path.basename(fullPath))[0]
  const contents = fs.readdirSync(targetDirectory) // 目标目录内所有文件
  const packageIndex = contents.indexOf('package.json')
  contents.splice(packageIndex, 1)
  const hasTgz = contents.some(c => path.extname(fullPath + path.sep + c) === '.tgz')
  if (!hasTgz) {
    let tgzMessage = 'No .tgz in ' + packageName
    logContent += tgzMessage + '\r\n'
    errorLog(tgzMessage)
  } else {
    const hasVersion = contents.some(c => c.indexOf(newest) > -1)
    if (!hasVersion) {
      // tgz文件里没有最新的
      if (editPackageJSON) {
        // 重写package.json
        let first
        let last
        let newestTgz
        try {
          first = contents[0]
          last = contents[contents.length - 1]
          newestTgz = utils.compareVersion(first, last) ? first : last
          const newestTgzVersion = utils.getVersionFromFileName(newestTgz)
          const editLog = 'Edit: ' + packageName + ' ' + newest + ' -> ' + newestTgzVersion
          logContent += editLog + '\r\n'
          infoLog(editLog)
          packageContent['dist-tags']['latest'] = newestTgzVersion
          fs.writeFileSync(targetDirectory + '/package.json', JSON.stringify(packageContent))
        } catch (e) {
          warnLog(e.message)
        }

      } else {
        // 文件里不包含最新版本
        const versionMessage = 'No newest(' + newest + ') .tgz in ' + packageName
        logContent += versionMessage + '\r\n'
        errorLog(versionMessage)
      }

    }
  }
}

module.exports = {
  editPackage
}