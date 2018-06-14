import path, {sep} from 'path'
import webpack from 'webpack'
import resolve from 'resolve'
import UglifyJSPlugin from 'uglifyjs-webpack-plugin'
import CaseSensitivePathPlugin from 'case-sensitive-paths-webpack-plugin'
import WriteFilePlugin from 'write-file-webpack-plugin'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import {getPages} from './webpack/utils'
import PagesPlugin from './plugins/pages-plugin'
import NextJsSsrImportPlugin from './plugins/nextjs-ssr-import'
import DynamicChunksPlugin from './plugins/dynamic-chunks-plugin'
import UnlinkFilePlugin from './plugins/unlink-file-plugin'
import PagesManifestPlugin from './plugins/pages-manifest-plugin'
import BuildManifestPlugin from './plugins/build-manifest-plugin'
import {SERVER_DIRECTORY} from '../../lib/constants'

const nextDir = path.join(__dirname, '..', '..', '..')
const nextNodeModulesDir = path.join(nextDir, 'node_modules')
const nextPagesDir = path.join(nextDir, 'pages')

function externalsConfig (dir, isServer) {
  const externals = []

  if (!isServer) {
    return externals
  }

  externals.push((context, request, callback) => {
    resolve(request, { basedir: dir, preserveSymlinks: true }, (err, res) => {
      if (err) {
        return callback()
      }

      // Default pages have to be transpiled
      if (res.match(/node_modules[/\\]next[/\\]dist[/\\]pages/)) {
        return callback()
      }

      // Webpack itself has to be compiled because it doesn't always use module relative paths
      if (res.match(/node_modules[/\\]webpack/)) {
        return callback()
      }

      if (res.match(/node_modules[/\\].*\.js$/)) {
        return callback(null, `commonjs ${request}`)
      }

      callback()
    })
  })

  return externals
}

