export type OgImageConfig = {
  enable: boolean
  width: number
  height: number
  type: 'png' | 'jpeg'
  browserExePath: string
}

export const ogImageConfigDefault: OgImageConfig = {
  enable: false,
  width: 1200,
  height: 630,
  type: 'png',
  browserExePath:
    process.platform === 'win32'
      ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
      : process.platform === 'linux'
      ? '/usr/bin/google-chrome'
      : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
}
