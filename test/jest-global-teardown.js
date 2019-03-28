'use strict'

let globalTeardown
const browser = global.browser

if (process.env.BROWSERSTACK_USERNAME) {
  globalTeardown = () => global.browserStackLocal.killAllProcesses(() => {})
} else {
  const chromedriver = require('chromedriver')
  globalTeardown = () => chromedriver.stop()
}

module.exports = async () => {
  await globalTeardown()

  if (browser) {
    // Close all remaining browser windows
    const windows = await browser.windowHandles()
    for (const window of windows) {
      if (!window) continue
      await browser.window(window)
      await browser.origClose()
    }
  }
}
