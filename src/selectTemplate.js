const configs = require('./config.js')
const execa = require('execa');

const inquirer = require('inquirer')

const prompt = inquirer.createPromptModule({ output: process.stderr })

function selectTemplate () {
  return new Promise((resolve, reject) => {
    const choices = Object.keys(configs)

    prompt([
      {
        type: 'input',
        name: 'projectName',
        message: "What's your project name",
      },
      {
        name: 'template',
        type: 'list',
        message: 'Select template you want to use',
        choices: choices
      }
    ]).then(async ({ template, projectName }) => {
      const sshPath = configs[template]

      try {
        await execa(
          'vue',
          ['create', '--preset', `direct:${sshPath}`, '--clone', `${projectName}`],
          { stdio: [process.stdin, process.stdout, process.stderr] }
        );

        resolve()
      } catch (error) {
        console.log(error);
        reject(error)
      }
    })
  })

}


module.exports = selectTemplate