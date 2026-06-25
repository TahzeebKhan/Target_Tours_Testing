"use client";
import React, { useEffect, useRef } from "react";
import styles from './HotelDropDown.module.css'
import { Minus, Plus } from "lucide-react";
import { toast } from "react-toastify";

// const CLASSES = ["Economy", "Premium Economy", "Business", "First Class"];
const CHILD_AGE_OPTIONS = Array.from({ length: 16 }, (_, index) => index + 1);

const normalizeChildAges = (ages = [], count = 0) => {
  const nextCount = Math.max(0, Number(count) || 0);
  const nextAges = Array.isArray(ages) ? ages : [];

  return Array.from({ length: nextCount }, (_, index) => {
    const age = nextAges[index];
    return age === undefined || age === null ? "" : String(age);
  });
};

const createDefaultRoom = () => ({
  adults: 1,
  children: 0,
  childAges: [],
});

const normalizeRooms = (passengers = {}) => {
  const roomCount = Math.max(1, Number(passengers.room || passengers.rooms?.length || 1));
  const sourceRooms = Array.isArray(passengers.rooms) ? passengers.rooms : [];

  return Array.from({ length: roomCount }, (_, index) => {
    const sourceRoom =
      sourceRooms[index] ||
      (index === 0
        ? {
            adults: passengers.adults,
            children: passengers.children,
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

const HotelDropDown = ({
  open,
  setOpen,
  passengers,
  setPassengers,
  travelClass,
  setTravelClass,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEsc = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [setOpen]);

  const updateRoomCount = (delta) => {
    setPassengers((prev) => {
      const rooms = normalizeRooms(prev);
      const nextCount = Math.max(1, rooms.length + delta);
      const nextRooms =
        nextCount > rooms.length
          ? [...rooms, createDefaultRoom()]
          : rooms.slice(0, nextCount);

      return withRoomTotals(prev, nextRooms);
    });
  };

  const updateRoomOccupancy = (roomIndex, key, delta) => {
    setPassengers((prev) => {
      const rooms = normalizeRooms(prev);
      const room = rooms[roomIndex] || createDefaultRoom();
      const minimum = key === "adults" ? 1 : 0;
      const nextValue = Math.max(minimum, Number(room[key] || 0) + delta);
      const nextRoom = {
        ...room,
        [key]: nextValue,
      };

      if (key === "children") {
        nextRoom.childAges = normalizeChildAges(room.childAges, nextValue);
      }

      const nextRooms = rooms.map((item, index) =>
        index === roomIndex ? nextRoom : item,
      );

      return withRoomTotals(prev, nextRooms);
    });
  };

  const updateChildAge = (roomIndex, childIndex, value) => {
    setPassengers((prev) => {
      const rooms = normalizeRooms(prev);
      const room = rooms[roomIndex] || createDefaultRoom();
      const childAges = normalizeChildAges(room.childAges, room.children);
      childAges[childIndex] = value;
      const nextRooms = rooms.map((item, index) =>
        index === roomIndex ? { ...room, childAges } : item,
      );

      return withRoomTotals(prev, nextRooms);
    });
  };

  const handleApply = () => {
    const rooms = normalizeRooms(passengers);
    const hasMissingChildAge = rooms.some((room) =>
      normalizeChildAges(room.childAges, room.children).some((age) => !age),
    );

    if (hasMissingChildAge) {
      toast.error("Select age for each child.");
      return;
    }

    setOpen(false);
  };

  if (!open) return null;

  const rooms = normalizeRooms(passengers);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={styles.dropdown}
      ref={ref}
    >
      {/* <h4 className={styles.heading}>Set Passenger</h4> */}
      <div className={styles.counterDiv}>
        <div className={styles.row}>
          <div>
            <div className={styles.label}>Room</div>
          </div>

          <div className={styles.counter}>
            <button
              onClick={() => updateRoomCount(-1)}
              className={styles.minusBtn}
              disabled={rooms.length <= 1}
            >
              <Minus size={13} />
            </button>
            <span>{rooms.length}</span>
            <button
              className={styles.plusBtn}
              onClick={() => updateRoomCount(1)}
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {rooms.map((room, roomIndex) => {
          const childAges = normalizeChildAges(room.childAges, room.children);

          return (
            <div className={styles.roomCard} key={`hotel-room-${roomIndex}`}>
              <div className={styles.roomHeader}>
                <div className={styles.roomTitle}>Room {roomIndex + 1}</div>
                <div className={styles.roomSummary}>
                  {room.adults} Adult{room.adults === 1 ? "" : "s"}
                  {room.children > 0
                    ? `, ${room.children} Child${room.children === 1 ? "" : "ren"}`
                    : ""}
                </div>
              </div>

              {[
                { key: "adults", label: "Adults" },
                { key: "children", label: "Children (1-16 Years Old)" },
              ].map((row) => (
                <div key={`${roomIndex}-${row.key}`} className={styles.row}>
                  <div>
                    <div className={styles.label}>{row.label}</div>
                  </div>

                  <div className={styles.counter}>
                    <button
                      onClick={() => updateRoomOccupancy(roomIndex, row.key, -1)}
                      className={styles.minusBtn}
                      disabled={row.key === "adults" ? room.adults <= 1 : room.children <= 0}
                    >
                      <Minus size={13} />
                    </button>
                    <span>{room[row.key]}</span>
                    <button
                      className={styles.plusBtn}
                      onClick={() => updateRoomOccupancy(roomIndex, row.key, 1)}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}

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
                        key={`room-${roomIndex}-child-age-${childIndex}`}
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
            </div>
          );
        })}

        <div className={styles.row}>
          <div>
            <div className={styles.label}>Pets</div>
          </div>

          <div className={styles.counter}>
            <button
              onClick={() => {
                setPassengers((prev) => ({
                  ...prev,
                  pets: Math.max(0, Number(prev.pets || 0) - 1),
                }));
              }}
              className={styles.minusBtn}
              disabled={Number(passengers.pets || 0) <= 0}
            >
              <Minus size={13} />
            </button>
            <span>{Number(passengers.pets || 0)}</span>
            <button
              className={styles.plusBtn}
              onClick={() => {
                setPassengers((prev) => ({
                  ...prev,
                  pets: Math.max(0, Number(prev.pets || 0) + 1),
                }));
              }}
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* <h4 className={styles.heading}>Preferred Class</h4>

      <div className={styles.classGrid}>
        {CLASSES.map((cls) => (
          <button
            key={cls}
            className={`${styles.classBtn} ${travelClass === cls ? styles.active : ""
              }`}
            onClick={() => setTravelClass(cls)}
          >
            {cls}
          </button>
        ))}
      </div> */}

      <div className={styles.applyBtnContainer}>
        <button className={styles.applyBtn} onClick={handleApply}>apply</button>
      </div>
    </div>
  );
};

export default HotelDropDown;
