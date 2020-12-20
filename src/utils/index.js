module.exports.format = function (time, fmt) {
  if (arguments.length === 0) {
    return null
  }
  if (!time) return ''
  fmt = fmt || 'yyyy-MM-dd hh:mm:ss'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  fmt = fmt || 'yyyy-MM-dd hh:mm:ss'
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (const key in o) {
    if ((new RegExp('(' + key + ')')).test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? (o[key]) : ('00' + o[key]).substr(('' + o[key]).length))
    }
  }
  return fmt
}

module.exports.log = function () {
  console.log();
  console.log(...arguments);
  console.log();
}