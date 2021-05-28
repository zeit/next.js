import styles from '../styles.module.css'

export const getStaticProps = () => {
  return {
    props: {
      hello: 'world',
      random: Math.random(),
    },
    revalidate: 1,
  }
}

export default function DemoImage(props) {
  return (
    <div className={styles.hello}>
      <p>SSG Image goes here</p>
      <p>random {props.random}</p>
    </div>
  )
}
