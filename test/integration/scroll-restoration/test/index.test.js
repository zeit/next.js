/* eslint-env jest */

import fs from 'fs-extra'
import { join } from 'path'
import webdriver from 'next-webdriver'
import {
  killApp,
  findPort,
  launchApp,
  nextStart,
  nextBuild,
  check,
} from 'next-test-utils'

jest.setTimeout(1000 * 60 * 2)

const appDir = join(__dirname, '../')
const nextConfig = join(appDir, 'next.config.js')
let appPort
let app

const runTests = () => {
  it('should restore the scroll position on navigating back', async () => {
    const browser = await webdriver(appPort, '/')
    await browser.eval(() =>
      document.querySelector('#to-another').scrollIntoView()
    )
    const scrollX = Math.floor(await browser.eval(() => window.scrollX))
    const scrollY = Math.floor(await browser.eval(() => window.scrollY))

    await browser.eval(() => window.next.router.push('/another'))

    await check(
      () => browser.eval(() => document.documentElement.innerHTML),
      /hi from another/
    )
    await browser.eval(() => (window.didHydrate = false))

    await browser.eval(() => window.history.back())
    await check(() => browser.eval(() => window.didHydrate), {
      test(content) {
        return content
      },
    })

    const newScrollX = Math.floor(await browser.eval(() => window.scrollX))
    const newScrollY = Math.floor(await browser.eval(() => window.scrollY))

    expect(scrollX).toBe(newScrollX)
    expect(scrollY).toBe(newScrollY)
  })
}

describe('Scroll Restoration Support', () => {
  describe('dev mode', () => {
    beforeAll(async () => {
      appPort = await findPort()
      app = await launchApp(appDir, appPort)
    })
    afterAll(() => killApp(app))

    runTests()
  })

  describe('server mode', () => {
    beforeAll(async () => {
      await nextBuild(appDir)
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(() => killApp(app))

    runTests()
  })

  describe('serverless mode', () => {
    beforeAll(async () => {
      await fs.writeFile(
        nextConfig,
        `
        module.exports = {
          target: 'experimental-serverless-trace'
        }
      `
      )
      await nextBuild(appDir)
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(async () => {
      await fs.remove(nextConfig)
      await killApp(app)
    })

    runTests()
  })
})
