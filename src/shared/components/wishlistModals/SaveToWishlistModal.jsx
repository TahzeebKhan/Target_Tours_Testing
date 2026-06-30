"use client";

import React, { useEffect } from "react";
import styles from "./WishlistModal.module.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export const fetchUserWishlists = async (type = "package") => {
  const token = Cookies.get("auth_token");
  const wishlistType = type || "package";

  if (!token) return {};

  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-wishlist/${encodeURIComponent(wishlistType)}?limit=50&page=1`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return res.data?.data?.[wishlistType] || {};
};

const getWishlistItemId = (item = {}) =>
  item.hotelId || item.hotel_id || item.id || item.documentId || "";

const getWishlistItemTitle = (item = {}) =>
  item.title || item.name || item.hotelName || item.list_name || "Saved item";

const getWishlistItemImage = (item = {}) =>
  item?.main_image?.formats?.small?.url ||
  item?.main_image?.url ||
  item?.image ||
  item?.thumbnail ||
  "";

const SaveToWishlistModal = ({ isOpen, onClose, onCreateNew, type = "package" }) => {
  const router = useRouter();
  const token = Cookies.get("auth_token");

  // 🚨 NOT LOGGED IN → redirect
  useEffect(() => {
    if (isOpen && !token) {
      onClose?.(); // close modal safely
      router.push("/?openLogin=true");
    }
  }, [isOpen, token, router, onClose]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const { data, isLoading } = useQuery({
    queryKey: ["user-wishlists", type],
    queryFn: () => fetchUserWishlists(type),
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
            <p>Create one to start saving your favourite {type === "hotel" ? "hotels" : "packages"}.</p>
          </div>
        )}

        {!isLoading && !isEmpty && (
          <div className={styles.grid}>
            {wishlistGroups.map(([wishlistName, group]) =>
              group.data.map((item) => {
                const itemId = getWishlistItemId(item);
                const imageUrl = getWishlistItemImage(item);
                const title = getWishlistItemTitle(item);

                return (
                  <div
                    key={itemId || `${wishlistName}-${title}`}
                    className={styles.card}
                    onClick={() => {
                      onClose(); // close modal
                      if (type === "hotel") {
                        if (itemId) router.push(`/hotel-detail?hotelId=${itemId}`);
                        return;
                      }

                      router.push(`/tour-details?id=${itemId}`);
                    }}
                  >
                    <div className={styles.imagePlaceholder}>
                      {imageUrl ? (
                        <img
                          src={
                            imageUrl.startsWith("http")
                              ? imageUrl
                              : `${process.env.NEXT_PUBLIC_BACKEND_URL}${imageUrl}`
                          }
                          alt={title}
                        />
                      ) : (
                        <img src="/icons/heartOutline.svg" alt="" />
                      )}
                    </div>

                    <h4>{title}</h4>
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
