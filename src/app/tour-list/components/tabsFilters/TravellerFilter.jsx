import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./TravellerFilter.module.css";
import CustomCheckbox from "@/shared/components/CustomCheckbox";

const TRAVELLER_PROFILES = [
  {
    id: "family",
    label: "Family",
    description:
      "Enjoy a family trip together and create memories you’ll cherish for years.",
    imageUrl: "/images/traveller-family.png",
  },
  {
    id: "group",
    label: "Group",
    imageUrl: "/images/traveller-group.png",
  },
  {
    id: "private",
    label: "Private",
    imageUrl: "/images/traveller-private.png",
  },
  {
    id: "romantic",
    label: "Romantic",
    imageUrl: "/images/traveller-romantic.png",
  },
];

const TravellerFilter = ({ onApply }) => {
  const searchParams = useSearchParams();
  const [selectedProfiles, setSelectedProfiles] = useState(() => {
    const selectedPackageTypes = (searchParams.get("package_type") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return selectedPackageTypes.filter((id) =>
      TRAVELLER_PROFILES.some((profile) => profile.id === id),
    );
  });

  const toggleProfile = (id) => {
    setSelectedProfiles((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* LEFT TEXT */}
        <h3 className={styles.heading}>Select Your Traveler Profile</h3>
        <div className={styles.content}>
          <div className={styles.leftContent}>
            <p className={styles.description}>
              Enjoy a family trip together and create memories you’ll cherish
              for years.
            </p>

            <button
              className={styles.searchBtn}
              onClick={() => onApply?.(selectedProfiles)}
            >
              Search
            </button>
          </div>

          {/* RIGHT CARDS */}
          <div className={styles.cardsGrid}>
            {TRAVELLER_PROFILES.map((profile) => (
              <button
                key={profile.id}
                type="button"
                className={`${styles.card} ${
                  selectedProfiles.includes(profile.id) ? styles.active : ""
                }`}
                onClick={() => toggleProfile(profile.id)}
              >
                <div className={styles.checkboxContainer}>
                  <CustomCheckbox
                    checked={selectedProfiles.includes(profile.id)}
                    onChange={() => toggleProfile(profile.id)}
                  />
                </div>

                <img
                  src={profile.imageUrl}
                  alt={profile.label}
                  className={styles.image}
                />

                <span className={styles.label}>{profile.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravellerFilter;
