import React, { useEffect, useRef, useState } from "react";
import styles from "./TravelerDetails.module.css";
import {
  CountryCodes,
  CountryFlagIcon,
} from "@/app/profile/components/profileSection/CountryName";

const createTraveler = (overrides = {}) => ({
    title: "Mr",
    firstName: "Mukul",
    middleName: "Kumar",
    lastName: "Mishra",
    gender: "male",
    passengerType: "A",
    age: "25",
    countryCode: "IN",
    mobile: "8532907106",
    email: "mukul.mishra@webninjaz.com",
    ...overrides,
});
const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

const COUNTRY_OPTIONS = [...CountryCodes]
  .sort((a, b) => {
    if (a.code === "IN") return -1;
    if (b.code === "IN") return 1;
    return a.name.localeCompare(b.name);
  })
  .map((country) => ({
    code: country.code,
    name: country.name,
    dialCode: country.dial_code,
    searchText: `${country.code} ${country.name || ""} ${
      country.dial_code || ""
    }`.toLowerCase(),
  }));

const fallbackRooms = [{ id: "default-room", title: "Room" }];

const getFirstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "") || "";

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const normalizeChildAges = (value) => {
  if (Array.isArray(value)) return value.map((age) => String(age)).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[:,|]/)
      .map((age) => age.trim())
      .filter(Boolean);
  }

  return [];
};

const getChildAgesFromGuestCode = (guestCode = "") => {
  const childSection = String(guestCode || "").match(/\|(\d+):C:([^|]+)/i);
  if (!childSection) return [];

  return childSection[2]
    .split(":")
    .map((age) => age.trim())
    .filter(Boolean);
};

const getOccupancyAdultCount = (occupancy = {}) =>
  toNumber(
    getFirstValue(
      occupancy.numOfAdults,
      occupancy.NumOfAdults,
      occupancy.adults,
      occupancy.adultCount,
    ),
  );

const getOccupancyChildCount = (occupancy = {}) =>
  toNumber(
    getFirstValue(
      occupancy.numOfChildren,
      occupancy.NumOfChildren,
      occupancy.children,
      occupancy.childCount,
    ),
  );

const getOccupancyChildAges = (occupancy = {}, room = {}) =>
  normalizeChildAges(
    getFirstValue(
      occupancy.childAges,
      occupancy.childrenAges,
      occupancy.ChildAges,
      occupancy.child_ages,
      occupancy.ages,
      room.childAges,
      room.childrenAges,
      room.ChildAges,
    ),
  );

const getRoomOccupancies = (room = {}, roomIndex = 0) => {
  if (!Array.isArray(room.occupancies) || !room.occupancies.length) {
    return [];
  }

  const selectedRoomCount =
    Math.max(1, Number(room.quantity || 1)) *
    Math.max(1, Number(room.roomUnits || room.comboRoomCount || 1));

  if (selectedRoomCount > 1) {
    return room.occupancies.slice(0, selectedRoomCount);
  }

  if (room.occupancies.length === 1) {
    return room.occupancies;
  }

  return [room.occupancies[roomIndex] || room.occupancies[0]];
};

const buildTravelersFromRoom = (room = {}, roomIndex = 0) => {
  const assignedOccupancies = getRoomOccupancies(room, roomIndex);
  const sourceOccupancies = assignedOccupancies.length
    ? assignedOccupancies
    : [
        {
          numOfAdults: getFirstValue(room.adults, room.numOfAdults, room.NumOfAdults, 1),
          numOfChildren: getFirstValue(room.children, room.numOfChildren, room.NumOfChildren, 0),
          childAges: room.childAges || room.childrenAges || room.ChildAges || [],
        },
      ];
  const fallbackChildAges = getChildAgesFromGuestCode(room.guestCode || room.GuestCode);

  const travelers = sourceOccupancies.flatMap((occupancy) => {
    const adults = Math.max(0, getOccupancyAdultCount(occupancy));
    const children = Math.max(0, getOccupancyChildCount(occupancy));
    const childAges = getOccupancyChildAges(occupancy, room);
    const resolvedChildAges = childAges.length ? childAges : fallbackChildAges;

    return [
      ...Array.from({ length: adults }, () => createTraveler({ passengerType: "A", age: "25" })),
      ...Array.from({ length: children }, (_, childIndex) =>
        createTraveler({
          passengerType: "C",
          age: String(resolvedChildAges[childIndex] || ""),
        }),
      ),
    ];
  });

  return travelers.length ? travelers : [createTraveler()];
};

