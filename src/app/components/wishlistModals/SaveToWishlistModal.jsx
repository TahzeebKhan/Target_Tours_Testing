"use client";

import React, { useEffect } from "react";
import styles from "./WishlistModal.module.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export const fetchUserWishlists = async () => {
  const token = Cookies.get("auth_token");

  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-wishlist/package?limit=10&page=1`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  return res.data?.data?.package || {};
};

const SaveToWishlistModal = ({ isOpen, onClose, onCreateNew }) => {
  const router = useRouter();
  const token = Cookies.get("auth_token");

  // 🚨 NOT LOGGED IN → redirect
  useEffect(() => {
    if (isOpen && !token) {
      onClose?.(); // close modal safely
      router.push("/?openLogin=true");
    }
  }, [isOpen, token, router, onClose]);

  const { data, isLoading } = useQuery({
    queryKey: ["user-wishlists"],
    queryFn: fetchUserWishlists,
    enabled: isOpen && !!token, // ✅ double safety
  });

  // ❌ Don't render modal if not logged in
  if (!isOpen || !token) return null;
  const wishlistGroups = Object.entries(data || []);
  const isEmpty =
    !wishlistGroups.length ||
    wishlistGroups.every(([, group]) => !group?.data?.length);

  return (
    <div className={styles.backdrop}>
      <div className={`${styles.modal} ${styles.large}`}>
        {/* HEADER */}
        <div className={styles.header}>
          <h2>My wishlist</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* BODY */}
        {isLoading && (
          <div className={styles.emptyState}>Loading wishlists…</div>
        )}

        {!isLoading && isEmpty && (
          <div className={styles.emptyState}>
            <h3>You have no wishlists</h3>
            <p>Create one to start saving your favourite packages.</p>
          </div>
        )}

        {!isLoading && !isEmpty && (
          <div className={styles.grid}>
            {wishlistGroups.map(([wishlistName, group]) =>
              group.data.map((pkg) => {
                const imageUrl =
                  pkg?.main_image?.formats?.small?.url || pkg?.main_image?.url;

                return (
                  <div
                    key={pkg.id}
                    className={styles.card}
                    onClick={() => {
                      onClose(); // close modal
                      router.push(`/tour-details?id=${pkg.id}`);
                    }}
                  >
                    <div className={styles.imagePlaceholder}>
                      {imageUrl ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${imageUrl}`}
                          alt={pkg.title}
                        />
                      ) : (
                        <img src="/icons/heartOutline.svg" alt="" />
                      )}
                    </div>

                    <h4>{pkg.title}</h4>
                    <span>{wishlistName}</span>
                  </div>
                );
              }),
            )}
          </div>
        )}

        {/* FOOTER */}
        <div>
 <button
          className={styles.primaryBtnFull}
          onClick={() => {
            onClose();
            onCreateNew();
          }}
        >
          Create new wishlist
        </button>
        </div>
       
      </div>
    </div>
  );
};

export default SaveToWishlistModal;
