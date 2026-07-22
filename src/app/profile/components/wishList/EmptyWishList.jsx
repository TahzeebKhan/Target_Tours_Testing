import { useRouter } from "next/navigation";
import styles from "./WishList.module.css";

const EmptyWishList = () => {
  const router = useRouter();
  return (
    <>
      <section className={styles.container}>
        <div className={styles.contentWrapper}>
          <img
            className={styles.heartIcon}
            src="/images/wishlistheart.png"
            alt=""
          />
          <button className={styles.startBtn} onClick={() => router.push("/")}>
            start searching
          </button>
          <div className={styles.textWrapper}>
            <h2>You haven’t added any items to your wish list yet.</h2>
            <p>Start exploring and add your favorite destinations here!</p>
          </div>
        </div>
      </section>
      <section className={`${styles.container} ${styles.containerMobile}`}>
        <div className={styles.contentWrapper}>
          <img
            className={styles.heartIcon}
            src="/images/wishlistheart.png"
            alt=""
          />

          <div className={styles.textWrapper}>
            <h2>You haven’t added any items to your wish list yet.</h2>
            <p>Start exploring and add your favorite destinations here!</p>
          </div>

          <button className={styles.startBtn} onClick={() => router.push("/")}>
            start searching
          </button>
        </div>
      </section>
    </>
  );
};

export default EmptyWishList;
