const chalk = require('chalk')
const path = require('path')

module.exports = options => {
  const { hostname, identity, local, remote, script } = options

  const Q = []


  if (!script) {
    const choices = require('./getLocalBuildScript')()
    Q.push({
      type: 'list',
      name: 'script',
      message: "选择打包命令，会列出包含 build 字符的所有命令",
      choices
    })
  }

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
      message: `密钥路径，(如使用绝对路径,密钥被拷到当前工作空间 ${chalk.green('.deploy.private')})`,
      validate: async answers => {
        try {
          let res = await require('fs').statSync(path.resolve(answers))
          return !res.isDirectory() || '不能是文件夹！'
        } catch (error) {
          return '文件不存在！'
        }
      }
    })
  }


  if (!local) {
    Q.push({
      type: 'input',
      name: 'local',
      message: "打包生成资源目录，相对当前工作空间。（只能使用相对目录）",
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