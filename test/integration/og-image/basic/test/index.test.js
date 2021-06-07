/* eslint-env jest */
import sizeOf from 'image-size'
import {
  fetchViaHTTP,
  File,
  findPort,
  killApp,
  launchApp,
  nextBuild,
  nextStart,
  waitFor,
} from 'next-test-utils'
import { join } from 'path'

jest.setTimeout(1000 * 60 * 2)

const appDir = join(__dirname, '../')
const nextConfig = new File(join(appDir, 'next.config.js'))
let appPort
let app

async function expectImage(res, width, height) {
  const buffer = await res.buffer()
  const d = sizeOf(buffer)
  expect(d.width).toBe(width)
  expect(d.height).toBe(height)
}

function runTests({ isDev, width = 1200, height = 630, type = 'png' }) {
  it('should return home page', async () => {
    const res = await fetchViaHTTP(appPort, '/', null, {})
    expect(await res.text()).toMatch(/Home Page/m)
  })

  it('should return basic page', async () => {
    const res = await fetchViaHTTP(appPort, '/basic', null, {})
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8')
    const text = await res.text()

    if (isDev) {
      expect(res.headers.get('cache-control')).toBe('no-store, must-revalidate')
      expect(res.headers.get('etag')).toBeTruthy()
    } else {
      expect(res.headers.get('cache-control')).toBeFalsy()
      expect(res.headers.get('etag')).toBeTruthy()
      expect(text).toMatch(
        `<meta name="og:image" content="/basic.image.${type}"/>`
      )
      expect(text).toMatch(`<meta name="og:image:type" content="${type}"/>`)
      expect(text).toMatch(`<meta name="og:image:width" content="${width}"/>`)
      expect(text).toMatch(`<meta name="og:image:height" content="${height}"/>`)
    }
    expect(text).toMatch(/Basic Page/m)
    expect(text).toMatch(/View Source to see/)
  })

  it('should return basic image binary', async () => {
    const res = await fetchViaHTTP(appPort, `/basic.image.${type}`, null, {})
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe(`image/${type}`)
    if (isDev) {
      expect(res.headers.get('cache-control')).toBe('no-store, must-revalidate')
      expect(res.headers.get('etag')).toBeTruthy()
    } else {
      expect(res.headers.get('cache-control')).toBeFalsy()
      expect(res.headers.get('etag')).toBeTruthy()
    }
    expectImage(res, width, height)
  })

  if (isDev) {
    it('should return basic image as html in development', async () => {
      const res = await fetchViaHTTP(appPort, '/basic.image', null, {})
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8')
      expect(res.headers.get('cache-control')).toBe('no-store, must-revalidate')
    })
  } else {
    it('should not return basic image as html in production', async () => {
      const res = await fetchViaHTTP(appPort, '/basic.image', null, {})
      expect(res.status).toBe(404)
      expect(res.headers.get('cache-control')).toBeFalsy()
      expect(res.headers.get('etag')).toBeTruthy()
    })
  }

  it('should set 304 status without body when etag matches if-none-match', async () => {
    const res1 = await fetchViaHTTP(appPort, `/basic.image.${type}`, null, {})
    expect(res1.status).toBe(200)
    // expect(res1.headers.get('Cache-Control')).toBe(
    //   'public, max-age=0, must-revalidate'
    // )
    const etag = res1.headers.get('Etag')
    expect(etag).toBeTruthy()
    expectImage(res1, width, height)

    const opts2 = { headers: { 'if-none-match': etag } }
    const res2 = await fetchViaHTTP(
      appPort,
      `/basic.image.${type}`,
      null,
      opts2
    )
    expect(res2.status).toBe(304)
    //expect(res2.headers.get('Content-Type')).toBeFalsy()
    expect(res2.headers.get('Etag')).toBe(etag)
    expect((await res2.buffer()).length).toBe(0)
  })

  it('should error image if SSG upstream errors', async () => {
    // TODO: write test
  })
}

