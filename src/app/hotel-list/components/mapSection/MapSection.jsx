"use client";

import styles from "./MapSection.module.css";
import { GoogleMap, LoadScriptNext, OverlayView } from "@react-google-maps/api";

const position = { lat: 25.1972, lng: 55.2744 };
const mapContainerStyle = { width: "100%", height: "100%" };

const dummyHotelsResponse = {
  status: true,
  message: "Hotels fetched successfully",
  data: [
    {
      createdAt: "2026-02-06T07:41:36.789Z",
      id: 3,
      name: "Courtyard by Marriott New York",
      api_hotel_id: "1",
      hotel_category: "flagship",
      location: "9211 Forest Avenue, Berlin - 213",
      country: "Germany",
      city: "Berlin",
      nights: 1,
      star_rating: 4.4,
      latitude: null,
      longitude: null,
      base_price: 5400,
    },
    {
      createdAt: "2026-02-06T07:41:36.789Z",
      id: 4,
      name: "Splendors of the Canadian West",
      api_hotel_id: "2",
      hotel_category: "new",
      location: "Fremont Street, California - 90734",
      country: "USA",
      city: "San Francisco",
      nights: 1,
      star_rating: 4.2,
      latitude: null,
      longitude: null,
      base_price: 6645,
    },
    {
      createdAt: "2026-02-06T07:41:36.789Z",
      id: 5,
      name: "Apartment in Marsa Dubai",
      api_hotel_id: "3",
      hotel_category: "guest favourite",
      location: "Market Street, California - 94103",
      country: "USA",
      city: "San Francisco",
      nights: 1,
      star_rating: 4.8,
      latitude: null,
      longitude: null,
      base_price: 9534,
    },
  ],
};

const fallbackOffsets = [
  { lat: 0, lng: 0 },
  { lat: 0.022, lng: -0.031 },
  { lat: -0.018, lng: 0.026 },
  { lat: 0.013, lng: 0.041 },
  { lat: -0.027, lng: -0.018 },
];

const hotels = dummyHotelsResponse.data.map((hotel, index) => {
  const offset = fallbackOffsets[index % fallbackOffsets.length];

  return {
    ...hotel,
    latitude: hotel.latitude ?? position.lat + offset.lat,
    longitude: hotel.longitude ?? position.lng + offset.lng,
  };
});

const formatPrice = (price) => `₹${Number(price || 0).toLocaleString("en-IN")}`;

export default function MapSection() {
  return (
    <LoadScriptNext googleMapsApiKey={process.env.NEXT_PUBLIC_MAP_KEY}>
      <div className={styles.mapContainer}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={position}
          zoom={12}
          options={{
            gestureHandling: "greedy",
            disableDefaultUI: false,
            clickableIcons: false,
          }}
        >
          {hotels.map((hotel) => (
            <OverlayView
              key={hotel.id}
              position={{ lat: hotel.latitude, lng: hotel.longitude }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div
                className={styles.priceMarker}
                title={hotel.name}
                style={{ transform: "translate(-50%, -100%)" }}
              >
                {formatPrice(hotel.base_price)}
              </div>
            </OverlayView>
          ))}
        </GoogleMap>
      </div>
    </LoadScriptNext>
  );
}
