#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const packageJson = require('./package.json')
const cliPath = process.cwd()
let logContent = ''
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
    const fullPath = directory + path.sep + folders[key]
    if (fs.lstatSync(fullPath).isDirectory()) {
      check(fullPath)
    } else if (path.basename(fullPath) === 'package.json') {
      const targetDirectory = fullPath.split(path.basename(fullPath))[0]
      const contents = fs.readdirSync(targetDirectory)
      const has = contents.some(c => path.extname(fullPath + path.sep + c) === '.tgz')
      if (!has) {
        let content = 'No .tgz in ' + targetDirectory.split(cliPath)[1]
        logContent += content + '\r\n'
        errorLog(content)
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