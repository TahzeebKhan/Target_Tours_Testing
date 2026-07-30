"use client";

import { useEffect, useMemo } from "react";
import { Minus, Plus } from "lucide-react";
import styles from "./HotelPassengersPopup.module.css";

const CHILD_AGE_OPTIONS = Array.from({ length: 16 }, (_, index) => index + 1);

const normalizeChildAges = (ages = [], count = 0) =>
  Array.from({ length: Math.max(0, Number(count) || 0) }, (_, index) =>
    String(ages[index] || ""),
  );

const createDefaultRoom = () => ({
  adults: 1,
  children: 0,
  childAges: [],
});

const normalizeRooms = (passengers = {}) => {
  const roomCount = Math.max(
    1,
    Number(passengers.room || passengers.rooms?.length || 1),
  );
  const sourceRooms = Array.isArray(passengers.rooms) ? passengers.rooms : [];

  return Array.from({ length: roomCount }, (_, index) => {
    const sourceRoom =
      sourceRooms[index] ||
      (index === 0
        ? {
            adults: passengers.adults ?? passengers.adult,
            children: passengers.children ?? passengers.child,
            childAges: passengers.childAges,
          }
        : createDefaultRoom());

    const children = Math.max(0, Number(sourceRoom.children || 0));

    return {
      adults: Math.max(1, Number(sourceRoom.adults || 1)),
      children,
      childAges: normalizeChildAges(sourceRoom.childAges, children),
    };
  });
};

const withRoomTotals = (passengers = {}, rooms = normalizeRooms(passengers)) => ({
  ...passengers,
  room: rooms.length,
  adults: rooms.reduce((sum, room) => sum + Number(room.adults || 0), 0),
  children: rooms.reduce((sum, room) => sum + Number(room.children || 0), 0),
  childAges: rooms.flatMap((room) => normalizeChildAges(room.childAges, room.children)),
  rooms,
});

