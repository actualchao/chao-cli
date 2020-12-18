


const chalk = require('chalk');
const inquirer = require('inquirer')
const prompt = inquirer.createPromptModule({ output: process.stderr })


module.exports = function () {
  const configJsonFile = require('path').join(process.cwd(), '.deploy.json')
  const fse = require('fs-extra')
  const fs = require('fs')
  return new Promise(async (resolve) => {

    try {
      await fs.statSync(configJsonFile)

      fse.readJSON(configJsonFile).then(res => {
        resolve(res)
      }).catch(async e => {

        console.log()
        let answers = await prompt({
          type: 'list',
          message: '是否删除当前错误配置文件以继续配置',
          name: 'handle',
          choices: [
            new inquirer.Separator(' = 退出进程修改配置文件重新运行命令 = '),
            {
              name: 'exit',
            },
            new inquirer.Separator(' = 删除现有错误文件进入交互式配置生成配置 = '),
            {
              name: 'delete and continue',
            }
          ]
        })

        const exit = answers.handle === 'exit'
        if (exit) {
          console.log(chalk.red('配置文件有误，请检查 .deploy.json 配置文件！'))
          process.exit(1)
        } else {
          fse.remove(configJsonFile)
        }

        resolve(null)
      })
    } catch (error) {
      resolve(null)
    }

  })
}