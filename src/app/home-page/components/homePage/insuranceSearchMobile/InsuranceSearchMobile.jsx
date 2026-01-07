import React, { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import DateField from '../DateField';
import PassengerClassSelector from '../PassengerClassSelector';
import TravellerSelector from '../TravellerSelector';

const InsuranceSearchMobile = ({
    styles,
    travellerDestination,
    setTravellerDestination,
    TravellerDestinationOptions,
    departureDate,
    setDepartureDate,
    returnDate,
    setReturnDate,
    travellerOpen,
    setTravellerOpen,
    totalPassengers,
    travelClass,
    setTravelClass,
    passengers,
    setPassengers,
    truncate
}) => {
    const travellerRef = useRef(null);

    return (
        <div className={styles.flightSectionMain}>
            <div className={styles.flightSearchCard}>
                <TravellerSelector
                    travellerClass={travellerDestination}
                    setTravellerClass={setTravellerDestination}
                    travellerOptions={TravellerDestinationOptions}
                    styles={styles}
                    name="TRAVEL DESTINATION"
                    enableEllipsis={false}
                />

                <DateField
                    label="TRAVEL DATE"
                    placeholder="ADD DATES"
                    value={departureDate}
                    name="TRAVELDATE"
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDepartureDate(e.target.value)}
                />

                <DateField
                    label="TRAVEL DATE"
                    placeholder="ADD DATES"
                    value={returnDate}
                    name="TRAVELDATE"
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setReturnDate(e.target.value)}
                />

                <div
                    ref={travellerRef}
                    className={`${styles.fromBtn} ${styles.fromBtn2}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setTravellerOpen((o) => !o);
                    }}
                >
                    <div className={styles.lable}>TRAVELLERS</div>
                    <div className={styles.iconCont}>
                        <div className={styles.contant}>
                            {truncate(`${totalPassengers} Traveller${totalPassengers > 1 ? 's' : ''}, ${travelClass}`, 17)}
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

export default InsuranceSearchMobile;
