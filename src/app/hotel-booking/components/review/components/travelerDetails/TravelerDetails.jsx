import React, { useEffect, useRef, useState } from "react";
import styles from "./TravelerDetails.module.css";
import {
  CountryCodes,
  CountryFlagIcon,
} from "@/app/profile/components/profileSection/CountryName";

const createTraveler = () => ({
    title: "Mr",
    firstName: "Mukul",
    middleName: "Kumar",
    lastName: "Mishra",
    gender: "male",
    passengerType: "A",
    age: "",
    countryCode: "IN",
    mobile: "8532907106",
    email: "mukul.mishra@webninjaz.com",
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

            activeRooms.forEach(room => {
                if (prev[room.id]?.length) {
                    next[room.id] = prev[room.id];
                    return;
                }

                hasChanges = true;
                next[room.id] = [createTraveler()];
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

    // ➕ Add Traveler
    const addTraveler = (roomId) => {
        setRoomGuests(prev => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []), createTraveler()],
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
        {(rooms.length ? rooms : fallbackRooms).map((room) => (
          <div key={room.id}>
            <div
              className={styles.addTraveler}
              onClick={() => addTraveler(room.id)}
            >
              +Add Guest for {room.title}
            </div>

            {(roomGuests[room.id] || [createTraveler()]).map(
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
        ))}

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
