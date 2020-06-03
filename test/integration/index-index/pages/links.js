import Link from 'next/link'

export default function Index() {
  return (
    <div id="page">
      <Link href="/">
        <a id="link1">link to /</a>
      </Link>
      <Link href="/index">
        <a id="link2">link to /index</a>
      </Link>
      <Link href="/index/index">
        <a id="link3">link to /index/index</a>
      </Link>
      <Link href="/index/index/index">
        <a id="link4">link to /index/index/index</a>
      </Link>
    </div>
  )
}
