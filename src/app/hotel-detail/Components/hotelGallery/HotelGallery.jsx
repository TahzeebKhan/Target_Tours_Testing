import React from 'react'
import styles from './HotelGallery.module.css'
import { useRouter } from 'next/navigation';
import { HOTEL_DETAILS_KEY } from '@/shared/services/hotelSearch';

const FALLBACK_IMAGES = [
    "/images/hotelArt1.png",
    "/images/hotelArt2.png",
    "/images/hotelArt3.png",
    "/images/hotelArt2.png",
    "/images/hotelArt4.png",
];

const isRemoteImage = (image = "") => /^https?:\/\//.test(String(image || ""));

const normalizeImageUrl = (value = "") => {
    const rawUrl = String(value || "").trim();
    if (!rawUrl) return "";

    let url = rawUrl.replace(/\\\//g, "/").replace(/\s/g, "%20");

    try {
        url = decodeURI(url);
    } catch {
        // Keep the original URL if it is not safely decodable.
    }

    return url.replace(/\s/g, "%20");
};

const HotelGallery = ({ images = FALLBACK_IMAGES }) => {

     const router = useRouter();
     const getFallbackImage = (index = 0) =>
        FALLBACK_IMAGES[index % FALLBACK_IMAGES.length] || FALLBACK_IMAGES[0];
     const handleImageError = (event, index = 0) => {
        const fallbackImage = getFallbackImage(index);
        if (event.currentTarget.src.endsWith(fallbackImage)) return;
        event.currentTarget.src = fallbackImage;
     };
     const normalizedImages = (Array.isArray(images) && images.length ? images : FALLBACK_IMAGES).map(
        (item, index) =>
          typeof item === "string"
            ? { image: normalizeImageUrl(item), title: `Photo ${index + 1}` }
            : {
                image: normalizeImageUrl(
                    item?.image || item?.url || item?.src || FALLBACK_IMAGES[index] || FALLBACK_IMAGES[0],
                ),
                title:
                  item?.title ||
                  item?.caption ||
                  item?.name ||
                  item?.label ||
                  `Photo ${index + 1}`,
              },
      );
     const remoteImages = normalizedImages.filter((item) => isRemoteImage(item.image));
     const localImages = normalizedImages.filter((item) => !isRemoteImage(item.image));
     const galleryImages = remoteImages.length ? [...remoteImages, ...localImages] : normalizedImages;

        const goToGallery = () => {
            if (typeof window !== "undefined") {
                try {
                    const raw = window.sessionStorage.getItem(HOTEL_DETAILS_KEY);
                    const stored = raw ? JSON.parse(raw) : {};
                    window.sessionStorage.setItem(
                        HOTEL_DETAILS_KEY,
                        JSON.stringify({
                            ...stored,
                            galleryImages: galleryImages.map((item, index) =>
                              typeof item === "string"
                                ? { image: item, title: `Photo ${index + 1}` }
                                : item,
                            ),
                        }),
                    );
                } catch {
                    // Ignore storage failures and still navigate.
                }
            }
            router.push('/hotel-gallery');
        }
    return (
        <div className={styles.bottomContainerRef}>
            <div className={styles.rightImage}>
                <img
                    src={galleryImages[0]?.image || FALLBACK_IMAGES[0]}
                    alt={galleryImages[0]?.title || ""}
                    onError={(event) => handleImageError(event, 0)}
                />
            </div>
            <div className={styles.rightGrid}>
                <div className={styles.imageBox}>
                    <img
                        src={galleryImages[1]?.image || FALLBACK_IMAGES[1]}
                        alt={galleryImages[1]?.title || ""}
                        onError={(event) => handleImageError(event, 1)}
                    />
                </div>

                <div className={styles.imageBox}>
                    <img
                        src={galleryImages[2]?.image || FALLBACK_IMAGES[2]}
                        alt={galleryImages[2]?.title || ""}
                        onError={(event) => handleImageError(event, 2)}
                    />
                </div>

                <div className={styles.imageBox}>
                    <img
                        src={galleryImages[3]?.image || FALLBACK_IMAGES[3]}
                        alt={galleryImages[3]?.title || ""}
                        onError={(event) => handleImageError(event, 3)}
                    />
                </div>

                <div className={styles.imageBox}>
                    <img
                        src={galleryImages[4]?.image || FALLBACK_IMAGES[4]}
                        alt={galleryImages[4]?.title || ""}
                        onError={(event) => handleImageError(event, 4)}
                    />
                    <button className={styles.viewGalleryBtn} onClick={goToGallery} >
                        <img className={styles.viewGalleryBtnIcon} src="/icons/dotBtn.svg" alt="" /> VIEW GALLERY
                    </button>
                </div>
            </div>
        </div>
    )
}

export default HotelGallery
