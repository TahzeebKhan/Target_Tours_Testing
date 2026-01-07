"use client"
import React, { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import DateField from '../DateField';
import PassengerClassSelector from '../PassengerClassSelector';
import FromLocationSheet from '@/app/components/fromLocationSheet/FromLocationSheet';

const FlightSearchMobile = ({
    styles,
    swapLocations,
    from,
    setFrom,
    to,
    setTo,
    departureDate,
    setDepartureDate,
    returnDate,
    setReturenDate,
    travellerOpen,
    setTravellerOpen,
    totalPassengers,
    travelClass,
    setTravelClass,
    passengers,
    setPassengers,
    truncate
}) => {
    const [openTo, setOpenTo] = useState(false);
    const [openFrom, setOpenFrom] = useState(false);
    const travellerRef = useRef(null);
    const [tripType, setTripType] = useState("round");
    const handleTripTypeChange = (type) => {
        setTripType(type);
    }
    return (
        <div className={styles.flightSectionMain}>

            <button type="button" className={styles.swapBtn} onClick={swapLocations}>
                <img src="/icons/leftRrighArrow.svg" alt="swap" />
            </button>
            <div className={styles.flightSearchCard}>
                <div className={styles.serarchingContTop_left}>
                    <button
                        className={`${styles.round_tripBtnMbl} ${tripType === "round" ? styles.activeTrip : ""}`}
                        onClick={() => handleTripTypeChange("round")}
                    >
                        Round-trip
                    </button>

                    <button
                        className={`${styles.round_tripBtnMbl} ${tripType === "oneway" ? styles.activeTrip : ""}`}
                        onClick={() => handleTripTypeChange("oneway")}
                    >
                        One-way
                    </button>

                    <button
                        className={`${styles.round_tripBtnMbl} ${tripType === "multi" ? styles.activeTrip : ""}`}
                        onClick={() => handleTripTypeChange("multi")}
                    >
                        Multi-City
                    </button>
                </div>
                {tripType === "round" && (
                    <>
                        <div className={styles.fromToCont}>
                            <div className={styles.field} onClick={() => setOpenFrom(true)}>
                                <label className={styles.label}>FROM</label>
                                <input
                                    type="text"
                                    placeholder="Departure"
                                    className={styles.input}
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                />

                            </div>
                            {openFrom && (
                                <FromLocationSheet onClose={() => setOpenFrom(false)} inputType="from" onSelectCity={(value) => setFrom(value)}  />
                            )}

                            <div className={`${styles.field} ${styles.field2}`} onClick={() => setOpenTo(true)}>
                                <label className={styles.label}>TO</label>
                                <input
                                    type="text"
                                    placeholder="Destination"
                                    className={styles.input}
                                    value={to}
                                    readOnly
                                    onChange={(e) => setTo(e.target.value)}
                                />
                            </div>
                            {openTo && (
                                <FromLocationSheet onClose={() => setOpenTo(false)} inputType="to" onSelectCity={(value) => setTo(value)} />
                            )}

                        </div>
                        <div className={styles.fromToCont}>
                            <DateField
                                label="DEPARTURE DATE"
                                placeholder="ADD DATES"
                                value={departureDate}
                                name="departureDate"
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setDepartureDate(e.target.value)}
                            />
                            <DateField
                                label="RETURN DATE"
                                placeholder="ADD DATES"
                                value={returnDate}
                                name="departureDate"
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setReturenDate(e.target.value)}
                            />
                        </div>

                        <div
                            ref={travellerRef}
                            className={`${styles.fromBtn} ${styles.fromBtn2}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setTravellerOpen((o) => !o);
                            }}
                        >
                            <div className={styles.lable}>Passengers</div>
                            <div className={styles.iconCont}>
                                <div className={styles.contant}>
                                    {truncate(`${totalPassengers} adult${totalPassengers > 1 ? 's' : ''} ${totalPassengers} child${totalPassengers > 1 ? 's' : ''}`, 17)}
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

                        <div
                            ref={travellerRef}
                            className={`${styles.fromBtn} ${styles.fromBtn2}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setTravellerOpen((o) => !o);
                            }}
                        >
                            <div className={styles.lable}>Seat Class</div>
                            <div className={styles.iconCont}>
                                <div className={styles.contant}>
                                    {truncate(`${travelClass}`, 17)}
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
                    </>
                )}
                {tripType === "oneway" && (
                    <>
                        <div className={styles.fromToCont}>
                            <div className={styles.field}>
                                <label className={styles.label}>FROM</label>
                                <input
                                    type="text"
                                    placeholder="Departure"
                                    className={styles.input}
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                />
                            </div>

                            <div className={`${styles.field} ${styles.field2}`}>
                                <label className={styles.label}>TO</label>
                                <input
                                    type="text"
                                    placeholder="Destination"
                                    className={styles.input}
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className={styles.fromToCont}>
                            <DateField
                                label="DEPARTURE DATE"
                                placeholder="ADD DATES"
                                value={departureDate}
                                name="departureDate"
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setDepartureDate(e.target.value)}
                            />
                        </div>

                        <div
                            ref={travellerRef}
                            className={`${styles.fromBtn} ${styles.fromBtn2}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setTravellerOpen((o) => !o);
                            }}
                        >
                            <div className={styles.lable}>Passengers</div>
                            <div className={styles.iconCont}>
                                <div className={styles.contant}>
                                    {truncate(`${totalPassengers} adult${totalPassengers > 1 ? 's' : ''} ${totalPassengers} child${totalPassengers > 1 ? 's' : ''}`, 17)}
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

                        <div
                            ref={travellerRef}
                            className={`${styles.fromBtn} ${styles.fromBtn2}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setTravellerOpen((o) => !o);
                            }}
                        >
                            <div className={styles.lable}>Seat Class</div>
                            <div className={styles.iconCont}>
                                <div className={styles.contant}>
                                    {truncate(`${travelClass}`, 17)}
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
                    </>
                )}
            </div>
        </div>
    );
};

export default FlightSearchMobile;
