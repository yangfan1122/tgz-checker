function getVersionFromFileName (fileName) {
  const arr1 = fileName.split('.tgz')
  const arr2 = arr1[0].split('-')
  return arr2[arr2.length - 1]
}

let infoContent = ''
let warnContent = ''
let errorContent = ''
function errorLog (...message) {
  let msg = '[Error] ' + messageHandler(...message)
  infoContent += msg + '\r\n'
  console.log(msg)
}
function warnLog (...message) {
  let msg = '[Warn] ' + messageHandler(...message)
  warnContent += msg + '\r\n'
  console.warn(msg)
}
function infoLog (...message) {
  const msg = '[Info] ' + messageHandler(...message)
  errorContent += msg + '\r\n'
  console.info(msg)
}
function messageHandler (...content) {
  let str = ''
  content.forEach(c => {
    str += typeof c === 'object' ? JSON.stringify(c) : c
    str += ' '
  })
  return str
}

function getLogContent () {
  return infoContent + warnContent + errorContent
}

module.exports = {
  getVersionFromFileName,
  errorLog,
  warnLog,
  infoLog,
  getLogContent
}