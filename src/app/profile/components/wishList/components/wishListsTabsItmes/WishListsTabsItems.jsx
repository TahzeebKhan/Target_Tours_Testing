"use client";
import React, { useEffect, useState } from "react";
import styles from "./WishListsTabsItems.module.css";
import ExpandableTabs from "../../../expandableTabs/ExpandableTabs";
import TripsGallery from "../tripsGallery/TripsGallery";
import CreateWishlistModal from "./CreateWishlistModal";
import { normalizeWishlists } from "../../normalizeWishlists";
import axios from "axios";
import Cookies from "js-cookie";
import EmptyWishList from "../../EmptyWishList";

/* ---------------- API ---------------- */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const fetchWishlist = ({ type = "all", page = 1, limit = 10 }) =>
  api.get(`api/user-wishlist/${type}?page=${page}&limit=${limit}`);

const normalizeWishlist = (apiData = {}) =>
  Object.entries(apiData).map(([name, obj]) => {
    const items = obj?.data || [];
    return {
      name,
      items,
      images: items.map((i) => i?.main_image?.url).filter(Boolean),
      total: items.length,
    };
  });

/* ---------------- Component ---------------- */
const WishListsTabsItems = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const tabs = [
    { key: "all", label: "ALL" },
    { key: "hotel", label: "Hotel" },
    { key: "packages", label: "Packages" },
    { key: "travelinsurance", label: "Travel Insurance" },
  ];

  useEffect(() => {
    const loadWishlists = async () => {
      setLoading(true);
      try {
        const type =
          activeTab === "packages"
            ? "package"
            : activeTab === "travelinsurance"
              ? "travel_insurance"
              : activeTab;

        const res = await fetchWishlist({ type });
        const data = res?.data?.data || {};

        let mergedWishlists = {};

        if (activeTab === "all") {
          // merge package + hotel + insurance
          Object.values(data).forEach((wishlistGroup) => {
            mergedWishlists = { ...mergedWishlists, ...wishlistGroup };
          });
        } else {
          // single type (package / hotel / travel_insurance)
          mergedWishlists = data[type] || {};
        }

        setWishlists(normalizeWishlists(mergedWishlists));
      } catch {
        setWishlists([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlists();
  }, [activeTab]);

  const isEmpty = !loading && wishlists.length === 0;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.wishlistHead}>
            <div>
              <h3>Wish Lists</h3>
              <p>Explore and save your favorite destinations here.</p>
            </div>
          </div>

          <ExpandableTabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {isEmpty ? <EmptyWishList /> : <TripsGallery wishlists={wishlists} />}
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateWishlistModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </>
  );
};

export default WishListsTabsItems;
