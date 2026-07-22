const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const mapSignatureCarousel = (packages = []) => {
    return packages.map((pkg) => {
        const media =
            pkg.media?.find((m) => m.is_signature_exp)?.package_media?.[0];

        return {
            id: pkg.id,
            image: media?.url
                ? `${BASE_URL}${media.url}`
                : "/images/placeholder.jpg",

            title: pkg.description?.toUpperCase(),
            description: pkg.title,
            price: "ON REQUEST",
            hasNewTag: true,

            bottomTitle: pkg.description,
            bottomDescription: pkg.title,
        };
    });
};
