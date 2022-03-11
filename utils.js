function compareVersion (newV, nowV) {
  const newArr = newV.split('.')
  const nowArr = nowV.split('.')
  const minLength = Math.min(newArr.length, nowArr.length)
  let position = 0
  let diff = 0
  while (position < minLength && ((diff = parseInt(newArr[position]) - parseInt(nowArr[position])) === 0)) {
    position++
  }
  diff = diff !== 0 ? diff : newArr.length - nowArr.length
  return diff > 0
}

function getVersionFromFileName (fileName) {
  const arr1 = fileName.split('.tgz')
  const arr2 = arr1[0].split('-')
  return arr2[arr2.length - 1]
}

module.exports = {
  compareVersion,
  getVersionFromFileName
}