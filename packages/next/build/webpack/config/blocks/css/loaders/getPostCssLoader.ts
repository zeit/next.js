import type { AcceptedPlugin } from 'postcss'

export function getPostCssLoader(
  postCssPluginsFactory: () => readonly AcceptedPlugin[]
) {
  let postcssOptions: { plugins: readonly AcceptedPlugin[]; config: boolean }
  return {
    loader: require.resolve('next/dist/compiled/postcss-loader'),
    options: {
      postcssOptions: () => {
        if (postcssOptions === undefined)
          postcssOptions = { plugins: postCssPluginsFactory(), config: false }
        return postcssOptions
      },
      sourceMap: true,
    },
  }
}
