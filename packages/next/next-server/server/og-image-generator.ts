import { IncomingMessage, ServerResponse } from 'http'
import Stream from 'stream'
import nodeUrl, { UrlWithParsedQuery } from 'url'
import Server from './next-server'
import puppeteer from 'puppeteer-core'

let browser: puppeteer.Browser | undefined

/* eslint-disable-next-line */
enum ImageType {
  png = 'png',
  jpeg = 'jpeg',
}

export async function ogImageGenerator(
  server: Server,
  req: IncomingMessage,
  res: ServerResponse,
  parsedUrl: UrlWithParsedQuery,
  isDev = false
) {
  const { url, w, h, t } = parsedUrl.query

  if (!url) {
    res.statusCode = 400
    res.end('"url" parameter is required')
    return { finished: true }
  } else if (Array.isArray(url)) {
    res.statusCode = 400
    res.end('"url" parameter cannot be an array')
    return { finished: true }
  }

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

  if (!t) {
    res.statusCode = 400
    res.end('"t" parameter (type) is required')
    return { finished: true }
  } else if (Array.isArray(t)) {
    res.statusCode = 400
    res.end('"t" parameter (type) cannot be an array')
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

  let type = t as ImageType
  if (!Object.values(ImageType).includes(type)) {
    res.statusCode = 400
    res.end(
      `"t" parameter (type) must be one of: ${Object.keys(ImageType).join(
        '\n'
      )}`
    )
    return { finished: true }
  }

  let upstreamStatus: number
  let upstreamCache: string | null

  try {
    const mockRes: any = new Stream.Writable()

    const isStreamFinished = new Promise(function (resolve, reject) {
      mockRes.on('finish', () => resolve(true))
      mockRes.on('end', () => resolve(true))
      mockRes.on('error', () => reject())
    })

    mockRes.write = (_chunk: Buffer | string) => {
      // no-op
    }
    mockRes._write = (chunk: Buffer | string) => {
      mockRes.write(chunk)
    }

    const mockHeaders: Record<string, string | string[]> = {}

    mockRes.writeHead = (_status: any, _headers: any) =>
      Object.assign(mockHeaders, _headers)
    mockRes.getHeader = (name: string) => mockHeaders[name.toLowerCase()]
    mockRes.getHeaders = () => mockHeaders
    mockRes.getHeaderNames = () => Object.keys(mockHeaders)
    mockRes.setHeader = (name: string, value: string | string[]) =>
      (mockHeaders[name.toLowerCase()] = value)
    mockRes._implicitHeader = () => {}
    mockRes.finished = false
    mockRes.statusCode = 200

    const mockReq: any = new Stream.Readable()

    mockReq._read = () => {
      mockReq.emit('end')
      mockReq.emit('close')
      return Buffer.from('')
    }

    mockReq.headers = req.headers
    mockReq.method = req.method
    mockReq.url = url

    await server.getRequestHandler()(mockReq, mockRes, nodeUrl.parse(url, true))
    await isStreamFinished
    upstreamStatus = mockRes.statusCode
    upstreamCache = mockRes.getHeader('Cache-Control')
  } catch (err) {
    res.statusCode = 500
    res.end('"url" parameter is valid but upstream response is invalid')
    return { finished: true }
  }

  const proto = isDev ? 'http' : 'https'
  const host = req.headers.host
  console.log({ url, prefix: `${proto}://${host}` })
  const absoluteUrl = new URL(url, `${proto}://${host}`)
  const buffer = await getScreenshot(isDev, absoluteUrl, width, height, type)
  res.statusCode = upstreamStatus
  res.setHeader('Content-Type', `image/${type}`)
  // TODO: should we also set ETag header?
  if (upstreamCache) {
    res.setHeader('Cache-Control', upstreamCache)
  }
  res.end(buffer)
  return { finished: true }
}

function getOptions(isDev: boolean) {
  if (!isDev) {
    throw new Error('Production is not implemented yet')
  }
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

async function getScreenshot(
  isDev: boolean,
  url: URL,
  width: number,
  height: number,
  type: ImageType
) {
  if (!browser) {
    const options = getOptions(isDev)
    browser = await puppeteer.launch(options)
  }
  const page = await browser.newPage()
  await page.setViewport({ width, height })
  await page.goto(url.href)
  const file = await page.screenshot({ type, encoding: 'binary' })
  if (!file || typeof file === 'string') {
    throw new Error('Expected buffer but found ' + typeof file)
  }
  await page.close()
  return file
}
