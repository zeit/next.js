import { IncomingMessage, ServerResponse } from 'http'
import path from 'path'
import { UrlWithParsedQuery } from 'url'
import puppeteer from 'puppeteer-core'

let browser: puppeteer.Browser | undefined

// eslint-disable-next-line
enum ImageType {
  png = 'png',
  jpeg = 'jpeg',
}

export async function ogImageGenerator(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  query: UrlWithParsedQuery['query'],
  nonce: string
) {
  const { w, h } = query

  if (!w) {
    res.statusCode = 400
    res.end('"w" parameter (width) is required')
    return { finished: true }
  } else if (Array.isArray(w)) {
    res.statusCode = 400
    res.end('"w" parameter (width) cannot be an array')
    return { finished: true }
  }

  if (!h) {
    res.statusCode = 400
    res.end('"h" parameter (height) is required')
    return { finished: true }
  } else if (Array.isArray(h)) {
    res.statusCode = 400
    res.end('"h" parameter (height) cannot be an array')
    return { finished: true }
  }

  const width = parseInt(w, 10)
  if (!width || isNaN(width)) {
    res.statusCode = 400
    res.end('"w" parameter (width) must be a number greater than 0')
    return { finished: true }
  }

  const height = parseInt(h, 10)
  if (!height || isNaN(height)) {
    res.statusCode = 400
    res.end('"h" parameter (height) must be a number greater than 0')
    return { finished: true }
  }

  const type: ImageType = path.extname(pathname).substr(1) as ImageType

  if (!Object.keys(ImageType).includes(type)) {
    res.statusCode = 400
    res.end(
      `"t" parameter (type) must be one of: ${Object.keys(ImageType).join(
        ', '
      )}`
    )
    return { finished: true }
  }

  const { localAddress, localPort } = req.connection
  const _server = (req.connection as any)._server
  const isHTTPS = _server.secureProtocol
  const imageUrl = `http${
    isHTTPS ? 's' : ''
  }://${localAddress}:${localPort}${pathname.replace(
    /\.(jpe?g|png)/,
    ''
  )}?_nextImageNonce=${nonce}`

  const absoluteUrl = new URL(imageUrl)
  const { buffer, upstreamStatus, upstreamCache } = await getScreenshot(
    absoluteUrl,
    width,
    height,
    type
  )

  res.statusCode = upstreamStatus
  res.setHeader('Content-Type', `image/${type}`)

  // TODO: should we also set ETag header?
  // re-use send-payload util?
  if (upstreamCache) {
    res.setHeader('Cache-Control', upstreamCache)
  }
  res.end(buffer)
  return { finished: true }
}

function getOptions() {
  return {
    args: [],
    headless: true,
    executablePath: process.env.NEXT_BROWSER_EXE
      ? process.env.NEXT_BROWSER_EXE
      : process.platform === 'win32'
      ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
      : process.platform === 'linux'
      ? '/usr/bin/google-chrome'
      : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  }
}

export async function getScreenshot(
  url: URL,
  width: number,
  height: number,
  type: ImageType
): Promise<{
  buffer: Buffer
  upstreamStatus: number
  upstreamCache: string
}> {
  if (!browser) {
    const options = getOptions()
    browser = await puppeteer.launch(options)
  }
  const page = await browser.newPage()
  await page.setViewport({ width, height })
  const response = await page.goto(url.href)
  const upstreamStatus = response.status()
  const upstreamCache = response.headers()['cache-control']
  const file = await page.screenshot({ type, encoding: 'binary' })

  if (!file || typeof file === 'string') {
    throw new Error('Expected buffer but found ' + typeof file)
  }
  await page.close()

  return {
    buffer: file,
    upstreamStatus,
    upstreamCache,
  }
}
