export const normalizeWishlists = (wishlistObject = {}) => {
  return Object.entries(wishlistObject).map(([wishlistName, wishlist]) => {
    const items = wishlist?.data || [];

    const images = items
      .map((item) => {
        const img = item?.main_image;
        if (!img) return "/images/placeholder.jpg";

        return (
          img.formats?.medium?.url ||
          img.formats?.small?.url ||
          img.url
        );
      })
      .slice(0, 4);

    return {
      name: wishlistName,
      total: items.length,
      images,
      items, // keep full items for future (details page etc.)
    };
  });
};
