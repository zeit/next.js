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
  parsedUrl: UrlWithParsedQuery
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

  let upstreamBuffer: Buffer
  let upstreamType: string | null
  let upstreamCache: string | null

  try {
    const resBuffers: Buffer[] = []
    const mockRes: any = new Stream.Writable()

    const isStreamFinished = new Promise(function (resolve, reject) {
      mockRes.on('finish', () => resolve(true))
      mockRes.on('end', () => resolve(true))
      mockRes.on('error', () => reject())
    })

    mockRes.write = (chunk: Buffer | string) => {
      resBuffers.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
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
    res.statusCode = mockRes.statusCode

    upstreamBuffer = Buffer.concat(resBuffers)
    upstreamType = mockRes.getHeader('Content-Type')
    upstreamCache = mockRes.getHeader('Cache-Control')
  } catch (err) {
    res.statusCode = 500
    res.end('"url" parameter is valid but upstream response is invalid')
    return { finished: true }
  }

  if (upstreamType !== 'text/html') {
    res.statusCode = 500
    res.end('"url" parameter is valid but upstream response is not text/html')
    return { finished: true }
  }

  const html = upstreamBuffer.toString('utf8')
  const isDev = process.env.NODE_ENV !== 'production'
  const buffer = await getScreenshot(isDev, html, width, height, type)
  sendResponse(req, res, buffer, upstreamCache, upstreamType)
  return { finished: true }
}

function sendResponse(
  _req: IncomingMessage,
  res: ServerResponse,
  buffer: Buffer,
  cacheControl: string | null,
  contentType: string | null
) {
  if (cacheControl) {
    res.setHeader('Cache-Control', cacheControl)
  }
  if (contentType) {
    res.setHeader('Content-Type', contentType)
  }
  res.end(buffer)
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
  html: string,
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
  await page.setContent(html)
  const file = await page.screenshot({ type, encoding: 'binary' })
  if (!file || typeof file === 'string') {
    throw new Error('Unexpected file type')
  }
  await page.close()
  return file
}
