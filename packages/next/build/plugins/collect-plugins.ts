import findUp from 'find-up'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import resolve from 'next/dist/compiled/resolve/index.js'
import { execOnce } from '../../next-server/lib/utils'

const readdir = promisify(fs.readdir)

export type PluginMetaData = {
  requiredEnv: string[]
  middleware: string[]
  pluginName: string
  directory: string
  pkgName: string
  version: string
  config?: { [name: string]: any }
}

// currently supported middleware
export const VALID_MIDDLEWARE = [
  'document-head-tags-server',
  'document-body-tags-server',
  'document-html-props-server',
  'enhance-app-server',
  'get-styles-server',
  'on-init-client',
  'on-init-server',
  'on-error-server',
  'on-error-client',
  'on-error-client',
  'on-error-server',
  'unstable-post-hydration',
  'babel-preset-build',
]

type ENV_OPTIONS = { [name: string]: string }

const exitWithError = (error: string) => {
  console.error(error)
  process.exit(1)
}

async function collectPluginMeta(
  env: ENV_OPTIONS,
  pluginPackagePath: string
): Promise<PluginMetaData> {
  const pkgDir = path.dirname(pluginPackagePath)
  const pluginPackageJson = require(pluginPackagePath)
  const pluginMetaData: {
    name: string
    'required-env': string[]
  } = pluginPackageJson.nextjs

  if (!pluginMetaData) {
    exitWithError('Next.js plugins need to have a "nextjs" key in package.json')
  }

  if (!pluginMetaData.name) {
    exitWithError(
      'Next.js plugins need to have a "nextjs.name" key in package.json'
    )
  }

  // TODO: add err.sh explaining requirements
  let middleware: string[] = []
  try {
    middleware = await readdir(path.join(pkgDir, 'src'))
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(err)
    }
    exitWithError(
      `Failed to read src/ directory for Next.js plugin: ${pluginMetaData.name}`
    )
  }

  // remove the extension from the middleware
  middleware = middleware.map(item => {
    const parts = item.split('.')
    parts.pop()
    return parts.join('.')
  })

  const invalidMiddleware: string[] = []

  for (const item of middleware) {
    if (!VALID_MIDDLEWARE.includes(item)) {
      invalidMiddleware.push(item)
    }
  }

  if (invalidMiddleware.length > 0) {
    console.error(
      `Next.js Plugin: ${
        pluginMetaData.name
      } listed invalid middleware ${invalidMiddleware.join(', ')}`
    )
  }

  // TODO: investigate requiring plugins' env be prefixed
  // somehow to prevent collision
  if (!Array.isArray(pluginMetaData['required-env'])) {
    exitWithError(
      'Next.js plugins need to have a "nextjs.required-env" key in package.json'
    )
  }

  const missingEnvFields: string[] = []

  for (const field of pluginMetaData['required-env']) {
    if (typeof env[field] === 'undefined') {
      missingEnvFields.push(field)
    }
  }

  if (missingEnvFields.length > 0) {
    exitWithError(
      `Next.js Plugin: ${
        pluginMetaData.name
      } required env ${missingEnvFields.join(
        ', '
      )} but was missing in your \`next.config.js\``
    )
  }

  return {
    middleware,
    directory: pkgDir,
    requiredEnv: pluginMetaData['required-env'],
    version: pluginPackageJson.version,
    pluginName: pluginMetaData.name,
    pkgName: pluginPackageJson.name,
  }
}

type SeparatedPlugins = {
  appMiddlewarePlugins: PluginMetaData[]
  documentMiddlewarePlugins: PluginMetaData[]
}

// clean package name so it can be used as variable
export const getPluginId = (pkg: string): string => {
  pkg = pkg.replace(/\W/g, '')

  if (pkg.match(/^[0-9]/)) {
    pkg = `_${pkg}`
  }
  return pkg
}

type PluginConfig =
  | string
  | {
      name: string
      config: { [name: string]: any }
    }

async function _collectPlugins(
  dir: string,
  env: ENV_OPTIONS,
  pluginsConfig: PluginConfig[] | undefined
): Promise<PluginMetaData[]> {
  const hasPluginConfig = Array.isArray(pluginsConfig)
  let nextPluginNames: string[] = []

  if (hasPluginConfig) {
    console.log('Found plugins config, auto detecting plugins disabled')
    nextPluginNames = pluginsConfig!.map(config =>
      typeof config === 'string' ? config : config.name
    )
  } else {
    const rootPackageJsonPath = await findUp('package.json', { cwd: dir })
    if (!rootPackageJsonPath) {
      console.log('Failed to load plugins, no package.json')
      return []
    }
    const rootPackageJson = require(rootPackageJsonPath)
    let dependencies: string[] = []
    if (rootPackageJson.dependencies) {
      dependencies = dependencies.concat(
        Object.keys(rootPackageJson.dependencies)
      )
    }

    if (rootPackageJson.devDependencies) {
      dependencies = dependencies.concat(
        Object.keys(rootPackageJson.devDependencies)
      )
    }

    // find packages with the naming convention
    // @scope/next-plugin-[name]
    // @next/plugin-[name]
    // next-plugin-[name]
    nextPluginNames = dependencies.filter(name => {
      return name.match(/(^@next\/plugin|next-plugin-)/)
    })
  }

  const nextPluginMetaData = await Promise.all(
    nextPluginNames.map(name =>
      collectPluginMeta(
        env,
        resolve.sync(path.join(name, 'package.json'), {
          basedir: dir,
          preserveSymlinks: true,
        })
      )
    )
  )

  for (const plugin of nextPluginMetaData) {
    // Add plugin config from `next.config.js`
    if (hasPluginConfig) {
      const curPlugin = pluginsConfig!.find(
        config =>
          config && typeof config === 'object' && config.name === plugin.pkgName
      )
      if (curPlugin && typeof curPlugin === 'object') {
        plugin.config = curPlugin.config
      }
    }
    console.log(
      `Loaded plugin: ${plugin.pkgName}${
        plugin.version ? `@${plugin.version}` : ''
      }`
    )
  }
  console.log()

  return nextPluginMetaData
}

// only execute it once between server/client configs
// since the plugins need to match
export const collectPlugins = execOnce(
  _collectPlugins
) as typeof _collectPlugins
