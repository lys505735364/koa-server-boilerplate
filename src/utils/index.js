function formatDate(val) {
  let date = new Date(val)
  if(date.toString() === 'Invalid Date') {
    return 'Invalid Date'
  }
  let Y = date.getFullYear()
  let M = date.getMonth() + 1
  let D = date.getDate()
  let H = date.getHours()
  let m = date.getMinutes()
  let s = date.getSeconds()
  M = ('0' + M).slice(-2)
  D = ('0' + D).slice(-2)
  H = ('0' + H).slice(-2)
  m = ('0' + m).slice(-2)
  s = ('0' + s).slice(-2)
  return `${Y}-${M}-${D} ${H}:${m}:${s}`
}
const setSqlAttributes = function (rb, attr) {
  let obj = {}
  attr.forEach((key) => {
    if (!(rb[key] === undefined || rb[key] === null || rb[key] === '')) {
      obj[key] = rb[key]
    }
  })
  return obj
}
// 验证必填字段
const validRequiredAttr = function (rb, attr) {
  let flag = true
  attr.forEach((key) => {
    if (rb[key] === undefined || rb[key] === null || rb[key] === '') {
      flag = false
    }
  })
  return flag
}
const isParamNotEmpty = (val) => {
  // return val === undefined || val === null || val === '' ? false : true
  return val !== undefined && val !== null && val !== '' ? true : false
}
const transValueToNumber = (val) => {
  return parseInt((val + '').replace(/[a-zA-Z]+/ig, ''), 10)
}

/**
 * 解析UID为纯数字ID
 * @param {string} uid - U/S开头的UID
 * @returns {number|null} 纯数字ID
 */
const parseUidToId = (uid) => {
  if (!uid || (typeof uid !== 'string') || (!uid.startsWith('U') && !uid.startsWith('S'))) {
    return null;
  }
  const numId = parseInt(uid.slice(1));
  return isNaN(numId) ? null : numId;
};
module.exports = {
  formatDate,
  setSqlAttributes,
  validRequiredAttr,
  transValueToNumber,
  parseUidToId,
  isParamNotEmpty
}