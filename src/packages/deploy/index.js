const execa = require('execa');
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk');
const os = require('os')

const prompt = require('inquirer').createPromptModule({ output: process.stderr })

const defaultOptions = { user: 'root', port: '22' }

module.exports = async function publishFlow (preOptions) {

  let localOption = await require('./src/getLocalOptions')()

  // merge options
  // preOptions > localOption > defauleOptions
  let options = Object.assign(defaultOptions, localOption, preOptions)

  const Q = require('./src/getPrompt.js')(options)

  if (Q) {
    let anwsers = await prompt(Q)
    options = Object.assign(options, anwsers)
  }

  const { hostname, port, user, identity, local, remote } = options
  options = { hostname, port, user, identity, local, remote }

  if (Q) {
    const { writeFile } = await prompt({ type: 'confirm', name: 'writeFile', message: `是否将以上配置更新写入到项目 ${chalk.green('.deploy.json')} 中` })
    if (writeFile) {
      fs.writeJsonSync(path.join(process.cwd(), '.deploy.json'), options)
    }
  }

  const tmpdir = path.join(os.tmpdir(), 'cgone')

  const file = `${tmpdir}/host`
  fs.outputFileSync(file, 'hello!')
  fs.outputFileSync(file, 'hello!')

  const data = fs.readFileSync(file, 'utf8')
  console.log(data,'data-----') // => hello!




  execa(
    'sh',
    [path.join(__dirname, 'deploy.sh'), hostname, port, user, identity, local, remote],
    { stdio: [process.stdin, process.stdout, process.stderr] }
  )
  // execa(
  //   'pwd',
  //   { stdio: [process.stdin, process.stdout, process.stderr] }
  // )


}