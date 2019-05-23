/* eslint-env jest */
/* global jasmine */
import { join } from 'path'
import { killApp, findPort, launchApp, fetchViaHTTP } from 'next-test-utils'

const appDir = join(__dirname, '../')
let appPort
let server
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 2

describe('API support', () => {
  beforeAll(async () => {
    appPort = await findPort()
    server = await launchApp(appDir, appPort)
  })
  afterAll(() => killApp(server))

  // it('API request to undefined path', async () => {
  //   const { status } = await fetchViaHTTP(appPort, '/api/unexisting', null, {})
  //   expect(status).toEqual(404)
  // })

  // it('API request to list of users', async () => {
  //   const data = await fetchViaHTTP(appPort, '/api/users', null, {}).then(
  //     res => res.ok && res.json()
  //   )

  //   expect(data).toEqual([{ name: 'Tim' }, { name: 'Jon' }])
  // })

  // it('API request to list of users with query parameter', async () => {
  //   const data = await fetchViaHTTP(
  //     appPort,
  //     '/api/users?name=Tim',
  //     null,
  //     {}
  //   ).then(res => res.ok && res.json())

  //   expect(data).toEqual([{ name: 'Tim' }])
  // })

  // it('API request to nested posts', async () => {
  //   const data = await fetchViaHTTP(appPort, '/api/posts', null, {}).then(
  //     res => res.ok && res.json()
  //   )

  //   expect(data).toEqual([{ title: 'Cool Post!' }])
  // })

  // it('Post on pages', async () => {
  //   const data = await fetchViaHTTP(appPort, '/users', null, {
  //     method: 'POST'
  //   }).then(res => res.status)

  //   expect(data).toEqual(404)
  // })

  it('Post on pages', async () => {
    const data = await fetchViaHTTP(appPort, '/users', null, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ a: 1, b: 'Textual content' })
    }).then(res => res.ok && res.json())

    expect(data).toEqual({ a: 1, b: 'Textual content' })
  })

  // it('API post on route', async () => {
  //   const data = await fetchViaHTTP(appPort, '/api/posts?title=Nextjs', null, {
  //     method: 'POST'
  //   }).then(res => res.ok && res.json())

  //   expect(data).toEqual([{ title: 'Nextjs' }])
  // })

  // it('API return error', async () => {
  //   const data = await fetchViaHTTP(appPort, '/api/error', null, {})
  //   const json = await data.json()

  //   expect(data.status).toEqual(500)
  //   expect(json).toEqual({ error: 'Server error!' })
  // })

  // it('API should return empty cookies', async () => {
  //   const data = await fetchViaHTTP(appPort, '/api/cookies', null, {}).then(
  //     res => res.ok && res.json()
  //   )
  //   expect(data).toEqual({})
  // })

  // it('API should return cookies', async () => {
  //   const data = await fetchViaHTTP(appPort, '/api/cookies', null, {
  //     headers: {
  //       Cookie: 'nextjs=cool;'
  //     }
  //   }).then(res => res.ok && res.json())
  //   expect(data).toEqual({ nextjs: 'cool' })
  // })
})
