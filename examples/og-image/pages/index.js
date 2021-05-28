import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <p>
        Basic:{' '}
        <Link href="/basic">
          <a>Basic</a>
        </Link>
      </p>
    </div>
  )
}
