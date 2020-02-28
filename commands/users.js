
module.exports = async function () {
  const path = require('path')
  const appDir = path.join(__dirname, '..')

  require('@babel/register')({
    cwd: appDir,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
    only: [
      'lib/*',
      path.join(process.cwd(), 'services'),
      path.join(process.cwd(), 'tasks'),
      path.join(process.cwd(), 'config.js')
    ]
  })

  const argv = require('minimist')(process.argv.slice(2))
  const substruct = require('@internalfx/substruct')
  const taskFilePath = path.join(process.cwd(), 'tasks')
  const buildContextPath = path.join(process.cwd(), 'context.js')
  const inquirer = require('inquirer')
  const _ = require('lodash')

  console.log(appDir)

  substruct.configure({
    build: false,
    runCron: false,
    runDir: process.cwd(),
    appDir,
    taskFilePath,
    buildContextPath,
    services: [
      'userConfig',
      'arango',
      'schema',
      'bcrypt'
    ]
  })

  await substruct.load()

  const { arango, aql } = substruct.services.arango
  const bcrypt = substruct.services.bcrypt

  const mainMenu = async function () {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Create User', value: 'create' },
          { name: 'Reset User Password', value: 'reset' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ])

    if (answers.action === 'create') {
      await createUser()
      await mainMenu()
    } else if (answers.action === 'reset') {
      await resetPassword()
      await mainMenu()
    } else if (answers.action === 'exit') {
      await substruct.stop()
    }
  }

  const createUser = async function () {
    const answers = await inquirer.prompt([
      {
        type: 'text',
        name: 'firstName',
        message: 'First Name?'
      },
      {
        type: 'text',
        name: 'lastName',
        message: 'Last Name?'
      },
      {
        type: 'email',
        name: 'email',
        message: 'Email?'
      },
      {
        type: 'list',
        name: 'role',
        message: 'Role?',
        choices: [
          { name: 'User', value: 'USR' },
          { name: 'Administrator', value: 'ADM' }
        ]
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password?'
      }
    ])

    let record = _.omit(answers, 'password')

    record.createdAt = new Date()
    record.updatedAt = new Date()

    record.passwordHash = await bcrypt.hashPassword(answers.password)

    record = await arango.qNext(aql`
      INSERT ${record} INTO users RETURN NEW
    `)

    console.log('User Created!')
  }

  const resetPassword = async function () {
    let users = await arango.qAll(aql`
      FOR user IN users
        RETURN user
    `)

    users = users.map(function (user) {
      return {
        name: `${user.firstName} ${user.lastName} [${user.email}]`,
        value: user._key
      }
    })

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'user',
        message: 'User?',
        choices: users
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password?'
      }
    ])

    const passwordHash = await bcrypt.hashPassword(answers.password)

    await arango.q(aql`
      UPDATE ${answers.user} WITH { passwordHash: ${passwordHash} } IN users
    `)

    console.log('Password Updated!')
  }

  return mainMenu()
}