describe('OG Image Basic Usage', () => {
  describe('config checks', () => {
    it('should error when width contains invalid value', async () => {
      await nextConfig.replace(
        '{ /* replaceme */ }',
        JSON.stringify({
          experimental: {
            ogImage: {
              width: '100',
            },
          },
        })
      )
      let stderr = ''

      app = await launchApp(appDir, await findPort(), {
        onStderr(msg) {
          stderr += msg || ''
        },
      })
      await waitFor(1000)
      await killApp(app).catch(() => {})
      await nextConfig.restore()

      expect(stderr).toContain(
        'Specified ogImage.width should be a number received string'
      )
    })
    it('should error when height contains invalid value', async () => {
      await nextConfig.replace(
        '{ /* replaceme */ }',
        JSON.stringify({
          experimental: {
            ogImage: {
              height: {},
            },
          },
        })
      )
      let stderr = ''

      app = await launchApp(appDir, await findPort(), {
        onStderr(msg) {
          stderr += msg || ''
        },
      })
      await waitFor(1000)
      await killApp(app).catch(() => {})
      await nextConfig.restore()

      expect(stderr).toContain(
        'Specified ogImage.height should be a number received object'
      )
    })
    it('should error when type contains invalid value', async () => {
      await nextConfig.replace(
        '{ /* replaceme */ }',
        JSON.stringify({
          experimental: {
            ogImage: {
              type: 123,
            },
          },
        })
      )
      let stderr = ''

      app = await launchApp(appDir, await findPort(), {
        onStderr(msg) {
          stderr += msg || ''
        },
      })
      await waitFor(1000)
      await killApp(app).catch(() => {})
      await nextConfig.restore()

      expect(stderr).toContain(
        'Specified ogImage.type should be either png or jpeg received 123'
      )
    })
    it('should error when browserExePath contains invalid value', async () => {
      await nextConfig.replace(
        '{ /* replaceme */ }',
        JSON.stringify({
          experimental: {
            ogImage: {
              browserExePath: 123,
            },
          },
        })
      )
      let stderr = ''

      app = await launchApp(appDir, await findPort(), {
        onStderr(msg) {
          stderr += msg || ''
        },
      })
      await waitFor(1000)
      await killApp(app).catch(() => {})
      await nextConfig.restore()

      expect(stderr).toContain(
        'Specified ogImage.browserExePath should be a string received number'
      )
    })
  })

  describe('dev support w/o next.config.js', () => {
    const ogImage = {
      enable: true,
    }
    beforeAll(async () => {
      const json = JSON.stringify({
        experimental: { ogImage },
      })
      nextConfig.replace('{ /* replaceme */ }', json)
      appPort = await findPort()
      app = await launchApp(appDir, appPort)
    })
    afterAll(async () => {
      await killApp(app)
      nextConfig.restore()
    })

    runTests({ ...ogImage, isDev: true })
  })

  describe('dev support with next.config.js', () => {
    const ogImage = {
      enable: true,
      width: 768,
      height: 403,
      type: 'jpeg',
    }
    beforeAll(async () => {
      const json = JSON.stringify({
        experimental: { ogImage },
      })
      nextConfig.replace('{ /* replaceme */ }', json)
      appPort = await findPort()
      app = await launchApp(appDir, appPort)
    })
    afterAll(async () => {
      await killApp(app)
      nextConfig.restore()
    })

    runTests({ ...ogImage, isDev: true })
  })

  describe('Server support w/o next.config.js', () => {
    const ogImage = {
      enable: true,
    }
    beforeAll(async () => {
      const json = JSON.stringify({
        experimental: { ogImage },
      })
      nextConfig.replace('{ /* replaceme */ }', json)
      await nextBuild(appDir)
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(async () => {
      await killApp(app)
      nextConfig.restore()
    })

    runTests({ ...ogImage, isDev: false })
  })

  describe('Server support with next.config.js', () => {
    const ogImage = {
      enable: true,
      width: 768,
      height: 403,
      type: 'jpeg',
    }
    beforeAll(async () => {
      const json = JSON.stringify({
        experimental: { ogImage },
      })
      nextConfig.replace('{ /* replaceme */ }', json)
      await nextBuild(appDir)
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(async () => {
      await killApp(app)
      nextConfig.restore()
    })

    runTests({ ...ogImage, isDev: false })
  })
})
