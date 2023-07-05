const fs = require('fs')
const path = require('path')
const utils = require('./utils')

function editPackage (fullPath, editPackageJSON) {
  let message = ''
  let packageContent = fs.readFileSync(fullPath, 'utf-8') // package.jsn内容
  try {
    packageContent = JSON.parse(packageContent)
  } catch (error) {
    message = 'Invalid JSON in ' + fullPath
    return {
      code: -1,
      message
    }
  }

  const packageName = packageContent.name // 包名
  let newest
  try {
    newest = packageContent['dist-tags']['latest']
  } catch (e) {
    message = 'No "dist-tags.latest" in ' + packageName
    return {
      code: 0,
      message
    }
  }

  const targetDirectory = fullPath.split(path.basename(fullPath))[0]
  const contents = fs.readdirSync(targetDirectory) // 目标目录内所有文件，.tgz版本号按小到大顺序索引递增
  const packageIndex = contents.indexOf('package.json')
  contents.splice(packageIndex, 1) // 去掉package.json，contents只包含.tgz文件
  const hasTgz = contents.some(c => path.extname(fullPath + path.sep + c) === '.tgz')
  if (!hasTgz) {
    let tgzMessage = 'No .tgz in ' + packageName
    message = tgzMessage
    return {
      code: -1,
      message
    }
  } else {
    const hasNewest = contents.some(c => c.indexOf(newest) > -1)
    if (!hasNewest) {
      // tgz文件里没有最新的
      if (editPackageJSON) {
        // 重写package.json
        try {
          const newestTgzVersion = utils.getVersionFromFileName(contents[contents.length - 1])
          message = 'Edit: ' + packageName + ' ' + newest + ' -> ' + newestTgzVersion
          packageContent['dist-tags']['latest'] = newestTgzVersion
          fs.writeFileSync(targetDirectory + '/package.json', JSON.stringify(packageContent, null, 2))
          return {
            code: 1,
            message
          }
        } catch (e) {
          return {
            code: -1,
            message: e.message
          }
        }

      } else {
        // 文件里不包含最新版本
        message = 'No newest(' + newest + ') .tgz in ' + packageName
        return {
          code: 0,
          message
        }
      }

    } else {
      return {
        code: 1,
        message: ''
      }
    }
  }
}

module.exports = {
  editPackage
}