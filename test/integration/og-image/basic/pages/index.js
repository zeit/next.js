import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <p>
        <Link id="basic" href="/basic">
          <a>/basic</a>
        </Link>
      </p>
      <p>
        <Link id="ssg-blog-first" href="/ssg-blog/first">
          <a>/ssg-blog/first</a>
        </Link>
      </p>
      <p>
        <Link id="ssg-blog-first-image" href="/ssg-blog/first.image">
          <a>/ssg-blog/first.image</a>
        </Link>
      </p>
      <p>
        <Link id="ssg-blog-first-image-png" href="/ssg-blog/first.image.png">
          <a>/ssg-blog/first.image.png</a>
        </Link>
      </p>
      <p>
        <Link id="ssg-blog-second-image-png" href="/ssg-blog/second.image.png">
          <a>/ssg-blog/second.image.png</a>
        </Link>
      </p>
      <p>
        <Link id="ssg-blog-ssg-image-png" href="/ssg-blog/ssg.image.png">
          <a>/ssg-blog/ssg.image.png</a>
        </Link>
      </p>
      <p>
        <Link id="ssg-blog-ssr-image-png" href="/ssg-blog/ssr.image.png">
          <a>/ssg-blog/ssr.image.png</a>
        </Link>
      </p>
    </div>
  )
}
