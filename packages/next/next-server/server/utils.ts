import { ServerResponse } from 'http'
import { BLOCKED_PAGES } from '../lib/constants'

export function isBlockedPage(pathname: string): boolean {
  return BLOCKED_PAGES.indexOf(pathname) !== -1
}

export function cleanAmpPath(pathname: string): string {
  if (pathname.match(/\?amp=(y|yes|true|1)/)) {
    pathname = pathname.replace(/\?amp=(y|yes|true|1)&?/, '?')
  }
  if (pathname.match(/&amp=(y|yes|true|1)/)) {
    pathname = pathname.replace(/&amp=(y|yes|true|1)/, '')
  }
  pathname = pathname.replace(/\?$/, '')
  return pathname
}

export interface ResponseLike {
  rawResponse: ServerResponse

  end(chunk: any): void
  hasSent(): boolean
  set(name: string, value: number | string | string[]): ResponseLike
  status(statusCode: number): ResponseLike
}
