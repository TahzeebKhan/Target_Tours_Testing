"use client";

import React, { useState } from "react";
import styles from "./WishlistModal.module.css";
import axios from "axios";
import Cookies from "js-cookie";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createWishlist = async ({ type, name, ids }) => {
  const token = Cookies.get("auth_token");

  if (!token) {
    throw new Error("Not authenticated");
  }

  const payload = {
    type,                 // 👈 from parent
    list_name: name || undefined,
    ids: ids.map(String), // ensure string ids
  };

  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-wishlist`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

const CreateWishlistModal = ({
  isOpen,
  onClose,
  onCreate,
  type,        // 👈 package | hotel | travel_insurance
  ids = [],    // 👈 array of ids from parent
}) => {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: createWishlist,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["user-wishlists"]);
      onCreate?.(data);
      setName("");
      onClose();
    },
    onError: (err) => {
      console.error("Create wishlist failed:", err);
      alert("Something went wrong. Please try again.");
    },
  });

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        {/* HEADER */}
        <div className={styles.header}>
          <h2>Create wishlist</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* INPUT */}
        <input
          className={styles.input}
          placeholder="Name"
          maxLength={50}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className={styles.counter}>{name.length}/50 characters</div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <button
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            className={styles.primaryBtn}
            disabled={!name.trim() || isLoading}
            onClick={() => mutate({ type, name, ids })}
          >
            {isLoading ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWishlistModal;
