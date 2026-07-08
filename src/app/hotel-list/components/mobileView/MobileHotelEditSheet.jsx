"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, X } from "lucide-react";
import useLockBodyScroll from "@/app/hooks/useLockBodyScroll";
import SuggestionBox from "@/app/home-page/components/homePage/SuggestionBox";
import { fetchHotelSearchSuggestions } from "@/shared/services/hotelSearch";
import styles from "./MobileHotelEditSheet.module.css";

const toDateInputValue = (value = "") => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeChildAges = (childAges = [], childCount = 0) =>
  Array.from({ length: childCount }, (_, index) => String(childAges[index] || ""));

const getRoomTotals = (rooms = []) =>
  rooms.reduce(
    (totals, room) => ({
      adults: totals.adults + Number(room.adults || 0),
      children: totals.children + Number(room.children || 0),
    }),
    { adults: 0, children: 0 },
  );

const normalizeRoomDetails = (initialValues = {}) => {
  const sourceRooms = Array.isArray(initialValues.roomDetails)
    ? initialValues.roomDetails
    : [];

  if (sourceRooms.length) {
    return sourceRooms.map((room) => {
      const children = Math.max(0, Number(room.children || 0));
      return {
        adults: Math.max(1, Number(room.adults || 1)),
        children,
        childAges: normalizeChildAges(room.childAges, children),
      };
    });
  }

  const roomCount = Math.max(1, Number(initialValues.rooms || 1));
  const totalAdults = Math.max(roomCount, Number(initialValues.adults || roomCount));
  const totalChildren = Math.max(0, Number(initialValues.children || 0));
  const flatChildAges = Array.isArray(initialValues.childAges)
    ? initialValues.childAges
    : [];
  let remainingAdults = totalAdults - roomCount;
  let remainingChildren = totalChildren;
  let childAgeIndex = 0;

  return Array.from({ length: roomCount }, (_, index) => {
    const extraAdults = index === 0 ? remainingAdults : 0;
    remainingAdults -= extraAdults;
    const children = index === 0 ? remainingChildren : 0;
    remainingChildren -= children;
    const childAges = normalizeChildAges(
      flatChildAges.slice(childAgeIndex, childAgeIndex + children),
      children,
    );
    childAgeIndex += children;

    return {
      adults: 1 + extraAdults,
      children,
      childAges,
    };
  });
};

const CounterRow = ({ label, value, min = 0, onChange }) => (
  <div className={styles.counterRow}>
    <span>{label}</span>
    <div className={styles.counter}>
      <button
        type="button"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={14} />
      </button>
      <strong>{value}</strong>
      <button type="button" onClick={() => onChange(value + 1)}>
        <Plus size={14} />
      </button>
    </div>
  </div>
);

