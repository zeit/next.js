import styles from '../../styles.module.css'

export const getStaticProps = ({ params }) => {
  return {
    props: {
      params,
      hello: 'world',
      random: Math.random(),
    },
    revalidate: 1,
  }
}

export const getStaticPaths = () => {
  return {
    paths: ['/ssg-blog/first.image'],
    fallback: 'blocking',
  }
}

export default function DemoImage(props) {
  return (
    <div className={styles.hello}>
      <p>SSG Image goes here</p>
      <p>random {props.random}</p>
      <p>params {JSON.stringify(props.params)}</p>
    </div>
  )
}
