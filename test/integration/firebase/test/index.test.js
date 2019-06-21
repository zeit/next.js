/* eslint-env jest */
/* global jasmine */
import { join } from 'path'
import {
  killApp,
  findPort,
  nextBuild,
  nextStart,
  renderViaHTTP
} from 'next-test-utils'
const appDir = join(__dirname, '../')
let appPort
let app
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 5

describe('Serverless', () => {
  beforeAll(async () => {
    await nextBuild(appDir, [])
    appPort = await findPort()
    app = await nextStart(appDir, appPort)
  })
  afterAll(() => killApp(app))

  it('should render the page', async () => {
    const html = await renderViaHTTP(appPort, '/')
    expect(html).toMatch(/Hello Firebase: 0/)
  })
})