export default function MobileHotelEditSheet({
  open,
  onClose,
  initialValues,
  onApply,
  isSubmitting = false,
}) {
  const [form, setForm] = useState(() => {
    const roomDetails = normalizeRoomDetails(initialValues);
    const totals = getRoomTotals(roomDetails);

    return {
      city: initialValues.city || "",
      checkIn: toDateInputValue(initialValues.checkIn),
      checkOut: toDateInputValue(initialValues.checkOut),
      rooms: roomDetails.length,
      adults: totals.adults,
      children: totals.children,
      roomDetails,
    };
  });
  const destinationWrapRef = useRef(null);
  const [destinationQuery, setDestinationQuery] = useState(
    initialValues.city || "",
  );
  const [selectedDestination, setSelectedDestination] = useState(
    initialValues.destination || null,
  );
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  const debouncedDestinationQuery = useMemo(
    () => String(destinationQuery || "").trim(),
    [destinationQuery],
  );

  const shouldFetchDestinationSuggestions = debouncedDestinationQuery.length >= 2;

  const { data: hotelSuggestions = [] } = useQuery({
    queryKey: [
      "mobile-hotel-edit-destination-suggestions",
      debouncedDestinationQuery.toLowerCase(),
      process.env.NEXT_PUBLIC_DOMAIN,
    ],
    queryFn: () => fetchHotelSearchSuggestions(debouncedDestinationQuery),
    enabled: open && showDestinationSuggestions && shouldFetchDestinationSuggestions,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  useLockBodyScroll(open);

  useEffect(() => {
    if (open) {
      const roomDetails = normalizeRoomDetails(initialValues);
      const totals = getRoomTotals(roomDetails);
      setForm({
        city: initialValues.city || "",
        checkIn: toDateInputValue(initialValues.checkIn),
        checkOut: toDateInputValue(initialValues.checkOut),
        rooms: roomDetails.length,
        adults: totals.adults,
        children: totals.children,
        roomDetails,
      });
      setDestinationQuery(initialValues.city || "");
      setSelectedDestination(initialValues.destination || null);
      setShowDestinationSuggestions(false);
    }
  }, [initialValues, open]);

  if (!open) return null;

  const setValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setRoomCount = (value) => {
    setForm((prev) => ({
      ...prev,
      rooms: value,
      roomDetails:
        value > (prev.roomDetails || []).length
          ? [
              ...(prev.roomDetails || []),
              ...Array.from(
                { length: value - (prev.roomDetails || []).length },
                () => ({ adults: 1, children: 0, childAges: [] }),
              ),
            ]
          : (prev.roomDetails || []).slice(0, value),
    }));
  };

  const setRoomValue = (roomIndex, key, value) => {
    setForm((prev) => ({
      ...prev,
      roomDetails: (prev.roomDetails || []).map((room, index) => {
        if (index !== roomIndex) return room;

        if (key === "children") {
          return {
            ...room,
            children: value,
            childAges: normalizeChildAges(room.childAges, value),
          };
        }

        return { ...room, [key]: value };
      }),
    }));
  };

  const setChildAge = (roomIndex, childIndex, value) => {
    setForm((prev) => ({
      ...prev,
      roomDetails: (prev.roomDetails || []).map((room, index) =>
        index === roomIndex
          ? {
              ...room,
              childAges: room.childAges.map((age, ageIndex) =>
                ageIndex === childIndex ? value : age,
              ),
            }
          : room,
      ),
    }));
  };

  const currentRoomDetails = Array.isArray(form.roomDetails) ? form.roomDetails : [];
  const totals = getRoomTotals(currentRoomDetails);
  const isApplyDisabled =
    isSubmitting ||
    !form.city?.trim() ||
    !form.checkIn ||
    !form.checkOut ||
    currentRoomDetails.some(
      (room) => room.children > 0 && room.childAges.some((age) => !age),
    );

  const handleApply = () => {
    const roomDetails = currentRoomDetails.map((room) => ({
      adults: Math.max(1, Number(room.adults || 1)),
      children: Math.max(0, Number(room.children || 0)),
      childAges: normalizeChildAges(room.childAges, Number(room.children || 0)),
    }));
    const nextTotals = getRoomTotals(roomDetails);

    onApply({
      ...form,
      rooms: roomDetails.length,
      adults: nextTotals.adults,
      children: nextTotals.children,
      childAges: roomDetails.flatMap((room) => room.childAges),
      roomDetails,
      destination: selectedDestination,
    });
  };

  return (
    <>
      <button type="button" className={styles.overlay} onClick={onClose} aria-label="Close edit search" />
      <section className={styles.sheet} aria-label="Edit hotel search">
        <header className={styles.header}>
          <span>EDIT SEARCH</span>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close edit search">
            <X size={20} />
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.field} ref={destinationWrapRef}>
            <span>Destination</span>
            <input
              value={destinationQuery}
              onChange={(event) => {
                const nextValue = event.target.value;
                setDestinationQuery(nextValue);
                setValue("city", nextValue);
                setSelectedDestination(null);
                setShowDestinationSuggestions(true);
              }}
              onFocus={() => setShowDestinationSuggestions(true)}
              placeholder="City"
            />
            {showDestinationSuggestions &&
              shouldFetchDestinationSuggestions &&
              hotelSuggestions.length > 0 && (
                <SuggestionBox
                  boxRef={null}
                  anchorRef={destinationWrapRef}
                  heading="SUGGESTIONS"
                  theme="light"
                  style={{ width: "100%" }}
                  suggestions={hotelSuggestions.map((item) => ({
                    ...item,
                    label: item.label || item.value,
                    detail: item.detail,
                    code: item.code || item.locationId || item.id,
                    value: item.value || item.label,
                    hotelLocation: item,
                  }))}
                  onSelect={(item) => {
                    const nextLabel = item.value || item.label || "";
                    setDestinationQuery(nextLabel);
                    setValue("city", nextLabel);
                    setSelectedDestination(item.hotelLocation || item);
                    setShowDestinationSuggestions(false);
                  }}
                />
              )}
          </div>

          <div className={styles.dateGrid}>
            <label className={styles.field}>
              <span>Check-in</span>
              <input
                type="date"
                value={form.checkIn}
                onChange={(event) => setValue("checkIn", event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>Check-out</span>
              <input
                type="date"
                value={form.checkOut}
                min={form.checkIn || undefined}
                onChange={(event) => setValue("checkOut", event.target.value)}
              />
            </label>
          </div>

          <CounterRow
            label="Rooms"
            value={form.rooms}
            min={1}
            onChange={setRoomCount}
          />

          <div className={styles.roomsList}>
            {currentRoomDetails.map((room, roomIndex) => (
              <section className={styles.roomCard} key={`room-${roomIndex}`}>
                <div className={styles.roomHeader}>
                  <strong>Room {roomIndex + 1}</strong>
                  <span>
                    {room.adults} Adult{room.adults === 1 ? "" : "s"}
                    {room.children > 0
                      ? `, ${room.children} Child${room.children === 1 ? "" : "ren"}`
                      : ""}
                  </span>
                </div>

                <CounterRow
                  label="Adults"
                  value={room.adults}
                  min={1}
                  onChange={(value) => setRoomValue(roomIndex, "adults", value)}
                />
                <CounterRow
                  label="Children (1-16 Years Old)"
                  value={room.children}
                  min={0}
                  onChange={(value) => setRoomValue(roomIndex, "children", value)}
                />

                {room.children > 0 && (
                  <div className={styles.childAgeGrid}>
                    {room.childAges.map((age, childIndex) => (
                      <label className={styles.field} key={`room-${roomIndex}-child-${childIndex}`}>
                        <span>Child {childIndex + 1} age</span>
                        <select
                          value={age}
                          onChange={(event) =>
                            setChildAge(roomIndex, childIndex, event.target.value)
                          }
                        >
                          <option value="">Age</option>
                          {Array.from({ length: 17 }, (_, ageIndex) => {
                            const optionAge = String(ageIndex + 1);
                            return (
                              <option key={optionAge} value={optionAge}>
                                {optionAge}
                              </option>
                            );
                          })}
                        </select>
                      </label>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>

        <footer className={styles.actionBar}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            CANCEL
          </button>
          <button
            type="button"
            className={styles.applyButton}
            disabled={isApplyDisabled}
            onClick={handleApply}
          >
            {isSubmitting
              ? "SEARCHING"
              : `SEARCH ${totals.adults + totals.children} GUEST${totals.adults + totals.children === 1 ? "" : "S"}`}
          </button>
        </footer>
      </section>
    </>
  );
}
