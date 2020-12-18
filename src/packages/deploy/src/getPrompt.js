const chalk = require('chalk')
const path = require('path')

module.exports = options => {
  const { hostname, port, user, identity, local, remote } = options

  const Q = []

  if (!hostname) {
    Q.push({
      type: 'input',
      name: 'hostname',
      message: "What's your server hostName",
      validate: answers => {
        const reg = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
        return reg.test(answers) || '输入正确的IP地址'
      }
    })
  }

  if (!identity) {
    Q.push({
      type: 'input',
      name: 'identity',
      message: `密钥路径，(可以使用绝对路径,使用绝对路径密钥会被拷贝到当前工作目录下的 ${chalk.green('.deploy.private')} 目录中)`,
      validate: async answers => {
        try {
          console.log();
          console.log(path.resolve(answers));
          console.log('--------------');
          let res = await require('fs').statSync(path.resolve(answers))
          console.log(res.isDirectory());
          return !res.isDirectory() || '不能是文件夹！'
        } catch (error) {
          return '文件目录不存在！'
        }
      }
    })
  }


  if (!local) {
    Q.push({
      type: 'input',
      name: 'local',
      message: "打包生成资源目录，相对当前工作空间（/）。（只能使用相对目录）",
      validate: answers => {
        return (answers && !path.isAbsolute(answers)) || '只能使用相对目录'
      }
    })
  }
  if (!remote) {
    Q.push({
      type: 'input',
      name: 'remote',
      message: "服务器资源目录（绝对目录）",
      validate: answers => {
        return (answers && path.isAbsolute(answers)) || '只能使用绝对目录'
      }
    })
  }

  return Q.length ? Q : undefined
}