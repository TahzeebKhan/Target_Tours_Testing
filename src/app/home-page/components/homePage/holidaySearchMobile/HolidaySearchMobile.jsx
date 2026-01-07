import React, { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import DateField from '../DateField';
import PassengerClassSelector from '../PassengerClassSelector';

const HolidaySearchMobile = ({
    styles,
    from,
    setFrom,
    to,
    setTo,
    departureDate,
    setDepartureDate,
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
            <button type="button" className={styles.swapBtn}>
                <img src="/icons/leftRrighArrow.svg" alt="swap" />
            </button>
            <div className={styles.flightSearchCard}>
                <div className={styles.field}>
                    <label className={styles.label}>From CITY</label>
                    <input
                        type="text"
                        placeholder="Departure"
                        className={styles.input}
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>To CITY/COUNTRY,CATEGORY</label>
                    <input
                        type="text"
                        placeholder="Destination"
                        className={styles.input}
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                    />
                </div>

                <DateField
                    label="DEPARTURE DATE"
                    placeholder="ADD DATES"
                    value={departureDate}
                    name="departureDate"
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDepartureDate(e.target.value)}
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
                            {truncate(`${totalPassengers} Room${totalPassengers > 1 ? 's' : ''}, ${totalPassengers} Guest${totalPassengers > 1 ? 's' : ''}`, 17)}
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

export default HolidaySearchMobile;
