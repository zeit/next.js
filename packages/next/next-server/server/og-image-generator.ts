import { IncomingMessage } from 'http'
import puppeteer from 'puppeteer-core'
import { NextConfig } from '../../next-server/server/config-shared'
import { OgImageConfig, ogImageConfigDefault } from './og-image-config'

let browser: puppeteer.Browser | undefined

export async function ogImageGenerator(
  req: IncomingMessage,
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
    throw new Error(`expected extension to end with ${type}`)
  }

  const { localAddress, localPort } = req.connection
  const proto = (req.connection as any)?._server?.secureProtocol
    ? 'https'
    : 'http'
  const absoluteUrl = new URL(
    `${proto}://${localAddress}:${localPort}${upstreamPathname}`
  )
  // TODO: set upstream query string params too?
  absoluteUrl.searchParams.set('__nextImageNonce', nonce)

  return getScreenshot(absoluteUrl, config)
}

export async function getScreenshot(
  url: URL,
  { width, height, type, browserExePath }: OgImageConfig
): Promise<{
  buffer: Buffer
  contentType: string
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

  // TODO: should we also set ETag header?
  // re-use send-payload util?
  return {
    buffer: file,
    upstreamStatus,
    upstreamCache,
    contentType: `image/${type}`,
  }
}
