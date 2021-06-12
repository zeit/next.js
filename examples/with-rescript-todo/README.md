# Example app using ReasonML & ReasonReact components

This example builds upon the original `with-rescript` example to show how a global state object can be used to track state across page within the application.

It is intended to show how to build a simple, stateful application using hooks without the added complexity of a redux type library.

This example features:

- An app that mixes together JavaScript and ReasonML components and functions
- An app with two pages which has a common Counter component
- That Counter component maintain the counter inside its module. This is used primarily to illustrate that modules get initialized once and their state variables persist in runtime

## Deploy your own

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=next-example):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/vercel/next.js/tree/canary/examples/with-rescript-todo&project-name=with-rescript-todo&repository-name=with-rescript-todo)

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init) or [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/) to bootstrap the example:

```bash
npx create-next-app --example with-rescript-todo with-rescript-app
# or
yarn create next-app --example with-rescript-todo with-rescript-app
```

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

### Recommendation:

Run ReScript's build system `rescript build -w` and `next` separately.

There are 2 convenience scripts to facilitate running these separate processes:

1. `npm run watch` - This script will start the ReScript compiler in watch mode to re-compile whenever you make changes.
2. `npm run dev:next` - This script will start the next.js development server so that you will be able to access your site at the location output by the script. This will also hot reload as you make changes.

You should start the scripts in the presented order.
