import Link from 'next/link'

export default function BasicPage() {
  return (
    <div>
      <h1>Basic Page</h1>
      <p>
        View Source to see og:image meta tags or visit{' '}
        <Link href="/basic.image.png">
          <a>/basic.image.png</a>
        </Link>
      </p>
    </div>
  )
}
