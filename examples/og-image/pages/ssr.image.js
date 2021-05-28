import styles from '../styles.module.css'

export const getServerSideProps = () => {
  return {
    props: {
      hello: 'world',
      random: Math.random(),
    },
  }
}

export default function DemoImage(props) {
  return (
    <div className={styles.hello}>
      <p>SSR Image goes here</p>
      <p>random {props.random}</p>
    </div>
  )
}
