#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const utils = require('./utils')
const packageJson = require('./package.json')
const cliPath = process.cwd()
let logContent = ''
const timestamp = new Date().getTime()
const logFileName = timestamp + '-tgz_debug.log'
let editPackageJSON = false // 编辑包内package.json

if (process.argv[2] === '--version' || process.argv[2] === '-V') {
  console.log(packageJson.version)
  return
} else if (process.argv[2] === '--edit') {
  editPackageJSON = true
} else if (process.argv[2]) {
  errorLog('Invalid params.')
  return
}

check(cliPath)

function check (directory) {
  const folders = fs.readdirSync(directory)
  for (let key in folders) {
    const fullPath = directory + path.sep + folders[key] // 绝对路径
    if (fs.lstatSync(fullPath).isDirectory()) {
      check(fullPath)
    } else if (path.basename(fullPath) === 'package.json') {
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
  }
}

if (logContent === '') {
  infoLog('Packages are complete.')
} else {
  infoLog('A complete log of this run can be found in:')
  infoLog('    ' + cliPath + path.sep + logFileName)
  fs.writeFileSync('./' + logFileName, logContent)
}

function errorLog (...message) {
  console.log('[Error]', messageHandler(...message))
}
function warnLog (...message) {
  console.warn('[Warn]', messageHandler(...message))
}
function infoLog (...message) {
  console.log('[Info]', messageHandler(...message))
}
function messageHandler (...content) {
  let str = ''
  content.forEach(c => {
    str += typeof c === 'object' ? JSON.stringify(c) : c
    str += ' '
  })
  return str
}