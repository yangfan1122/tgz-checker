#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const utils = require('./utils')
const infoLog = utils.infoLog
const warnLog = utils.warnLog
const errorLog = utils.errorLog
const getLogContent = utils.getLogContent
const edit = require('./edit')
const editPackage = edit.editPackage
const packageJson = require('./package.json')
const cliPath = process.cwd()
const timestamp = new Date().getTime()
const logFileName = timestamp + '-tgz_debug.log'
let editPackageJSON = false // 编辑包内package.json
let editPackageName = ''

if (process.argv[2] === '--version' || process.argv[2] === '-V') {
  console.log(packageJson.version)
  return
} else if (process.argv[2] === '--edit' && process.argv[3]) {
  editPackageJSON = true
  editPackageName = process.argv[3]
} else if (process.argv[2] === '--edit') {
  editPackageJSON = true
} else if (process.argv[2]) {
  errorLog('Invalid params.')
  return
}

check(cliPath)

function check (directory) {
  const folders = fs.readdirSync(directory)

  // 编辑单个包
  if (editPackageName !== '') {
    let msgObj = editPackage(directory + path.sep + editPackageName + path.sep + 'package.json', editPackageJSON)
    msgHandler(msgObj)
    return
  }

  // 检查/编辑所有包
  for (let key in folders) {
    const fullPath = directory + path.sep + folders[key] // 绝对路径
    if (fs.lstatSync(fullPath).isDirectory()) {
      check(fullPath)
    } else if (path.basename(fullPath) === 'package.json') {
      let msgObj = editPackage(fullPath, editPackageJSON)
      msgHandler(msgObj)
    }
  }
}

function msgHandler (msgObj) {
  if (msgObj.message === '') {
    return
  }
  switch (msgObj.code) {
    case -1:
      errorLog(msgObj.message)
      break
    case 0:
      warnLog(msgObj.message)
      break
    case 1:
      infoLog(msgObj.message)
      break
    default:
      break
  }
}

if (getLogContent() === '') {
  infoLog('Packages are complete.')
} else {
  infoLog('A complete log of this run can be found in:')
  infoLog('    ' + cliPath + path.sep + logFileName)
  fs.writeFileSync('./' + logFileName, getLogContent())
}
