import Link from 'next/link'
import Layout from '../../components/layout'
import VideoPlayer from '../../components/video-player'
import Spinner from '../../components/spinner'
import { MUX_HOME_PAGE_URL } from '../../constants'
import { useRouter } from 'next/router'

export function getStaticProps({ params: { id: playbackId } }) {
  const src = `https://stream.mux.com/${playbackId}.m3u8`
  const poster = `https://image.mux.com/${playbackId}/thumbnail.png`

  return { props: { playbackId, src, poster } }
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
}

const Code = ({ children }) => (
  <>
    <span className='code'>{children}</span>
    <style jsx>{`
      .code {
        font-family: Menlo,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono, Bitstream Vera Sans Mono,Courier New,monospace,serif;
        color: #FF2B61;
      }
    `}</style>
  </>
)

export default function Playback({ playbackId, src, poster }) {
  const router = useRouter()

  if (router.isFallback) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    )
  }

  return (
    <Layout
      metaTitle="View this video created with Mux + NextJS"
      image={poster}
      loadTwitterWidget
    >
      <div className='flash-message'>This video is ready for playback</div>
      <VideoPlayer src={src} poster={poster} />
      <p>
        Go{' '}
        <Link href="/">
          <a>back home</a>
        </Link>{' '}
        to upload another video.
      </p>
      <div className='about-playback'>
        <p>
          This video was uploaded and processed by <a href={MUX_HOME_PAGE_URL}
          target='_blank' rel="noopener noreferrer">Mux</a>.  This page was
          server-side rendered with <a href='https://nextjs.org/' target='_blank'
          rel="noopener noreferrer">NextJS</a> using <Code>`getStaticPaths`
          </Code> and <Code>`getStaticProps`</Code>.
        </p>
        <p>
          Thanks to server-side rendering this page is easily sharable on social
          and has an <Code>`og:image`</Code> thumbnail generated by Mux. Try
          clicking the Twitter button below to share:
        </p>
        <div className='share-button'>
         <a className="twitter-share-button" data-size="large" target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?text=Check%20out%20the%20video%20I%20uploaded%20with%20@Vercel%20%2B%20@muxhq%20`}>Tweet this</a>
        </div>
      </div>
      <style jsx>{`
        .flash-message {
          position: absolute;
          top: 0;
          background-color: #c1dcc1;
          width: 100%;
          text-align: center;
          padding: 20px 0;
        }
        .share-button {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </Layout>
  )
}