const mergeTravelers = (current = [], expected = []) =>
  expected.map((traveler, index) => ({
    ...traveler,
    ...(current[index] || {}),
    passengerType: traveler.passengerType,
    age: traveler.passengerType === "C" ? traveler.age : current[index]?.age || traveler.age,
  }));

const getOccupancyGuestCount = (occupancy = {}) =>
  getOccupancyAdultCount(occupancy) + getOccupancyChildCount(occupancy);

const getRoomGuestLimit = (room = {}, roomIndex = 0) => {
  const assignedOccupancies = getRoomOccupancies(room, roomIndex);
  const occupancyTotal = assignedOccupancies.length
    ? assignedOccupancies.reduce(
        (total, occupancy) => total + getOccupancyGuestCount(occupancy),
        0,
      )
    : 0;
  const quantity = Math.max(1, Number(room.quantity || 1));
  const explicitLimit = Number(
    room.maxGuestAllowed || room.maxGuests || room.guestCapacity || 0,
  );
  const limit = explicitLimit
    ? explicitLimit * quantity
    : occupancyTotal
      ? occupancyTotal * quantity
      : 0;

  return limit || Math.max(1, quantity);
};

const CountryCodeDropdown = ({ value, onChange, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const selectedCountry =
    COUNTRY_OPTIONS.find((option) => option.code === value) ||
    COUNTRY_OPTIONS[0];
  const filteredOptions = search.trim()
    ? COUNTRY_OPTIONS.filter((option) =>
        option.searchText.includes(search.trim().toLowerCase()),
      )
    : COUNTRY_OPTIONS;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  return (
    <div
      className={`${styles.customDropdown} ${
        isOpen ? styles.customDropdownOpen : ""
      }`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className={styles.customTrigger}
        aria-expanded={isOpen}
        aria-label="Select country code"
        onClick={() => {
          const rect = dropdownRef.current?.getBoundingClientRect();
          setOpenUp(Boolean(rect && window.innerHeight - rect.bottom < 280));
          setIsOpen((current) => !current);
          setSearch("");
        }}
      >
        <span className={styles.triggerContent}>
          <CountryFlagIcon
            code={selectedCountry.code}
            title={selectedCountry.code}
            className={styles.countryFlag}
          />
          {selectedCountry.dialCode}
        </span>
      </button>
      <input type="hidden" required={required} value={value} onChange={() => {}} />

      {isOpen && (
        <div
          className={`${styles.customMenu} ${
            openUp ? styles.customMenuUp : ""
          }`}
        >
          <input
            type="text"
            className={styles.customSearch}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search country"
            aria-label="Search country"
          />

          <div className={styles.customOptionsList}>
            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  title={option.name}
                  className={`${styles.customOption} ${
                    option.code === value ? styles.customOptionActive : ""
                  }`}
                  onClick={() => {
                    onChange(option.code);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  <CountryFlagIcon
                    code={option.code}
                    title={option.code}
                    className={styles.countryFlag}
                  />
                  <span>{option.dialCode}</span>
                </button>
              ))
            ) : (
              <p className={styles.customNoResult}>No result</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StateDropdown = ({ value, onChange, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const filteredStates = search.trim()
    ? states.filter((state) =>
        state.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : states;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  return (
    <div
      className={`${styles.customDropdown} ${
        isOpen ? styles.customDropdownOpen : ""
      }`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className={styles.customTrigger}
        aria-expanded={isOpen}
        onClick={() => {
          const rect = dropdownRef.current?.getBoundingClientRect();
          setOpenUp(Boolean(rect && window.innerHeight - rect.bottom < 280));
          setIsOpen((current) => !current);
          setSearch("");
        }}
      >
        <span>{value || "Select State"}</span>
      </button>
      <input type="hidden" required={required} value={value} onChange={() => {}} />

      {isOpen && (
        <div
          className={`${styles.customMenu} ${
            openUp ? styles.customMenuUp : ""
          }`}
        >
          <input
            type="text"
            className={styles.customSearch}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search state"
            aria-label="Search state"
          />

          <div className={styles.customOptionsList}>
            {filteredStates.length ? (
              filteredStates.map((state) => (
                <button
                  key={state}
                  type="button"
                  className={`${styles.customOption} ${
                    state === value ? styles.customOptionActive : ""
                  }`}
                  onClick={() => {
                    onChange(state);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  {state}
                </button>
              ))
            ) : (
              <p className={styles.customNoResult}>No result</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TravelerDetails = ({ rooms = [], onChange }) => {
    const [roomGuests, setRoomGuests] = useState({});
    const [collapsedGuests, setCollapsedGuests] = useState({});
    const [bookingContact, setBookingContact] = useState({
        title: "Mr",
        firstName: "Mukul",
        lastName: "Mishra",
        countryCode: "IN",
        mobile: "8532907106",
        email: "mukul.mishra@webninjaz.com",
        address: "Noida",
        state: "delhi",
        city: "Noida",
        pin: "207001",
    });

    useEffect(() => {
        setRoomGuests(prev => {
            const next = {};
            const activeRooms = rooms.length ? rooms : fallbackRooms;
            let hasChanges = false;

            activeRooms.forEach((room, roomIndex) => {
                const expectedGuests = buildTravelersFromRoom(room, roomIndex);
                const currentGuests = prev[room.id] || [];

                if (
                    currentGuests.length === expectedGuests.length &&
                    currentGuests.every(
                        (guest, index) =>
                            guest.passengerType === expectedGuests[index].passengerType &&
                            (expectedGuests[index].passengerType !== "C" ||
                                String(guest.age || "") === String(expectedGuests[index].age || "")),
                    )
                ) {
                    next[room.id] = currentGuests;
                    return;
                }

                hasChanges = true;
                next[room.id] = mergeTravelers(currentGuests, expectedGuests);
            });

            const prevKeys = Object.keys(prev);
            if (prevKeys.length !== activeRooms.length) {
                hasChanges = true;
            }

            if (!hasChanges) {
                return prev;
            }

            return next;
        });
    }, [rooms]);

    useEffect(() => {
        onChange?.({ roomGuests, bookingContact });
    }, [roomGuests, bookingContact, onChange]);

    const addTraveler = (room, roomIndex = 0, maxGuests = Infinity) => {
        const roomId = room.id;
        setRoomGuests(prev => ({
            ...prev,
            [roomId]:
                (prev[roomId] || []).length >= maxGuests
                    ? (prev[roomId] || [])
                    : [
                        ...(prev[roomId] || []),
                        buildTravelersFromRoom(room, roomIndex)[(prev[roomId] || []).length] ||
                          createTraveler(),
                      ],
        }));
    };

    const removeTraveler = (roomId, index) => {
        setRoomGuests(prev => ({
            ...prev,
            [roomId]: (prev[roomId] || []).filter((_, i) => i !== index),
        }));
        setCollapsedGuests((prev) => {
            const next = { ...prev };
            delete next[`${roomId}-${index}`];
            return next;
        });
    };

    const toggleTravelerCollapse = (roomId, index) => {
        const guestKey = `${roomId}-${index}`;
        setCollapsedGuests((prev) => ({
            ...prev,
            [guestKey]: !prev[guestKey],
        }));
    };

    const updateTraveler = (roomId, index, field, value) => {
        setRoomGuests(prev => ({
            ...prev,
            [roomId]: (prev[roomId] || []).map((traveler, travelerIndex) =>
                travelerIndex === index ? { ...traveler, [field]: value } : traveler,
            ),
        }));
    };

    const updateBookingContact = (field, value) => {
        setBookingContact(prev => ({ ...prev, [field]: value }));
    };

    return (
      <div className={styles.wrapper}>
        {/* Traveler Cards */}
        {(rooms.length ? rooms : fallbackRooms).map((room, roomIndex) => {
          const travelers = roomGuests[room.id] || [createTraveler()];
          const maxGuests = getRoomGuestLimit(room, roomIndex);
          const canAddGuest = travelers.length < maxGuests;

          return (
          <div key={room.id}>
            <div
              className={`${styles.addTraveler} ${
                !canAddGuest ? styles.addTravelerDisabled : ""
              }`}
              onClick={() => {
                if (canAddGuest) addTraveler(room, roomIndex, maxGuests);
              }}
            >
              +Add Guest for {room.title}
              {!canAddGuest ? ` (${maxGuests} guest limit)` : ""}
            </div>

            {travelers.map(
              (traveler, index) => {
                const guestKey = `${room.id}-${index}`;
                const isCollapsed = Boolean(collapsedGuests[guestKey]);
                const passengerLabel =
                  traveler.passengerType === "C" ? "CHILD" : "ADULT";

                return (
                <div key={`${room.id}-${index}`} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>
                      {room.title} - GUEST {index + 1} - {passengerLabel}
                    </h3>

                    <div className={styles.cardActions}>
                      {index > 0 && (
                        <button
                          type="button"
                          className={styles.removeGuest}
                          onClick={() => removeTraveler(room.id, index)}
                          aria-label={`Remove guest ${index + 1}`}
                        >
                          ×
                        </button>
                      )}
                      <button
                        type="button"
                        className={styles.collapse}
                        onClick={() => toggleTravelerCollapse(room.id, index)}
                        aria-label={
                          isCollapsed
                            ? `Expand guest ${index + 1}`
                            : `Collapse guest ${index + 1}`
                        }
                      >
                        {isCollapsed ? "+" : "—"}
                      </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                  <div className={styles.cardBody}>
                    <div className={styles.grid}>
                      <div className={`${styles.field} ${styles.selectField}`}>
                        <label className={styles.label}>Title</label>
                        <select
                          className={styles.select}
                          required
                          value={traveler.title}
                          onChange={(event) =>
                            updateTraveler(
                              room.id,
                              index,
                              "title",
                              event.target.value,
                            )
                          }
                        >
                          <option value="Mr">Mr</option>
                          <option value="Ms">Ms</option>
                          <option value="Mrs">Mrs</option>
                        </select>
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>First Name</label>
                        <input
                          className={styles.input}
                          type="text"
                          required
                          value={traveler.firstName}
                          onChange={(event) =>
                            updateTraveler(
                              room.id,
                              index,
                              "firstName",
                              event.target.value,
                            )
                          }
                          placeholder="Enter First Name"
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>Middle Name</label>
                        <input
                          className={styles.input}
                          type="text"
                          value={traveler.middleName}
                          onChange={(event) =>
                            updateTraveler(
                              room.id,
                              index,
                              "middleName",
                              event.target.value,
                            )
                          }
                          placeholder="Enter Middle Name"
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label}>Last Name</label>
                        <input
                          className={styles.input}
                          type="text"
                          required
                          value={traveler.lastName}
                          onChange={(event) =>
                            updateTraveler(
                              room.id,
                              index,
                              "lastName",
                              event.target.value,
                            )
                          }
                          placeholder="Enter Last Name"
                        />
                      </div>

                      <div className={`${styles.field} ${styles.selectField}`}>
                        <label className={styles.label}>Gender</label>
                        <select
                          className={styles.select}
                          required
                          value={traveler.gender}
                          onChange={(event) =>
                            updateTraveler(
                              room.id,
                              index,
                              "gender",
                              event.target.value,
                            )
                          }
                        >
                          <option value="" disabled hidden>
                            Select
                          </option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div className={`${styles.field} ${styles.selectField}`}>
                        <label className={styles.label}>Passenger Type</label>
                        <select
                          className={styles.select}
                          required
                          value={traveler.passengerType}
                          onChange={(event) =>
                            updateTraveler(
                              room.id,
                              index,
                              "passengerType",
                              event.target.value,
                            )
                          }
                        >
                          <option value="" disabled hidden>
                            Select
                          </option>
                          <option value="A">Adult</option>
                          <option value="C">Child</option>
                        </select>
                      </div>


                      <div className={styles.field}>
                        <label className={styles.label}>Age</label>
                        <input
                          className={styles.input}
                          type="number"
                          min="0"
                          value={traveler.age}
                          onChange={(event) =>
                            updateTraveler(
                              room.id,
                              index,
                              "age",
                              event.target.value,
                            )
                          }
                          placeholder="Enter Age"
                        />
                      </div>
                        <div className={styles.field}>
                        <label className={styles.label}>Country Code</label>
                        <CountryCodeDropdown
                          value={traveler.countryCode}
                          onChange={(value) =>
                            updateTraveler(
                              room.id,
                              index,
                              "countryCode",
                              value,
                            )
                          }
                        />
                      </div>
                            <div className={styles.field}>
                        <label className={styles.label}>Mobile Number</label>
                        <input
                          className={styles.input}
                          type="text"
                          value={traveler.mobile}
                          onChange={(event) =>
                            updateTraveler(
                              room.id,
                              index,
                              "mobile",
                              event.target.value,
                            )
                          }
                          placeholder="Mobile number (optional)"
                        />
                      </div>

                    </div>

                    <div className={styles.grid}>
                      <div className={styles.field}>
                        <label className={styles.label}>Email</label>
                        <input
                          className={styles.input}
                          type="email"
                          value={traveler.email}
                          onChange={(event) =>
                            updateTraveler(
                              room.id,
                              index,
                              "email",
                              event.target.value,
                            )
                          }
                          placeholder="Email (Optional)"
                        />
                      </div>
                    </div>
                  </div>
                  )}
                </div>
                );
              },
            )}
          </div>
          );
        })}

        {/* Booking Details */}
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>
            BOOKING DETAILS WILL BE SENT TO
          </h3>

          <div className={styles.grid}>
            <div className={`${styles.field} ${styles.selectField}`}>
              <label className={styles.label}>Title</label>
              <select
                className={styles.select}
                required
                value={bookingContact.title}
                onChange={(event) =>
                  updateBookingContact("title", event.target.value)
                }
              >
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Mrs">Mrs</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>First Name</label>
              <input
                className={`${styles.input} ${styles.bookingInput}`}
                required
                value={bookingContact.firstName}
                onChange={(event) =>
                  updateBookingContact("firstName", event.target.value)
                }
                placeholder="Enter First Name"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Last Name</label>
              <input
                className={`${styles.input} ${styles.bookingInput}`}
                required
                value={bookingContact.lastName}
                onChange={(event) =>
                  updateBookingContact("lastName", event.target.value)
                }
                placeholder="Enter Last Name"
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Country Code</label>
              <CountryCodeDropdown
                required
                value={bookingContact.countryCode}
                onChange={(value) => updateBookingContact("countryCode", value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Mobile Number</label>
              <input
                className={`${styles.input} ${styles.bookingInput}`}
                required
                value={bookingContact.mobile}
                onChange={(event) =>
                  updateBookingContact("mobile", event.target.value)
                }
                placeholder="Mobile number (optional)"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                className={`${styles.input} ${styles.bookingInput}`}
                required
                type="email"
                value={bookingContact.email}
                onChange={(event) =>
                  updateBookingContact("email", event.target.value)
                }
                placeholder="Email (Optional)"
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Address</label>
              <input
                className={`${styles.input} ${styles.bookingInput}`}
                required
                value={bookingContact.address}
                onChange={(event) =>
                  updateBookingContact("address", event.target.value)
                }
                placeholder="Enter Address"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>State</label>
              <StateDropdown
                required
                value={bookingContact.state}
                onChange={(value) => updateBookingContact("state", value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>City</label>
              <input
                className={`${styles.input} ${styles.bookingInput}`}
                required
                value={bookingContact.city}
                onChange={(event) =>
                  updateBookingContact("city", event.target.value)
                }
                placeholder="Enter City"
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>PIN</label>
              <input
                className={`${styles.input} ${styles.bookingInput}`}
                required
                value={bookingContact.pin}
                onChange={(event) =>
                  updateBookingContact("pin", event.target.value)
                }
                placeholder="Enter PIN"
              />
            </div>
          </div>
        </div>
      </div>
    );
};

export default TravelerDetails;
