import React from "react";
import styles from "./HotelPolicies.module.css";

const policies = [
    {
        title: "CHECK-IN",
        description: (
            <>
                From 15:00 to 18:00
                <br />
                You’ll need to let the property know in advance what time you’ll arrive.
            </>
        ),
    },
    {
        title: "CHECK-OUT",
        description: "From 8:00 to 11:00",
    },
    {
        title: "CANCELLATION/PREPAYMENT",
        description:
            "Cancellation and prepayment policies vary according to accommodation type. Please check what condition may apply to each option when making your selection.",
    },
    {
        title: "CHILDREN AND BEDS",
        description:
            "Child policies: children of any age are welcome. To see correct prices and occupancy information, please add the number of children in your group and their ages to your search. Cot and extra bed policies: Cots and extra beds are not available at this property.",
    },
    {
        title: "NO AGE RESTRICTION",
        description: "Guests of all ages are welcome.",
    },
    {
        title: "QUIET HOURS",
        description: "Guests must be quiet between 22:00 and 10:00.",
    },
    {
        title: "SMOKING",
        description: "Smoking not allowed.",
    },
    {
        title: "PETS",
        description: "Pets are not allowed.",
    },
];

const HotelPolicies = ({ policies: hotelPolicies = policies, hotelName = "This hotel" }) => {
    return (
        <div className={styles.container}>
            <div className={styles.topContainer}>
                <h2 className={styles.heading}>HOTEL POLICIES</h2>
                <p className={styles.subHeading}>
                    {hotelName} takes special requests – add in the next step!
                </p>
            </div>


            <div className={styles.table}>
                {hotelPolicies.map((item, index) => (
                    <div key={index} className={styles.row}>
                        <div className={styles.left}>{item.title}</div>
                        <div className={styles.right}>{item.description}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HotelPolicies;
