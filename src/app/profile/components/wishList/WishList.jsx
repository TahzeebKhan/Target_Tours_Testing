"use client";
import React from "react";
import styles from "./WishList.module.css";
import WishListsTabsItems from "./components/wishListsTabsItmes/WishListsTabsItems";
import { useProfile } from "../../context/ProfileContext";
import { useRouter } from "next/navigation";
import MyNextTrip from "./components/myNextTrip/MyNextTrip";

const WishList = () => {
  const router = useRouter();
  const { activeMenu } = useProfile();

  if (activeMenu === "myNextTrip") return <MyNextTrip />;

  return <WishListsTabsItems />;
};

export default WishList;
