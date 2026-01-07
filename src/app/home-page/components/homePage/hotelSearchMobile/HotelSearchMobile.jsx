import React, { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import DateField from '../DateField';
import PassengerClassSelector from '../PassengerClassSelector';

const HotelSearchMobile = ({
    styles,
    to,
    setTo,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    travellerOpen,
    setTravellerOpen,
    totalPassengers,
    passengers,
    setPassengers,
    travelClass,
    setTravelClass,
    truncate
}) => {
    const travellerRef = useRef(null);

    return (
        <div className={styles.flightSectionMain}>
            <div className={styles.flightSearchCard}>
                <div className={styles.field}>
                    <label className={styles.label}>Where to</label>
                    <input
                        type="text"
                        placeholder="Departure"
                        className={styles.input}
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                    />
                </div>

                <DateField
                    label="Check in"
                    placeholder="ADD DATES"
                    value={checkIn}
                    name="departureDate"
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setCheckIn(e.target.value)}
                />
                <DateField
                    label="Check out"
                    placeholder="ADD DATES"
                    value={checkOut}
                    name="returnDate"
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setCheckOut(e.target.value)}
                />

                <div
                    ref={travellerRef}
                    className={`${styles.fromBtn} ${styles.fromBtn2}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setTravellerOpen((o) => !o);
                    }}
                >
                    <div className={styles.lable}>ROOMS & GUESTS</div>
                    <div className={styles.iconCont}>
                        <div className={styles.contant}>
                            {truncate(`${totalPassengers} Guest${totalPassengers > 1 ? 's' : ''}, ${totalPassengers} Room${totalPassengers > 1 ? 's' : ''}`, 17)}
                        </div>

                        <ChevronDown
                            className={`${styles.chevron} ${travellerOpen ? styles.openChevron : styles.closeChevron}`}
                            size={20}
                            color="#000000"
                        />
                    </div>

                    <PassengerClassSelector
                        open={travellerOpen}
                        setOpen={setTravellerOpen}
                        passengers={passengers}
                        setPassengers={setPassengers}
                        travelClass={travelClass}
                        setTravelClass={setTravelClass}
                    />
                </div>

                <button className={styles.searchBtna}>SEARCH</button>
            </div>
        </div>
    );
};

export default HotelSearchMobile;
