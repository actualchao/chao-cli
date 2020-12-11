#!/usr/bin/env node
const program = require('commander')
const selectTemplate = require('../src/selectTemplate.js')
const chalk = require('chalk');

const PACKAGE = require('../package.json')

program.version(PACKAGE.version)

program.on('--help', () => {
  console.log('Select relase version using cli')
})

if (!process.argv.slice(2).length) {
  selectTemplate().then(() => {
    console.log(chalk.green('init Template successed ! Go!!!!'));
  }).catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

program.parse(process.argv)
