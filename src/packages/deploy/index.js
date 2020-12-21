const execa = require('execa');
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk');
const utils = require('../../utils/index')

const prompt = require('inquirer').createPromptModule({ output: process.stderr })

const defaultOptions = { user: 'root', port: '22' }


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

<<<<<<< HEAD
  let { hostname, port, user, identity, local, remote, script } = options
  options = { hostname, port, user, identity, local, remote, script }
=======
  let { hostname, port, user, identity, local, remote, script, usePassword } = options
  options = { hostname, port, user, identity, local, remote, script, usePassword }
>>>>>>> develop

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


  const { NodeSSH } = require('node-ssh')
  const ssh = new NodeSSH()

  const sshConfig = {
    host: hostname,
    port: port,
    username: user
  }


  if (usePassword) {
    const { password } = await prompt({
      type: 'password',
      message: 'Enter service password',
      name: 'password',
      mask: '*',
    })
    sshConfig.password = password
  } else {
    sshConfig.privateKey = fs.readFileSync(path.resolve(identity), 'utf8')
  }

  try {
    utils.log('配置成功,开始测试连接服务器!')
    await ssh.connect(sshConfig)
    utils.log(chalk.green('test login server successed!!!'));
  } catch (error) {
    utils.log(chalk.red('连接服务器失败，请检查配置'));
    console.log(error);
    process.exit(1)
  }

  await execa('npm', ['run', script], { stdio: 'inherit' })

  const absoluteLocaPath = path.resolve(local)

  try {
    const distDir = await require('fs').statSync(absoluteLocaPath)
    const distIsFine = distDir && distDir.isDirectory()
    if (distIsFine) {
      utils.log(chalk.green('local dist directore is fine, waiting upload'));
    } else {
      utils.log(chalk.red('检查配置的 local 和 打包生成的目录是否一致'));
      process.exit(1)
    }
  } catch (error) {
    utils.log(chalk.red('检查配置的 local 和 打包生成的目录是否一致'));
    process.exit(1)
  }

  const backDir1 = remote + '.bak'


  try {
    await ssh.mkdir(backDir1)
    utils.log(chalk.green('创建备份文件夹成功！备份文件夹是：'), chalk.yellow(backDir1));
  } catch (error) { }


  try {
    await ssh.exec('cd', [remote])
    const backDir2 = `${backDir1}/${require('../../utils/index').format(new Date(), 'yyyy-MM-dd_hh:mm:ss')}`
    console.log();
    console.log(`${chalk.green('备份远程仓库')}  ${chalk.yellow(remote)}  到 ${chalk.yellow(backDir2)}`);
    await ssh.exec('mv', ['-f', remote, backDir2])
    console.log(chalk.green('备份完成，备份地址：' + chalk.yellow(backDir2)))
  } catch (error) {
    await ssh.exec('rm', ['-rf', remote])
    console.log(chalk.green('当前没有已存在的该资源目录，不需要备份'));
  }

  utils.log(chalk.green('开始上传资源！'));


  let uploadHasError = false
  let errorPath = []
  await ssh.putDirectory(absoluteLocaPath, remote, {
    tick: (lp, rp, err) => {
      const upath = lp.substring(absoluteLocaPath.length)
      if (err) {
        uploadHasError = true
        errorPath.push(upath)
      } else {
        console.log(chalk.green(`      ${upath}`));
      }
    }
  })

  if (uploadHasError) {
    utils.log(chalk.red('下列资源上传发生问题:'))
    errorPath.forEach(item => {
      console.log(chalk.red(`      ${item}`));
    })
  } else {
    // await ssh.exec('chmod', ['-R', '755', remote])
    utils.log(chalk.green('upload successed'), 'check you service everything is Ok!!');
  }

  ssh.dispose()
} 