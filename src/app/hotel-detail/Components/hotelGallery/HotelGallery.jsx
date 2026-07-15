import React, { useEffect, useMemo, useState } from 'react'
import styles from './HotelGallery.module.css'
import { useRouter } from 'next/navigation';
import { HOTEL_DETAILS_KEY } from '@/shared/services/hotelSearch';

const FALLBACK_IMAGE = "/fallback.png";
const GALLERY_SLOT_COUNT = 5;

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

const GalleryImage = ({ image, title = "" }) => {
    const resolvedImage = image || FALLBACK_IMAGE;
    const [src, setSrc] = useState(resolvedImage);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setSrc(resolvedImage);
        setIsLoading(true);
    }, [resolvedImage]);

    return (
        <>
            {isLoading && <span className={styles.imageLoader} aria-hidden="true" />}
            <img
                className={`${styles.galleryImage} ${isLoading ? styles.imageLoading : ""}`}
                src={src}
                alt={title}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    if (src !== FALLBACK_IMAGE) {
                        setSrc(FALLBACK_IMAGE);
                        return;
                    }
                    setIsLoading(false);
                }}
            />
        </>
    );
};

const HotelGallery = ({ images = [] }) => {

     const router = useRouter();
     const normalizedImages = useMemo(() => (Array.isArray(images) ? images : []).map(
        (item, index) =>
          typeof item === "string"
            ? { image: normalizeImageUrl(item), title: `Photo ${index + 1}` }
            : {
                image: normalizeImageUrl(
                    item?.image ||
                    item?.url ||
                    item?.src ||
                    item?.imageUrl ||
                    item?.thumbnail ||
                    item?.coverImage ||
                    item?.heroImage,
                ),
                title:
                  item?.title ||
                  item?.caption ||
                  item?.name ||
                  item?.label ||
                  `Photo ${index + 1}`,
              },
      ).filter((item) => item.image), [images]);
     const remoteImages = normalizedImages.filter((item) => isRemoteImage(item.image));
     const localImages = normalizedImages.filter((item) => !isRemoteImage(item.image));
     const galleryImages = remoteImages.length ? [...remoteImages, ...localImages] : normalizedImages;
     const visibleImages = Array.from({ length: GALLERY_SLOT_COUNT }, (_, index) => (
        galleryImages[index] || { image: FALLBACK_IMAGE, title: `Photo ${index + 1}` }
     ));

        const goToGallery = () => {
            if (typeof window !== "undefined") {
                try {
                    const raw = window.sessionStorage.getItem(HOTEL_DETAILS_KEY);
                    const stored = raw ? JSON.parse(raw) : {};
                    window.sessionStorage.setItem(
                        HOTEL_DETAILS_KEY,
                        JSON.stringify({
                            ...stored,
                            galleryImages: (galleryImages.length
                                ? galleryImages
                                : [{ image: FALLBACK_IMAGE, title: "Photo 1" }]
                            ).map((item, index) =>
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
                <GalleryImage image={visibleImages[0]?.image} title={visibleImages[0]?.title} />
            </div>
            <div className={styles.rightGrid}>
                <div className={styles.imageBox}>
                    <GalleryImage image={visibleImages[1]?.image} title={visibleImages[1]?.title} />
                </div>

                <div className={styles.imageBox}>
                    <GalleryImage image={visibleImages[2]?.image} title={visibleImages[2]?.title} />
                </div>

                <div className={styles.imageBox}>
                    <GalleryImage image={visibleImages[3]?.image} title={visibleImages[3]?.title} />
                </div>

                <div className={styles.imageBox}>
                    <GalleryImage image={visibleImages[4]?.image} title={visibleImages[4]?.title} />
                    <button className={styles.viewGalleryBtn} onClick={goToGallery} >
                        <img className={styles.viewGalleryBtnIcon} src="/icons/dotBtn.svg" alt="" /> VIEW GALLERY
                    </button>
                </div>
            </div>
        </div>
    )
}

export default HotelGallery
