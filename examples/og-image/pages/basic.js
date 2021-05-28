import Link from 'next/link'

export default function DemoPage() {
  return (
    <div>
      <p>
        Demo Page should add its own image at{' '}
        <Link href="/demo.image.png">
          <a>/demo.image.png</a>
        </Link>
      </p>
    </div>
  )
}
