import styles from "./TripsGallery.module.css";

export default function WishlistImages({ images = [] }) {
  const visible = images.slice(0, 4);

  const getImageUrl = (path) => {
    if (!path) return "/images/placeholder.jpg";
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;
  };

  if (visible.length === 1) {
    return (
      <img
        className={styles.singleImage}
        src={getImageUrl(visible[0])}
        alt=""
      />
    );
  }

  if (visible.length === 2) {
    return (
      <div className={styles.grid}>
        {visible.map((img, i) => (
          <>
            {" "}
            <div key={i} className={styles.grdImgCIntainer}>
              <img  src={getImageUrl(img)} alt="" />
            </div>
          </>
        ))}
      </div>
    );
  }

  if (visible.length === 3) {
    return (
      <div className={styles.grid3}>
        {visible.map((img, i) => (
          <img key={i} src={getImageUrl(img)} alt="" />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.grid4}>
      {visible.map((img, i) => (
        <img key={i} src={getImageUrl(img)} alt="" />
      ))}
    </div>
  );
}
