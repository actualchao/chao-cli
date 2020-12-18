#!/usr/bin/env node
const program = require('commander')
const chalk = require('chalk');

const PACKAGE = require('../package.json')

program.version(PACKAGE.version)

program.on('--help', () => {
  console.log()
  console.log(`  Run ${chalk.cyan(`cgone <command> --help`)} for detailed usage of given command.`)
  console.log()
})

// output help information on unknown commands
program
  .arguments('<command>')
  .action((cmd) => {
    program.outputHelp()
    console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
    console.log()
  })

program
  .command('deploy')
  .description('打包上传到服务器')
  .option('-h, --hostname <hostname>', '主机名')
  .option('-p, --port <port>', '端口（默认 22 ）')
  .option('-u, --user <user>', '用户名（默认 root ）')
  .option('-i, --Identity <user>', 'IdentityFIle 密钥文件路径')
  .option('-l, --local <localPath>', '本地目录地址')
  .option('-r, --remote <remotePath>', '上传到的远程服务目录地址')
  .action((cmd) => {
    console.log(cleanArgs(cmd));
  })


program
  .command('init [app-name]')
  .description('选择项目初始化模版生成初始化项目')
  .action((value) => {
    require('../src/packages/selectTemplate/index.js')(value)
  })

program.commands.forEach(c => c.on('--help', () => console.log()))

// enhance common error messages
const enhanceErrorMessages = require('../src/utils/enhanceErrorMessages')


enhanceErrorMessages('missingArgument', argName => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

enhanceErrorMessages('unknownOption', optionName => {
  return `Unknown option ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option, flag) => {
  return `Missing required argument for option ${chalk.yellow(option.flags)}` + (
    flag ? `, got ${chalk.yellow(flag)}` : ``
  )
})

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}



function camelize (str) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function cleanArgs (cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ''))
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}