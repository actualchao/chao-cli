const execa = require('execa');
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk');
const utils = require('../../utils/index')

const prompt = require('inquirer').createPromptModule({ output: process.stderr })

const defaultOptions = { user: 'root', port: '22' }

async function execaStdio () {
  return await execa(...arguments, { cwd: process.cwd(), stdio: 'inherit' })
}

const defaultConfigFile = '.deploy.json'
const defaultPrivateFile = '.deploy.private'

module.exports = async function publishFlow (preOptions) {

  let localOption = await require('./src/getLocalOptions')()

  // merge options
  // preOptions > localOption > defauleOptions
  let options = Object.assign(defaultOptions, localOption, preOptions)

  const Q = require('./src/getPrompt.js')(options)

  let configAnwsers
  if (Q) {
    configAnwsers = await prompt(Q)
    options = Object.assign(options, configAnwsers)
  }

  let { hostname, port, user, identity, local, remote, script } = options
  options = { hostname, port, user, identity, local, remote, script }

  if (Q) {
    const { writeFile } = await prompt({ type: 'confirm', name: 'writeFile', message: `是否将以上配置更新写入到项目 ${chalk.green(defaultConfigFile)} 中` })

    if (writeFile) {
      if (configAnwsers && configAnwsers.identity && configAnwsers.identity !== defaultPrivateFile) {
        fs.copySync(configAnwsers.identity, path.join(process.cwd(), defaultPrivateFile))
        options.identity = defaultPrivateFile
        identity = defaultPrivateFile

        utils.log('密钥文件已经拷贝到当前工作项目下  ', chalk.yellow(defaultPrivateFile));
      }
      fs.writeJsonSync(path.join(process.cwd(), defaultConfigFile), options)
    }
  }

  const server = `${user}@${hostname}`
  const indenityArg = ['-i', path.resolve(identity)]

  async function sshExeca (command, args, stdio = 'inherit') {
    return await execa('ssh', [server, ...indenityArg, command, ...args], { cwd: process.cwd(), stdio })
  }

  try {
    let res = await sshExeca('echo', ['login successed'], 'pipe')
    utils.log(chalk.green('test login server successed!!!'));
  } catch (error) {
    utils.log(chalk.red('连接服务器失败，请检查配置'));
    process.exit(1)
  }


  await execaStdio('npm', ['run', script])

  const absoluteLocaPath = path.resolve(local)

  try {
    const distDir = await require('fs').statSync(absoluteLocaPath)
    const distIsFine = distDir && distDir.isDirectory()
    if (distIsFine) {
      utils.log(chalk.green('local dist directore is fine, waiting upload'));
    }
  } catch (error) {
    utils.log(chalk.red('检查配置的 local 和 打包生成的目录是否一致'));
  }

  const backDir1 = remote + '.bak'
  try {
    await sshExeca('mkdir', ['backDir1'], 'pipe')
    // await execa('ssh', [server, ...indenityArg, 'mkdir', backDir1])
    utils.log(chalk.green('创建备份文件夹成功！备份文件夹是：'), chalk.yellow(backDir1));
  } catch (error) {
    utils.log(chalk.green('已存在备份文件夹：'), chalk.yellow(backDir1));
  }

  try {
    await sshExeca('cd', [remote], 'pipe')
    // await execa('ssh', [server, ...indenityArg, 'cd', remote])
    const backDir2 = `${backDir1}/${require('../../utils/index').format(new Date(), 'yyyy-MM-dd_hh:mm:ss')}`
    console.log();
    console.log(`${chalk.green('备份远程仓库')}  ${chalk.yellow(remote)}  到 ${chalk.yellow(backDir2)}`);
    await sshExeca('mv', ['-f', remote, backDir2], 'pipe')
    // await execa('ssh', [server, ...indenityArg, 'mv', '-f', remote, backDir2])
    console.log(chalk.green('备份完成，备份地址：' + chalk.yellow(backDir2)))
  } catch (error) {
    console.log();
    await sshExeca('rm', ['-rf', remote], 'pipe')
    // await execa('ssh', [server, ...indenityArg, 'rm', '-rf', remote])
    console.log(chalk.green('当前没有已存在的该资源目录，可以上传！'));
  }

  utils.log(chalk.green('开始上传资源！'));

  await execaStdio('scp', ['-r', ...indenityArg, absoluteLocaPath, `${server}:${remote}`])

  await sshExeca('chmod', ['-R', '755', remote], 'pipe')
  // await execa('ssh', [server, ...indenityArg, 'chmod', '-R', '755', remote])
  utils.log(chalk.green('upload successed'), 'check you service everything is Ok!!');
} 