export default async function getBaseWebpackConfig (dir, {dev = false, isServer = false, buildId, config}) {
  const defaultLoaders = {
    babel: {
      loader: 'next-babel-loader',
      options: {dev, isServer}
    }
  }

  // Support for NODE_PATH
  const nodePathList = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter((p) => !!p)

  const pagesEntries = await getPages(dir, {dev, isServer, pageExtensions: config.pageExtensions.join('|')})
  const totalPages = Object.keys(pagesEntries).length
  const clientEntries = !isServer ? {
    'main.js': [
      dev && !isServer && path.join(__dirname, '..', '..', 'client', 'webpack-hot-middleware-client'),
      dev && !isServer && path.join(__dirname, '..', '..', 'client', 'on-demand-entries-client'),
      require.resolve(`../../client/next${dev ? '-dev' : ''}`)
    ].filter(Boolean)
  } : {}

  let webpackConfig = {
    devtool: dev ? 'cheap-module-source-map' : false,
    name: isServer ? 'server' : 'client',
    cache: true,
    target: isServer ? 'node' : 'web',
    externals: externalsConfig(dir, isServer),
    context: dir,
    // Kept as function to be backwards compatible
    entry: async () => {
      return {
        ...clientEntries,
        // Only _error and _document when in development. The rest is handled by on-demand-entries
        ...pagesEntries
      }
    },
    output: {
      path: path.join(dir, config.distDir, isServer ? SERVER_DIRECTORY : ''),
      filename: '[name]',
      libraryTarget: 'commonjs2',
      // This saves chunks with the name given via require.ensure()
      chunkFilename: dev ? '[name].js' : '[name]-[chunkhash].js',
      strictModuleExceptionHandling: true
    },
    performance: { hints: false },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      modules: [
        nextNodeModulesDir,
        'node_modules',
        ...nodePathList // Support for NODE_PATH environment variable
      ],
      alias: {
        next: nextDir
      }
    },
    resolveLoader: {
      modules: [
        nextNodeModulesDir,
        'node_modules',
        path.join(__dirname, 'loaders'),
        ...nodePathList // Support for NODE_PATH environment variable
      ]
    },
    module: {
      rules: [
        dev && !isServer && {
          test: /\.(js|jsx)$/,
          loader: 'hot-self-accept-loader',
          include: [
            path.join(dir, 'pages'),
            nextPagesDir
          ],
          options: {
            extensions: /\.(js|jsx)$/
          }
        },
        {
          test: /\.(js|jsx)$/,
          include: [dir],
          exclude: /node_modules/,
          use: defaultLoaders.babel
        }
      ].filter(Boolean)
    },
    plugins: [
      new webpack.IgnorePlugin(/(precomputed)/, /node_modules.+(elliptic)/),
      dev && new webpack.NoEmitOnErrorsPlugin(),
      dev && !isServer && new FriendlyErrorsWebpackPlugin(),
      dev && new webpack.NamedModulesPlugin(),
      dev && !isServer && new webpack.HotModuleReplacementPlugin(), // Hot module replacement
      dev && new UnlinkFilePlugin(),
      dev && new CaseSensitivePathPlugin(), // Since on macOS the filesystem is case-insensitive this will make sure your path are case-sensitive
      dev && new WriteFilePlugin({
        exitOnErrors: false,
        log: false,
        // required not to cache removed files
        useHashIndex: false
      }),
      !isServer && !dev && new UglifyJSPlugin({
        parallel: true,
        sourceMap: false,
        uglifyOptions: {
          mangle: {
            safari10: true
          }
        }
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production'),
        'process.env.NEXT_EXPORT_TRAILING_SLASHES': config.exportTrailingSlashes
      }),
      !dev && new webpack.optimize.ModuleConcatenationPlugin(),
      isServer && new PagesManifestPlugin(),
      !isServer && new BuildManifestPlugin(),
      !isServer && new PagesPlugin(),
      !isServer && new DynamicChunksPlugin(),
      isServer && new NextJsSsrImportPlugin(),
      // In dev mode, we don't move anything to the commons bundle.
      // In production we move common modules into the existing main.js bundle
      !isServer && new webpack.optimize.CommonsChunkPlugin({
        name: 'main.js',
        filename: dev ? 'static/commons/main.js' : 'static/commons/main-[chunkhash].js',
        minChunks (module, count) {
          // React and React DOM are used everywhere in Next.js. So they should always be common. Even in development mode, to speed up compilation.
          if (module.resource && module.resource.includes(`${sep}react-dom${sep}`) && count >= 0) {
            return true
          }

          if (module.resource && module.resource.includes(`${sep}react${sep}`) && count >= 0) {
            return true
          }

          // In the dev we use on-demand-entries.
          // So, it makes no sense to use commonChunks based on the minChunks count.
          // Instead, we move all the code in node_modules into each of the pages.
          if (dev) {
            return false
          }

          // Check if the module is used in the _app.js bundle
          // Because _app.js is used on every page we don't want to
          // duplicate them in other bundles.
          const chunks = module.getChunks()
          const inAppBundle = chunks.some(chunk => chunk.entryModule
            ? chunk.entryModule.name === 'bundles/pages/_app.js'
            : null
          )

          if (inAppBundle && chunks.length > 1) {
            return true
          }

          // commons
          // If there are one or two pages, only move modules to common if they are
          // used in all of the pages. Otherwise, move modules used in at-least
          // 1/2 of the total pages into commons.
          if (totalPages <= 2) {
            return count >= totalPages
          }
          return count >= totalPages * 0.5
          // commons end
        }
      }),
      // We use a manifest file in development to speed up HMR
      dev && !isServer && new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest.js',
        filename: dev ? 'static/commons/manifest.js' : 'static/commons/manifest-[chunkhash].js'
      })
    ].filter(Boolean)
  }

  if (typeof config.webpack === 'function') {
    webpackConfig = config.webpack(webpackConfig, {dir, dev, isServer, buildId, config, defaultLoaders, totalPages})
  }

  return webpackConfig
}
