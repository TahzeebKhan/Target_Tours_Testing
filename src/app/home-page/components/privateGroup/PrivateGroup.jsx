import React from "react";
import styles from "./PrivateGroup.module.css";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

const fetchTravelStyle = async () => {
  const token = Cookies.get("auth_token");

  const domain = process.env.NEXT_PUBLIC_DOMAIN;

  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/travel-style-selector?domain=${domain}`,
    { headers },
  );

  return res.data?.data;
};

const CMS_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // important for images

const PrivateGroup = ({ onGroupQuote, onPrivateQuote }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["travel-style-selector"],
    queryFn: fetchTravelStyle,
    staleTime: 5 * 60 * 1000,
  });
  if (isError) {
    console.warn("Failed to load travel style CMS");
  }

  // 🔹 FALLBACK CONTENT (existing hardcoded text)
  const fallback = {
    heading: "How Do You Want to Travel?",
    description:
      "Pick between expertly guided group trips or fully personalized private journeys designed around you.",
    card1Title: "Group Trips",
    card1Sub:
      "Chill small group adventures led by experts, hanging out with fellow travelers who get you.",
    card2Title: "Private Trips",
    card2Sub:
      "Custom luxury trips designed just for you, based on what you love and how you like to travel.",
    cta: "GET QUOTE",
    img1: "/images/GROUPTRIPS.png",
    img2: "/images/privateTrips.png",
  };

  // 🔹 API → UI mapping with fallback
  const content = {
    heading: data?.heading || fallback.heading,
    description: data?.description || fallback.description,

    card1Title: data?.image_card_1_title || fallback.card1Title,
    card1Sub: data?.image_card_1_sub_title || fallback.card1Sub,

    card2Title: data?.image_card_2_title || fallback.card2Title,
    card2Sub: data?.image_card_2_sub_title || fallback.card2Sub,

    cta: data?.cta_text || fallback.cta,

    img1: data?.image_card_1?.formats?.medium?.url
      ? CMS_BASE_URL + data.image_card_1.formats.medium.url
      : fallback.img1,

    img2: data?.image_card_2?.formats?.medium?.url
      ? CMS_BASE_URL + data.image_card_2.formats.medium.url
      : fallback.img2,
  };
  return (
    <div className={styles.privateGroupSection}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2>{content.card1Title}</h2>

          <p>{content.card1Sub}</p>
          <ul className={styles.groupList}>
            <li>
              Expert-led itineraries with perfectly balanced sightseeing,
              activities, and free time
            </li>
            <li>
              Seamless planning & coordination, so you just show up and enjoy
              the journey.
            </li>
          </ul>
          <button onClick={onGroupQuote} className={styles.button}>
            {content.cta}
            <svg
              width="14"
              height="9"
              viewBox="0 0 14 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.09094 0.265207C9.49676 -0.109399 10.1294 -0.0840962 10.504 0.321722L13.7348 3.82168C14.0884 4.20474 14.0884 4.79518 13.7348 5.17824L10.504 8.67828C10.1294 9.08411 9.49677 9.10941 9.09095 8.73481C8.68513 8.36021 8.65982 7.72755 9.03442 7.32173L10.716 5.49997L0.999999 5.49997C0.447714 5.49997 -7.64154e-07 5.05225 -7.86799e-07 4.49997C-8.09444e-07 3.94768 0.447714 3.49997 0.999999 3.49997L10.716 3.49997L9.03443 1.67829C8.65982 1.27247 8.68513 0.639813 9.09094 0.265207Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
        <div>
          {/* <img src="/icons/brLine.svg" alt="" /> */}
          <svg
            className={styles.br}
            width="1"
            height="358"
            viewBox="0 0 1 358"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              opacity="0.3"
              x1="0.5"
              y1="2.18557e-08"
              x2="0.499984"
              y2="357.4"
              stroke="#000033"
              stroke-dasharray="9 9"
            />
          </svg>

          <svg
            className={styles.brMobile}
            viewBox="0 0 767 1"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <line
              opacity="0.3"
              y1="0.5"
              x2="767"
              y2="0.5"
              stroke="#000033"
              strokeDasharray="9 9"
            />
          </svg>
        </div>
        <div className={styles.content}>
          <h2>{content.card2Title}</h2>

          <p>{content.card2Sub}</p>
          <ul className={styles.groupList}>
            <li>
              Fully personalized travel planning, tailored to your pace,
              preferences, and interests.
            </li>
            <li>
              End-to-end concierge support, from flights and stays to
              experiences and transfers.
            </li>
          </ul>
          <button onClick={onPrivateQuote} className={styles.button}>
            {content.cta}
            <svg
              width="14"
              height="9"
              viewBox="0 0 14 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.09094 0.265207C9.49676 -0.109399 10.1294 -0.0840962 10.504 0.321722L13.7348 3.82168C14.0884 4.20474 14.0884 4.79518 13.7348 5.17824L10.504 8.67828C10.1294 9.08411 9.49677 9.10941 9.09095 8.73481C8.68513 8.36021 8.65982 7.72755 9.03442 7.32173L10.716 5.49997L0.999999 5.49997C0.447714 5.49997 -7.64154e-07 5.05225 -7.86799e-07 4.49997C-8.09444e-07 3.94768 0.447714 3.49997 0.999999 3.49997L10.716 3.49997L9.03443 1.67829C8.65982 1.27247 8.68513 0.639813 9.09094 0.265207Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivateGroup;
