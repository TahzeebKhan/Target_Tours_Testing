"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./MapSection.module.css";
import { GoogleMap, LoadScriptNext, OverlayView } from "@react-google-maps/api";
import { useSearchParams } from "next/navigation";
import {
  HOTEL_SEARCH_SESSION_KEY,
  HOTEL_SEARCH_RESULTS_EVENT,
  HOTEL_SEARCH_RESULTS_KEY,
} from "@/shared/services/hotelSearch";
import {
  getHotelsFromMessage,
  normalizeHotelCard,
} from "../tourListing/TourListing";

const position = { lat: 25.1972, lng: 55.2744 };
const mapContainerStyle = { width: "100%", height: "100%" };
const MAP_MARKER_SOURCE_LIMIT = 500;

const formatPrice = (price) => {
  if (typeof price === "string" && price.trim()) return price;
  return `₹${Number(price || 0).toLocaleString("en-IN")}`;
};

const getDistanceScore = (hotel, center) => {
  const latDiff = Number(hotel.latitude) - center.lat;
  const lngDiff = Number(hotel.longitude) - center.lng;

  return latDiff * latDiff + lngDiff * lngDiff;
};

const getSearchCenter = (channel) => {
  if (typeof window === "undefined") return null;

  const storedSearch = window.sessionStorage.getItem(HOTEL_SEARCH_SESSION_KEY);
  if (!storedSearch) return null;

  try {
    const searchContext = JSON.parse(storedSearch);
    if (channel && searchContext?.channel !== channel) return null;

    const geoCode =
      searchContext?.initPayload?.geoCode ||
      searchContext?.location?.geoCode ||
      searchContext?.location?.raw?.coordinates ||
      {};
    const lat = Number(geoCode.lat ?? geoCode.latitude);
    const lng = Number(geoCode.lng ?? geoCode.long ?? geoCode.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
};

export default function MapSection() {
  const searchParams = useSearchParams();
  const hotelSearchChannel = searchParams.get("channel") || "";
  const [hotelResults, setHotelResults] = useState([]);
  const [visibleHotels, setVisibleHotels] = useState([]);
  const [searchCenter, setSearchCenter] = useState(position);
  const mapRef = useRef(null);
  const hotelResultSourceRef = useRef("");

  useEffect(() => {
    setHotelResults([]);
    setVisibleHotels([]);
    setSearchCenter(getSearchCenter(hotelSearchChannel) || position);
    hotelResultSourceRef.current = "";

    const applyHotelResults = (payload) => {
      if (payload?.channel && payload.channel !== hotelSearchChannel) {
        return;
      }

      const nextResults = getHotelsFromMessage(payload);
      if (!nextResults.hotels.length) return;

      if (
        hotelResultSourceRef.current === "merged" &&
        nextResults.source !== "merged"
      ) {
        return;
      }

      setHotelResults(
        nextResults.hotels
          .slice(0, MAP_MARKER_SOURCE_LIMIT)
          .map(normalizeHotelCard),
      );
      hotelResultSourceRef.current = nextResults.source;
    };

    const handleHotelResults = (event) => {
      applyHotelResults(event.detail);
    };

    window.addEventListener(HOTEL_SEARCH_RESULTS_EVENT, handleHotelResults);

    const cachedResults = window.sessionStorage.getItem(HOTEL_SEARCH_RESULTS_KEY);
    if (cachedResults) {
      try {
        const cachedPayload = JSON.parse(cachedResults);
        if (!hotelSearchChannel || cachedPayload?.channel === hotelSearchChannel) {
          applyHotelResults(cachedPayload);
        }
      } catch {
        // Ignore stale malformed session data.
      }
    }

    return () => {
      window.removeEventListener(HOTEL_SEARCH_RESULTS_EVENT, handleHotelResults);
    };
  }, [hotelSearchChannel]);

  const hotels = useMemo(() => {
    return hotelResults.filter(
      (hotel) =>
        Number.isFinite(Number(hotel.latitude)) &&
        Number.isFinite(Number(hotel.longitude)),
    );
  }, [hotelResults]);

  const mapCenter = useMemo(() => {
    const firstHotel = hotels[0];
    if (!firstHotel) return searchCenter;

    return {
      lat: Number(firstHotel.latitude),
      lng: Number(firstHotel.longitude),
    };
  }, [hotels, searchCenter]);

  const updateVisibleHotels = useCallback(() => {
    if (!hotels.length) {
      setVisibleHotels([]);
      return;
    }

    const map = mapRef.current;
    const center = map?.getCenter?.();
    const bounds = map?.getBounds?.();
    const centerPoint = center
      ? { lat: center.lat(), lng: center.lng() }
      : mapCenter;

    const hotelsInBounds = bounds
      ? hotels.filter((hotel) =>
          bounds.contains({
            lat: Number(hotel.latitude),
            lng: Number(hotel.longitude),
          }),
        )
      : hotels;
    const markerSource = hotelsInBounds.length ? hotelsInBounds : hotels;

    setVisibleHotels(
      [...markerSource]
        .sort(
          (left, right) =>
            getDistanceScore(left, centerPoint) -
            getDistanceScore(right, centerPoint),
        )
        .slice(0, 10),
    );
  }, [hotels, mapCenter]);

  useEffect(() => {
    updateVisibleHotels();
  }, [updateVisibleHotels]);

  return (
    <LoadScriptNext
      googleMapsApiKey={process.env.NEXT_PUBLIC_MAP_KEY}
      loadingElement={<div className={styles.mapContainer} />}
    >
      <div className={styles.mapContainer}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={12}
          onLoad={(map) => {
            mapRef.current = map;
            window.setTimeout(updateVisibleHotels, 0);
          }}
          onUnmount={() => {
            mapRef.current = null;
          }}
          onIdle={updateVisibleHotels}
          options={{
            gestureHandling: "greedy",
            disableDefaultUI: false,
            clickableIcons: false,
          }}
        >
          {visibleHotels.map((hotel) => (
            <OverlayView
              key={hotel.id}
              position={{ lat: hotel.latitude, lng: hotel.longitude }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div
                className={styles.priceMarker}
                title={hotel.title || hotel.name}
                style={{ transform: "translate(-50%, -100%)" }}
              >
                {formatPrice(hotel.price ?? hotel.base_price)}
              </div>
            </OverlayView>
          ))}
        </GoogleMap>
      </div>
    </LoadScriptNext>
  );
}