const HotelPassengersPopup = ({
  passengers,
  setPassengers,
  onClose,
  inputType = "ROOMS & GUESTS",
}) => {
  const rooms = useMemo(() => normalizeRooms(passengers), [passengers]);
  const adultCount = Number(passengers?.adults ?? passengers?.adult) || 1;
  const childCount = Number(passengers?.children ?? passengers?.child) || 0;
  const infantCount = Number(passengers?.infant) || 0;
  const totalRooms = Number(passengers?.room || rooms.length || 1);
  const summaryAdults = rooms.reduce((sum, room) => sum + Number(room.adults || 0), 0);
  const summaryChildren = rooms.reduce(
    (sum, room) => sum + Number(room.children || 0),
    0,
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const updateRoomCount = (delta) => {
    setPassengers((prev) => {
      const currentRooms = normalizeRooms(prev);
      const nextCount = Math.max(1, currentRooms.length + delta);
      const nextRooms =
        nextCount > currentRooms.length
          ? [
              ...currentRooms,
              ...Array.from({ length: nextCount - currentRooms.length }, () =>
                createDefaultRoom(),
              ),
            ]
          : currentRooms.slice(0, nextCount);

      return withRoomTotals(prev, nextRooms);
    });
  };

  const updateRoomOccupancy = (roomIndex, key, delta) => {
    setPassengers((prev) => {
      const currentRooms = normalizeRooms(prev);
      const room = currentRooms[roomIndex] || createDefaultRoom();
      const minimum = key === "adults" ? 1 : 0;
      const nextValue = Math.max(minimum, Number(room[key] || 0) + delta);
      const nextRoom = {
        ...room,
        [key]: nextValue,
      };

      if (key === "children") {
        nextRoom.childAges = normalizeChildAges(room.childAges, nextValue);
      }

      const nextRooms = currentRooms.map((item, index) =>
        index === roomIndex ? nextRoom : item,
      );

      return withRoomTotals(prev, nextRooms);
    });
  };

  const updateChildAge = (roomIndex, childIndex, value) => {
    setPassengers((prev) => {
      const currentRooms = normalizeRooms(prev);
      const room = currentRooms[roomIndex] || createDefaultRoom();
      const childAges = normalizeChildAges(room.childAges, room.children);
      childAges[childIndex] = value;

      const nextRooms = currentRooms.map((item, index) =>
        index === roomIndex ? { ...room, childAges } : item,
      );

      return withRoomTotals(prev, nextRooms);
    });
  };

  const summaryText = `${summaryAdults} Adult${summaryAdults === 1 ? "" : "s"}, ${summaryChildren} Children, ${infantCount} Infant${infantCount === 1 ? "" : "s"}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.label}>{inputType}</span>
          <div className={styles.inputRow}>
            <div className={styles.selectedDate}>{summaryText}</div>
            <img src="/icons/Close.svg" alt="close" onClick={onClose} />
          </div>
        </div>

        <div className={styles.container}>
          <div className={styles.scrollContent}>
            <div className={styles.row}>
              <div className={styles.leftText}>
                <div className={styles.title}>ROOMS</div>
                <div className={styles.sub}>Select the number of rooms</div>
              </div>
              <div className={styles.counter}>
                <button
                  type="button"
                  disabled={totalRooms <= 1}
                  className={styles.counterBtn}
                  onClick={() => updateRoomCount(-1)}
                >
                  <Minus size={14} />
                </button>
                <span className={styles.counterText}>{totalRooms}</span>
                <button
                  type="button"
                  className={styles.counterBtn}
                  onClick={() => updateRoomCount(1)}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className={styles.roomsList}>
              {rooms.map((room, roomIndex) => {
                const childAges = normalizeChildAges(room.childAges, room.children);

                return (
                  <section className={styles.roomCard} key={`hotel-room-${roomIndex}`}>
                  <div className={styles.roomHeader}>
                    <strong className={styles.roomTitle}>Room {roomIndex + 1}</strong>
                    <span className={styles.roomSummary}>
                      {room.adults} Adult{room.adults === 1 ? "" : "s"}
                      {room.children > 0
                        ? `, ${room.children} Child${room.children === 1 ? "" : "ren"}`
                        : ""}
                    </span>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.leftText}>
                      <div className={styles.title}>ADULT</div>
                      <div className={styles.sub}>Adult (above 12 years old)</div>
                    </div>
                    <div className={styles.counter}>
                      <button
                        type="button"
                        disabled={room.adults <= 1}
                        className={styles.counterBtn}
                        onClick={() => updateRoomOccupancy(roomIndex, "adults", -1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span className={styles.counterText}>{room.adults}</span>
                      <button
                        type="button"
                        className={styles.counterBtn}
                        onClick={() => updateRoomOccupancy(roomIndex, "adults", 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.leftText}>
                      <div className={styles.title}>CHILDREN</div>
                      <div className={styles.sub}>(2 - 11 years old)</div>
                    </div>
                    <div className={styles.counter}>
                      <button
                        type="button"
                        disabled={room.children === 0}
                        className={styles.counterBtn}
                        onClick={() => updateRoomOccupancy(roomIndex, "children", -1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span className={styles.counterText}>{room.children}</span>
                      <button
                        type="button"
                        className={styles.counterBtn}
                        onClick={() => updateRoomOccupancy(roomIndex, "children", 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {room.children > 0 && (
                    <div className={styles.childAgeSection}>
                      <div>
                        <h4 className={styles.childAgeHeading}>Age of Children</h4>
                        <p className={styles.childAgeHint}>
                          Select age for each child in Room {roomIndex + 1}.
                        </p>
                      </div>

                      <div className={styles.childAgeGrid}>
                        {childAges.map((age, childIndex) => (
                          <label
                            className={styles.childAgeField}
                            key={`room-${roomIndex}-child-${childIndex}`}
                          >
                            <span>Child {childIndex + 1}</span>
                            <select
                              value={age}
                              onChange={(event) =>
                                updateChildAge(roomIndex, childIndex, event.target.value)
                              }
                            >
                              <option value="">Select</option>
                              {CHILD_AGE_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  </section>
                );
              })}
            </div>
          </div>

          <button type="button" className={styles.doneBtn} onClick={onClose}>
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelPassengersPopup;
