export const tourDataFallback = [
  {
    id: 1,
    image: "/tourList/cardItem1.jpg",
    route: "TORONTO TO OTTAWA",
    title: "Splendors of the Canadian West",
    days: "17 DAYS & 16 NIGHTS",
    meals: "SELECTED MEALS",
    hotel: "4-STAR HOTEL",
    activities: "3 ACTIVITIES",
    price: "₹ 66,945",
  },
  {
    id: 2,
    image: "/tourList/cardItem2.jpg",
    route: "VANCOUVER TO CALGARY",
    title: "Splendors of the Rocky Mountains",
    days: "14 DAYS & 13 NIGHTS",
    meals: "SELECTED MEALS",
    hotel: "4-STAR HOTEL",
    activities: "3 ACTIVITIES",
    price: "₹ 72,990",
  },
  {
    id: 3,
    image: "/tourList/cardItem3.jpg",
    route: "TORONTO TO MONTREAL",
    title: "Charms of Eastern Canada",
    days: "17 DAYS & 16 NIGHTS",
    meals: "SELECTED MEALS",
    hotel: "4-STAR HOTEL",
    activities: "3 ACTIVITIES",
    price: "₹ 66,945",
  },
  {
    id: 4,
    image: "/tourList/cardItem4.jpg",
    route: "WHIT TO FAIRBANKS",
    title: "Northern Lights of Canada",
    days: "10 DAYS & 9 NIGHTS",
    meals: "SELECTED MEALS",
    hotel: "4-STAR HOTEL",
    activities: "4 ACTIVITIES",
    price: "₹ 89,900",
  },
  {
    id: 5,
    image: "/tourList/cardItem5.jpg",
    route: "MONTREAL TO QUEBEC CITY",
    title: "Colors of Quebec Fall",
    days: "17 DAYS & 16 NIGHTS",
    meals: "SELECTED MEALS",
    hotel: "4-STAR HOTEL",
    activities: "3 ACTIVITIES",
    price: "₹ 66,945",
  },
  {
    id: 6,
    image: "/tourList/cardItem6.jpg",
    route: "VANCOUVER TO WHISTLER",
    title: "Elegance of Canada's West Coast",
    days: "17 DAYS & 16 NIGHTS",
    meals: "SELECTED MEALS",
    hotel: "4-STAR HOTEL",
    activities: "3 ACTIVITIES",
    price: "₹ 66,945",
  },
];

export const useToursData = ({ data, tourDataFallback = [] }) => {
  const tourData = data?.pages?.flatMap((page) => page.data) || tourDataFallback;
  const meta = data?.pages?.[0]?.meta;

  return { tourData, meta };
};
