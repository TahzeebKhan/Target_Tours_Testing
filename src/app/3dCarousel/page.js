import React from 'react'
import Carousel from './component/Carousel'
import styles from './page.module.css'
// import ShowcaseCarousel from './ShowcaseCarousel'

const Page = () => {
  return (
    <div className={styles.container}>
      <Carousel />
      {/* <ShowcaseCarousel/> */}
    </div>
  )
}

export default Page
