import React, { useState } from "react";
import styles from "./WishlistModal.module.css";

const CreateWishlistModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Create wishlist</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <input
          className={styles.input}
          placeholder="Name"
          maxLength={50}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className={styles.counter}>{name.length}/50 characters</div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.primaryBtn}
            disabled={!name.trim()}
            onClick={() => onCreate(name)}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWishlistModal;
