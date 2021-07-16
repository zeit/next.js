---
description: Extend the default page extensions used by Next.js when resolving pages in the pages directory.
---

# Custom Page Extensions

Aimed at modules like [@next/mdx](https://github.com/vercel/next.js/tree/canary/packages/next-mdx), which adds support for pages ending with `.mdx`. You can configure the extensions looked for in the `pages` directory when resolving pages.

Open `next.config.js` and add the `pageExtensions` config:

```js
module.exports = {
  pageExtensions: ['mdx', 'jsx', 'js', 'ts', 'tsx'],
}
```

> **Note**: The default value of `pageExtensions` is [`['tsx', 'ts', 'jsx', 'js']`](https://github.com/vercel/next.js/blob/04f37d0978e5fc9939012c1d771ef4e6535e7787/packages/next/next-server/server/config-shared.ts#L43).

> **Note**: configuring `pageExtensions` also affects `_document.js`, `_app.js` as well as files under `pages/api/`. For example, setting `pageExtensions: ['page.tsx', 'page.ts']` means the following files: `_document.tsx`, `_app.tsx`, `pages/users.tsx` and `pages/api/users.ts` will have to be renamed to `_document.page.tsx`, `_app.page.tsx`, `pages/users.page.tsx` and `pages/api/users.page.ts` respectively.

## Including non-page files in the `pages` directory

To colocate test files, generated files, or other files used by components in the `pages` directory, you can prefix the extensions with something like `page`.

Open `next.config.js` and add the `pageExtensions` config:

```js
module.exports = {
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
}
```

Then rename your pages to have a file extension that includes `.page` (ex. rename `MyPage.tsx` to `MyPage.page.tsx`).

> **Note**: As mentioned in the note above, make sure you also rename `_document.js`, `_app.js` as well as files under `pages/api/`.

Without this config, when building the production bundle, Next.js will throw an error like this if there are non component files in the `pages` directory:

```
Build error occurred
Error: Build optimization failed: found pages without a React Component as default export in
pages/MyPage.generated
pages/MyPage.test

See https://err.sh/vercel/next.js/page-without-valid-component for more info.
```

## Related

<div class="card">
  <a href="/docs/api-reference/next.config.js/introduction.md">
    <b>Introduction to next.config.js:</b>
    <small>Learn more about the configuration file used by Next.js.</small>
  </a>
</div>
