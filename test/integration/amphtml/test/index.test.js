/* eslint-env jest */
/* global jasmine */
import { join } from 'path'
import {
  nextServer,
  nextBuild,
  startApp,
  stopApp,
  renderViaHTTP
} from 'next-test-utils'
import amphtmlValidator from 'amphtml-validator'
const appDir = join(__dirname, '../')
let appPort
let server
let app
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 5

const context = {}

async function validateAMP (html) {
  const validator = await amphtmlValidator.getInstance()
  const result = validator.validateString(html)
  if (result.status !== 'PASS') {
    for (let ii = 0; ii < result.errors.length; ii++) {
      const error = result.errors[ii]
      let msg = 'line ' + error.line + ', col ' + error.col + ': ' + error.message
      if (error.specUrl !== null) {
        msg += ' (see ' + error.specUrl + ')'
      }
      ((error.severity === 'ERROR') ? console.error : console.warn)(msg)
    }
  }
  expect(result.status).toBe('PASS')
}

describe('AMP Usage', () => {
  beforeAll(async () => {
    await nextBuild(appDir)
    app = nextServer({
      dir: join(__dirname, '../'),
      dev: false,
      quiet: true
    })

    server = await startApp(app)
    context.appPort = appPort = server.address().port
  })
  afterAll(() => stopApp(server))

  describe('With basic usage', () => {
    it('should render the page', async () => {
      const html = await renderViaHTTP(appPort, '/')
      expect(html).toMatch(/Hello World/)
    })
  })

  describe('With basic AMP usage', () => {
    it('should render the page', async () => {
      const html = await renderViaHTTP(appPort, '/amp')
      expect(html).toMatch(/Hello World/)
    })

    it('should render the page as valid AMP', async () => {
      const html = await renderViaHTTP(appPort, '/amp')
      await validateAMP(html)
    })
  })
})
