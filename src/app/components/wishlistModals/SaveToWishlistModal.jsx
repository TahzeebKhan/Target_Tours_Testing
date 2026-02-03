import React from "react";
import styles from "./WishlistModal.module.css";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";
const SaveToWishlistModal = ({
  isOpen,
  wishlists = [],
  onClose,
  onCreateNew,
}) => {
  // useLockBodyScroll(open);
  if (!isOpen) return null;

  return (
    <div className={styles.backdrop}>
      <div className={`${styles.modal} ${styles.large}`}>
        <div className={styles.header}>
          <h2>Save to wishlist</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className={styles.grid}>
          {wishlists.map((list) => (
            <div key={list.id} className={styles.card}>
              <div className={styles.imagePlaceholder}>
                <img src="/icons/heartOutline.svg" alt="" />
              </div>
              <h4>{list.name}</h4>
              <span>{list.count || 0} saved</span>
            </div>
          ))}
        </div>

        <button
          className={styles.primaryBtnFull}
          onClick={() => {
            onClose(); // close save modal
            onCreateNew(); // open create modal
          }}
        >
          Create new wishlist
        </button>
      </div>
    </div>
  );
};

export default SaveToWishlistModal;
