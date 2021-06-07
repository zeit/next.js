import { NextConfig } from './config-shared'

export class OgImageUtil {
  private enabled: boolean

  constructor(nextConfig: NextConfig) {
    this.enabled = Boolean(nextConfig?.experimental.ogImage?.enable)
  }

  isOgImageHtmlPage(page: string) {
    return this.enabled && page.endsWith('.image')
  }

  isOgImageBinaryPage(page: string) {
    return this.enabled && /\.image\.(jpeg|png)$/.test(page)
  }

  convertBinaryPageToHtmlPage(page: string) {
    return this.enabled ? page.replace(/\.(jpeg|png)$/, '') : page
  }
}
