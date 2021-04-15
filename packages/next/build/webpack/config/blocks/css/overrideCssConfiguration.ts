import { webpack } from 'next/dist/compiled/webpack/webpack'
import type { AcceptedPlugin } from 'postcss'
import { getPostCssPlugins } from './plugins'

export function __overrideCssConfiguration(
  rootDirectory: string,
  isProduction: boolean,
  config: webpack.Configuration
) {
  let postCssPlugins: AcceptedPlugin[] | undefined

  function patch(rule: webpack.RuleSetRule) {
    if (
      rule.options &&
      typeof rule.options === 'object' &&
      (typeof rule.options.postcssOptions === 'object' ||
        typeof rule.options.postcssOptions === 'function')
    ) {
      const prev = rule.options.postcssOptions
      rule.options.postcssOptions = (ctx: any) => {
        if (postCssPlugins === undefined)
          postCssPlugins = getPostCssPlugins(rootDirectory, isProduction)
        const result = typeof prev === 'function' ? prev(ctx) : prev
        result.plugins = postCssPlugins
        return result
      }
    } else if (Array.isArray(rule.oneOf)) {
      rule.oneOf.forEach(patch)
    } else if (Array.isArray(rule.use)) {
      rule.use.forEach((u) => {
        if (typeof u === 'object') {
          patch(u)
        }
      })
    }
  }

  config.module?.rules?.forEach((entry) => {
    patch(entry)
  })
}
