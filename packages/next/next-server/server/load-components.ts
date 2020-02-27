import { IncomingMessage, ServerResponse } from 'http'
import { ParsedUrlQuery } from 'querystring'
import {
  BUILD_MANIFEST,
  CLIENT_STATIC_FILES_PATH,
  REACT_LOADABLE_MANIFEST,
  SERVER_DIRECTORY,
  STATIC_PROPS_ID,
  SERVER_PROPS_ID,
} from '../lib/constants'
import { join } from 'path'
import { requirePage } from './require'
import { BuildManifest } from './get-page-files'
import { AppType, DocumentType } from '../lib/utils'
import { PageConfig, NextPageContext } from 'next/types'
import { Env } from '../../lib/load-env-config'

export function interopDefault(mod: any) {
  return mod.default || mod
}

function addComponentPropsId(
  Component: any,
  getStaticProps: any,
  getServerProps: any
) {
  // Mark the component with the SSG or SSP id here since we don't run
  // the SSG babel transform for server mode
  if (getStaticProps) {
    Component[STATIC_PROPS_ID] = true
  } else if (getServerProps) {
    Component[SERVER_PROPS_ID] = true
  }
}

export type ManifestItem = {
  id: number | string
  name: string
  file: string
  publicPath: string
}

type ReactLoadableManifest = { [moduleId: string]: ManifestItem[] }

type Unstable_getStaticProps = (ctx: {
  env: Env
  params: ParsedUrlQuery | undefined
  preview?: boolean
  previewData?: any
}) => Promise<{
  props: { [key: string]: any }
  revalidate?: number | boolean
}>

export type Unstable_getStaticPaths = () => Promise<{
  paths: Array<string | { params: ParsedUrlQuery }>
}>

type Unstable_getServerProps = (context: {
  env: Env
  params: ParsedUrlQuery | undefined
  req: IncomingMessage
  res: ServerResponse
  query: ParsedUrlQuery
}) => Promise<{ [key: string]: any }>

export type LoadComponentsReturnType = {
  Component: React.ComponentType
  pageConfig?: PageConfig
  buildManifest: BuildManifest
  reactLoadableManifest: ReactLoadableManifest
  Document: DocumentType
  DocumentMiddleware?: (ctx: NextPageContext) => void
  App: AppType
  unstable_getStaticProps?: Unstable_getStaticProps
  unstable_getStaticPaths?: Unstable_getStaticPaths
  unstable_getServerProps?: Unstable_getServerProps
}

export async function loadComponents(
  distDir: string,
  buildId: string,
  pathname: string,
  serverless: boolean
): Promise<LoadComponentsReturnType> {
  if (serverless) {
    const Component = await requirePage(pathname, distDir, serverless)
    const {
      unstable_getStaticProps,
      unstable_getStaticPaths,
      unstable_getServerProps,
    } = Component

    addComponentPropsId(
      Component,
      unstable_getStaticProps,
      unstable_getServerProps
    )

    return {
      Component,
      pageConfig: Component.config || {},
      unstable_getStaticProps,
      unstable_getStaticPaths,
      unstable_getServerProps,
    } as LoadComponentsReturnType
  }
  const documentPath = join(
    distDir,
    SERVER_DIRECTORY,
    CLIENT_STATIC_FILES_PATH,
    buildId,
    'pages',
    '_document'
  )
  const appPath = join(
    distDir,
    SERVER_DIRECTORY,
    CLIENT_STATIC_FILES_PATH,
    buildId,
    'pages',
    '_app'
  )

  const DocumentMod = require(documentPath)
  const { middleware: DocumentMiddleware } = DocumentMod

  const AppMod = require(appPath)

  const ComponentMod = requirePage(pathname, distDir, serverless)

  const [
    buildManifest,
    reactLoadableManifest,
    Component,
    Document,
    App,
  ] = await Promise.all([
    require(join(distDir, BUILD_MANIFEST)),
    require(join(distDir, REACT_LOADABLE_MANIFEST)),
    interopDefault(ComponentMod),
    interopDefault(DocumentMod),
    interopDefault(AppMod),
  ])

  const {
    unstable_getServerProps,
    unstable_getStaticProps,
    unstable_getStaticPaths,
  } = ComponentMod

  addComponentPropsId(
    Component,
    unstable_getStaticProps,
    unstable_getServerProps
  )

  return {
    App,
    Document,
    Component,
    buildManifest,
    DocumentMiddleware,
    reactLoadableManifest,
    pageConfig: ComponentMod.config || {},
    unstable_getServerProps,
    unstable_getStaticProps,
    unstable_getStaticPaths,
  }
}
