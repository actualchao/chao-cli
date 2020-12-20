const chalk = require('chalk');
const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule({ output: process.stderr })
const path = require('path')

module.exports = function () {
  const packageJson = require('fs-extra').readJSONSync(path.join(process.cwd(), 'package.json'))
  const { scripts } = packageJson
  return Object.keys(scripts).filter(item => item.includes('build'))
}

