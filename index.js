#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const packageJson = require('./package.json')
const cliPath = process.cwd()
let logContent = ''
let npmScript = 'npm i ' // npm安装命令
const timestamp = new Date().getTime()
const logFileName = timestamp + '-tgz_debug.log'

if (process.argv[2] === '--version' || process.argv[2] === '-V') {
  console.log(packageJson.version)
  return
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
      const hasTgz = contents.some(c => path.extname(fullPath + path.sep + c) === '.tgz')
      if (!hasTgz) {
        let tgzMessage = 'No .tgz in ' + packageName
        logContent += tgzMessage + '\r\n'
        npmScript += packageName + ' '
        errorLog(tgzMessage)
      } else {
        const hasVersion = contents.some(c => c.indexOf(newest) > -1)
        if (!hasVersion) {
          // 文件里不包含最新版本
          const versionMessage = 'No newest(' + newest + ') .tgz in ' + packageName
          logContent += versionMessage + '\r\n'
          npmScript += packageName + '@' + newest + ' '
          errorLog(versionMessage)
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
  fs.writeFileSync('./' + logFileName, logContent + '\r\n\r\n' + npmScript)
}

function errorLog (...message) {
  console.log('[Error]', messageHandler(...message))
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