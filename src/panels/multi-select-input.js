/* eslint-disable max-classes-per-file, no-await-in-loop */

import * as vscode from 'vscode'
import {window, QuickInputButtons} from 'vscode'
import {Octokit} from '@octokit/core'

import {APIS, EXTENSION_NAME} from '../constants'

export default async function multiStepInput() {
  async function collectInputs() {
    const state = {}
    await MultiStepInput.run(input => inputToken(input, state))
    return state
  }

  const title = 'Github Blogger Initialization'

  async function inputToken(input, state) {
    state.token = await input.showInputBox({
      title,
      step: 1,
      totalSteps: 3,
      value: state.token || '',
      prompt: 'Enter your GitHub token',
      validate: validateNameIsUnique,
      shouldResume,
    })
    return input => inputUser(input, state)
  }

  async function inputUser(input, state) {
    state.user = await input.showInputBox({
      title,
      step: 2,
      totalSteps: 3,
      value: state.user || '',
      prompt: 'Enter your GitHub username(owner)',
      validate: validateNameIsUnique,
      shouldResume,
    })
    return input => inputRepoForIssue(input, state)
  }

  async function inputRepoForIssue(input, state) {
    state.repo = await input.showInputBox({
      title,
      step: 3,
      totalSteps: 3,
      value: state.repo || '',
      prompt:
        'Create a empty github repo for your issue blog, give a name for the repo. If the repo already exists, it will not be recreated.',
      validate: validateNameIsUnique,
      shouldResume,
    })
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise((_resolve, _reject) => {
      // noop
      _resolve()
    })
  }

  async function validateNameIsUnique(name) {
    // ...validate...
    return !name ? 'Can not be empty' : undefined
  }
  const state = await collectInputs()
  await vscode.workspace
    .getConfiguration(EXTENSION_NAME)
    .update('token', state.token, vscode.ConfigurationTarget.Global)

  await vscode.workspace
    .getConfiguration(EXTENSION_NAME)
    .update('user', state.user, vscode.ConfigurationTarget.Global)

  await vscode.workspace
    .getConfiguration(EXTENSION_NAME)
    .update('repo', state.repo, vscode.ConfigurationTarget.Global)

  const octokit = new Octokit({auth: state.token})

  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Window,
      cancellable: false,
      title: 'Creating the issue blog...',
    },
    async progress => {
      progress.report({increment: 0})

      const repoName = state.repo

      try {
        await octokit.request(APIS.CREATE_REPO, {name: repoName})
        window.showInformationMessage('Github Blogger initialization is completed.')
      } catch (e) {
        if (e.message.includes('already exists')) {
          window.showInformationMessage(
            `Github Blogger initialization is completed. The ${repoName} repo already exists, skip the creation step.`
          )
          return
        }

        window.showErrorMessage(
          `Github Blogger initialization failed, please check the config.\n${e.message}`
        )
      }
      progress.report({increment: 100})
    }
  )
}

class InputFlowAction {
  static back = new InputFlowAction()
  static cancel = new InputFlowAction()
  static resume = new InputFlowAction()
}

class MultiStepInput {
  static async run(start) {
    const input = new MultiStepInput()
    return input.stepThrough(start)
  }

  current
  steps = []

  async stepThrough(start) {
    let step = start
    while (step) {
      this.steps.push(step)
      if (this.current) {
        this.current.enabled = false
        this.current.busy = true
      }
      try {
        step = await step(this)
      } catch (err) {
        if (err === InputFlowAction.back) {
          this.steps.pop()
          step = this.steps.pop()
        } else if (err === InputFlowAction.resume) {
          step = this.steps.pop()
        } else if (err === InputFlowAction.cancel) {
          step = undefined
        } else {
          throw err
        }
      }
    }
    if (this.current) {
      this.current.dispose()
    }
  }

  async showInputBox({title, step, totalSteps, value, prompt, validate, buttons, shouldResume}) {
    const disposables = []
    try {
      return await new Promise((resolve, reject) => {
        const input = window.createInputBox()
        input.title = title
        input.step = step
        input.totalSteps = totalSteps
        input.value = value || ''
        input.prompt = prompt
        input.buttons = [
          ...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
          ...(buttons || []),
        ]
        let validating = validate('')
        disposables.push(
          input.onDidTriggerButton(item => {
            if (item === QuickInputButtons.Back) {
              reject(InputFlowAction.back)
            } else {
              resolve(item)
            }
          }),
          input.onDidAccept(async () => {
            const {value} = input
            input.enabled = false
            input.busy = true
            if (!(await validate(value))) {
              resolve(value)
            }
            input.enabled = true
            input.busy = false
          }),
          input.onDidChangeValue(async text => {
            const current = validate(text)
            validating = current
            const validationMessage = await current
            if (current === validating) {
              input.validationMessage = validationMessage
            }
          }),
          input.onDidHide(() => {
            console.log('onDidHide', InputFlowAction.cancel, InputFlowAction.resume)
            ;(async () => {
              reject(
                shouldResume && (await shouldResume())
                  ? InputFlowAction.resume
                  : InputFlowAction.cancel
              )
            })().catch(reject)
          })
        )
        if (this.current) {
          this.current.dispose()
        }
        this.current = input
        this.current.show()
      })
    } finally {
      disposables.forEach(d => d.dispose())
    }
  }
}
