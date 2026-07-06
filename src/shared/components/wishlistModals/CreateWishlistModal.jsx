"use client";

import React, { useCallback, useEffect, useState } from "react";
import styles from "./WishlistModal.module.css";
import axios from "axios";
import Cookies from "js-cookie";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appToast } from "@/shared/components/appToast/AppToast";
import { useRouter } from "next/navigation";

const getErrorMessage = (err) =>
  err?.response?.data?.error?.message ||
  err?.response?.data?.message ||
  err?.response?.data?.error?.details?.message ||
  err?.message ||
  "Failed to create wishlist";

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
  onAuthRequired,
  type,        // 👈 package | hotel | travel_insurance
  ids = [],    // 👈 array of ids from parent
}) => {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();
  const token = Cookies.get("auth_token");

  const handleClose = useCallback(() => {
    setName("");
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (isOpen && !token) {
      handleClose();
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        router.push("/?openLogin=true");
      }
    }
  }, [handleClose, isOpen, token, router, onAuthRequired]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const { mutate, isLoading } = useMutation({
    mutationFn: createWishlist,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["user-wishlists"]);
      onCreate?.(data);
      handleClose();
    },
    onError: (err) => {
      const message = getErrorMessage(err);

      console.error("Create wishlist failed:", err?.response?.data || err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        handleClose();
        if (onAuthRequired) {
          onAuthRequired();
        } else {
          router.push("/?openLogin=true");
        }
        return;
      }

      appToast.error(message);
    },
  });

  if (!isOpen || !token) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        {/* HEADER */}
        <div className={styles.header}>
          <h2>Create wishlist</h2>
          <button onClick={handleClose}>✕</button>
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
            onClick={handleClose}
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
