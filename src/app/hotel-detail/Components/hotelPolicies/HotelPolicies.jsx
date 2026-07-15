import React, { useState } from "react";
import styles from "./HotelPolicies.module.css";
import { useBodyScrollLock } from "@/shared/hooks/useBodyScrollLock";

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

const sanitizeHtml = (value = "") =>
    String(value)
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/\son\w+="[^"]*"/gi, "")
        .replace(/\son\w+='[^']*'/gi, "")
        .replace(/javascript:/gi, "");

const hasHtml = (value = "") => /<\/?[a-z][\s\S]*>/i.test(String(value));

const PolicyDescription = ({ description }) => {
    if (React.isValidElement(description)) return description;

    const text = String(description || "");

    if (hasHtml(text)) {
        return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }} />;
    }

    return text.split(/\n+/).map((line, index) => (
        <React.Fragment key={index}>
            {index > 0 && <br />}
            {line}
        </React.Fragment>
    ));
};

const getPlainPolicyText = (description) => {
    if (React.isValidElement(description)) return "";

    return String(description || "");
};

const toTextList = (value) => {
    if (!value) return [];
    return (Array.isArray(value) ? value : [value])
        .map((item) => String(item || "").trim())
        .filter(Boolean);
};

const getInstructionModalData = (description) => {
    if (description && typeof description === "object" && !React.isValidElement(description)) {
        return {
            instructions: toTextList(description.instructions),
            specialInstructions: toTextList(description.specialInstructions),
        };
    }

    return {
        instructions: [],
        specialInstructions: toTextList(getPlainPolicyText(description)),
    };
};

const InstructionSection = ({ title, items }) => {
    if (!items.length) return null;

    return (
        <section className={styles.instructionSection}>
            <h4>{title}</h4>
            <div className={styles.instructionList}>
                {items.map((item, index) => (
                    <PolicyDescription key={index} description={item} />
                ))}
            </div>
        </section>
    );
};

const HotelPolicies = ({ policies: hotelPolicies = policies, hotelName = "This hotel" }) => {
    const [instructionModalData, setInstructionModalData] = useState(null);
    const isInstructionsOpen = Boolean(instructionModalData);
    useBodyScrollLock(isInstructionsOpen);
    const specialInstructionsRow = hotelPolicies.find(
        (item) => String(item.title || "").toUpperCase() === "SPECIAL INSTRUCTIONS",
    );
    const visiblePolicies = hotelPolicies.filter(
        (item) => String(item.title || "").toUpperCase() !== "SPECIAL INSTRUCTIONS",
    );

    return (
        <div className={styles.container}>
            <div className={styles.topContainer}>
                <h2 className={styles.heading}>HOTEL POLICIES</h2>
                <p className={styles.subHeading}>
                    {hotelName} takes special requests – add in the next step!
                </p>
            </div>


            <div className={styles.table}>
                {visiblePolicies.map((item, index) => {
                    const isCheckIn = String(item.title || "").toUpperCase() === "CHECK-IN";

                    return (
                        <div key={index} className={styles.row}>
                            <div className={styles.left}>{item.title}</div>
                            <div className={styles.right}>
                                <PolicyDescription description={item.description} />
                                {isCheckIn && specialInstructionsRow?.description && (
                                    <button
                                        type="button"
                                        className={styles.viewBtn}
                                        onClick={() =>
                                            setInstructionModalData(
                                                getInstructionModalData(specialInstructionsRow.description),
                                            )
                                        }
                                    >
                                        View instructions
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {isInstructionsOpen && (
                <div
                    className={styles.modalOverlay}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Check-in instructions"
                    onClick={() => setInstructionModalData(null)}
                >
                    <div
                        className={styles.modal}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3>Check-in Instructions</h3>
                            <button
                                type="button"
                                className={styles.closeBtn}
                                aria-label="Close check-in instructions"
                                onClick={() => setInstructionModalData(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <InstructionSection
                                title="Instructions"
                                items={instructionModalData?.instructions || []}
                            />
                            <InstructionSection
                                title="Special Instructions"
                                items={instructionModalData?.specialInstructions || []}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelPolicies;
