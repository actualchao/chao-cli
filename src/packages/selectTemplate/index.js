const execa = require('execa');
const inquirer = require('inquirer')
const download = require('download-git-repo')
const path = require('path')
const os = require('os')
const fs = require('fs-extra')

const chalk = require('chalk');

const prompt = inquirer.createPromptModule({ output: process.stderr })

module.exports = function selectTemplate (N) {
  return new Promise(async (resolve) => {

    const tmpdir = path.join(os.tmpdir(), 'chao', 'config')

    console.log(chalk.green('开始下载模版配置config'));

    // clone will fail if tmpdir already exists
    // https://github.com/flipxfx/download-git-repo/issues/41
    await fs.remove(tmpdir)

    await new Promise((resolve, reject) => {
      download('actualchao/chao-cli#config', tmpdir, { clone: true }, err => {
        if (err) return reject(err)
        resolve()
      })
    })

    console.log(chalk.green(`下载模版配置config完成！！！ see here: ${tmpdir}`));


    const configs = await fs.readJSON(path.join(tmpdir, 'config.json'))
    const choices = Object.keys(configs)

    for (let i = 0; i < choices.length; i++) {
      let choicesItemKey = choices[i]
      let desc = configs[choicesItemKey].description
      choices.splice(0, 0, new inquirer.Separator(`==${desc || 'no description'}==`))
      i++
    }

    const Q = [{
      name: 'template',
      type: 'list',
      message: 'Select template you want to use',
      choices: choices
    }]

    !N && Q.unshift({
      type: 'input',
      name: 'projectName',
      message: "What's your project name",
    })

    const { template, projectName } = await prompt(Q)
    const sshPath = configs[template].repository

    try {
      await execa(
        'vue',
        ['create', '--preset', `direct:${sshPath}`, '--clone', `${N || projectName}`],
        { stdio: [process.stdin, process.stdout, process.stderr] }
      );

      console.log(chalk.green('init Template successed ! Go!!!!'));

      resolve()
    } catch (error) {
      console.log(error);
      process.exit(1)
    }

  })


}

