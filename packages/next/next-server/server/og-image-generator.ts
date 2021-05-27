import { IncomingMessage, ServerResponse } from 'http'
import puppeteer from 'puppeteer-core'
import { NextConfig } from '../../next-server/server/config-shared'
import { OgImageConfig, ogImageConfigDefault } from './og-image-config'

let browser: puppeteer.Browser | undefined

export async function ogImageGenerator(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  nextConfig: NextConfig,
  nonce: string
) {
  const config = nextConfig.experimental.ogImage || ogImageConfigDefault
  const parts = pathname.split('.')
  const extension = parts.pop()
  const upstreamPathname = parts.join('.')
  const type = config.type

  if (extension !== type) {
    res.statusCode = 400
    res.end(`expected extension to end with ${type}`)
    return { finished: true }
  }

  const { localAddress, localPort } = req.connection
  const proto = (req.connection as any)?._server?.secureProtocol
    ? 'https'
    : 'http'
  const absoluteUrl = new URL(
    `${proto}://${localAddress}:${localPort}${upstreamPathname}`
  )
  absoluteUrl.searchParams.set('_nextImageNonce', nonce)
  // TODO: set upstream query string params too?

  const { buffer, upstreamStatus, upstreamCache } = await getScreenshot(
    absoluteUrl,
    config
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

export async function getScreenshot(
  url: URL,
  { width, height, type, browserExePath }: OgImageConfig
): Promise<{
  buffer: Buffer
  upstreamStatus: number
  upstreamCache: string
}> {
  if (!browser) {
    browser = await puppeteer.launch({
      args: [],
      headless: true,
      executablePath: browserExePath,
    })
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
