const execa = require('execa');
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk');

const prompt = require('inquirer').createPromptModule({ output: process.stderr })

const defaultOptions = { user: 'root', port: '22' }




module.exports = async function publishFlow (preOptions) {

  let localOption = await require('./src/getLocalOptions')()

  // merge options
  // preOptions > localOption > defauleOptions
  let options = Object.assign(defaultOptions, localOption, preOptions)

  console.log(options);

  const Q = require('./src/getPrompt.js')(options)

  // console.log(Q);

  let anwsers = await prompt(Q)

  console.log(anwsers);

  // options = Object.assign(options, anwsers)
  // console.log(options);

  // console.log(path.join(process.cwd(), 'aa'));
  // console.log(path.join(process.cwd(), '/aa'));
  // console.log(path.join(path.dirname, './deploy.sh'));



  execa(
    'sh',
    [path.join(__dirname, 'deploy.sh')],
    { stdio: [process.stdin, process.stdout, process.stderr] }
  )
  // execa(
  //   'pwd',
  //   { stdio: [process.stdin, process.stdout, process.stderr] }
  // )


}