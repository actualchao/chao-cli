const { exec } = require('child_process')
const configs = require('./config.js')

const { spawn } = require('child_process');

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
    ]).then(({ template, projectName }) => {
      const sshPath = configs[template]

      const childProcess = spawn(
        'vue',
        ['create', '--preset', `direct:${sshPath}`, '--clone', `${projectName}`],
        { stdio: [process.stdin, process.stdout, process.stderr] }
      );

      childProcess.on('exit', (code) => {
        if (code === 0) {
          resolve()
        }else{
          reject()
        }
      })
    })
  })

}


module.exports = selectTemplate