"use client";

// import styles from "./CancellationPolicy.module.css";

// export default function CancellationPolicy(selected={}) {
//     return (
//         <div className={styles.wrapper}>
//             {/* Top Info */}
//             <div className={styles.topInfo}>
//                 <p className={styles.mainText}>
//                     Cancellation Possible till 23rd Apr.*
//                 </p>
//                 <p className={styles.subText}>
//                     After that Package is <strong>Non-Refundable.</strong>
//                 </p>
//             </div>

//             {/* Penalty Row */}
//             <div className={styles.penaltyContainer}>
//                 <div className={styles.penaltyRow}>
//                     <div className={styles.left}>
//                         <span className={styles.label}>Cancellation Penalty:</span>
//                     </div>
//                     <div className={styles.right}>
//                         <span className={styles.amount}>₹ 2,849</span>
//                         <span className={styles.nonRefundable}>Non-Refundable</span>
//                     </div>
//                 </div>

//                 {/* Progress Bar */}
//                 <div className={styles.progressBarContainer}>
//                     <div className={styles.leftProgress}></div>
//                     <div className={styles.progressBar}></div>
//                 </div>

//                 {/* Date Row */}
//                 <div className={styles.dateRow}>
//                     <span className={styles.label}>
//                         Cancel Between(IST):
//                     </span>
//                     <div className={styles.right}>
//                         <span className={styles.till}>Till 23 Apr 26</span>
//                         <span className={styles.time}>12 Jan <span> 04:45</span></span>
//                     </div>
//                 </div>
//             </div>

//             {/* Notes */}
//             <ul className={styles.notes}>
//                 <li>
//                     These are non-refundable amounts as per the current policy attached.
//                     In the case of component change/modifications, the policy will change
//                     accordingly.
//                 </li>
//                 <li>
//                     Please note, TCS once collected cannot be refunded in case of any
//                     cancellation / modification. You can claim the TCS amount as adjustment
//                     against Income Tax payable at the time of filing the return of income.
//                 </li>
//                 <li>
//                     Cancellation charges shown is exclusive of all taxes and taxes will be
//                     added as per applicable
//                 </li>
//             </ul>
//         </div>
//     );
// }








import { useEffect, useState } from "react";
import styles from "./CancellationPolicy.module.css";

export default function CancellationPolicy({ selectedRooms }) {
  const [roomPolicies, setRoomPolicies] = useState([]);

  useEffect(() => {
    const policies = selectedRooms?.map((room, index) => {
      // 1. Extract policies from comboRooms if present, or fallback to direct room policies
      const rawPolicies =
        room?.comboRooms?.flatMap((combo) => combo?.cancellationPolicies) ??
        room?.cancellationPolicies ??
        [];

      // 2. Filter out null/undefined entries
      const validPolicies = rawPolicies.filter(Boolean);

      return {
        // Fallback to array index if no ID exists to ensure a key
        roomId: room?.roomId || room?.id || `room-${index}`,
        isRefundable: room?.roomGroup?.isRefundable ?? false,
        cancellationPolicy:
          validPolicies.length > 0
            ? validPolicies
            : "No cancellation policy available",
      };
    });

    console.log("Extracted Room Policies:", policies);
    setRoomPolicies(policies);
  }, [selectedRooms]);

  return (
    <div className={styles.wrapper}>
      {roomPolicies.length === 0 ? (
        <div className={styles.topInfo}>
          <p className={styles.mainText}>No cancellation policy available.</p>
        </div>
      ) : (
        roomPolicies.map((room, index) => {
          const policies = Array.isArray(room.cancellationPolicy)
            ? room.cancellationPolicy
            : [];

          // Find the main refundable rule text
          const mainPolicy = policies.find((p) =>
            p.text?.toLowerCase().includes("refundable")
          )?.text;

          // Find penalty / charge rules
          const feePolicyText =
            policies.find(
              (p) =>
                p.text?.toLowerCase().includes("charge") ||
                p.text?.toLowerCase().includes("inr") ||
                p.text?.toLowerCase().includes("fee")
            )?.text || "";

          // Extract cutoff date/time dynamically (e.g., "24-07-2026 02:00 PM")
          const dateMatch = mainPolicy?.match(
            /\d{2}-\d{2}-\d{4}\s\d{2}:\d{2}\s[AP]M/i
          );
          const cutoffDate = dateMatch ? dateMatch[0] : null;

          // Extract INR penalty amount dynamically (e.g., "300")
          const amountMatch = feePolicyText.match(/INR\s*(\d+)/i);
          const penaltyAmount = amountMatch ? `₹ ${amountMatch[1]}` : null;

          return (
            <div key={room.roomId || index} className={styles.roomPolicyBlock}>
              {/* Header for multi-room bookings */}
              {roomPolicies.length > 1 && (
                <h4 style={{ marginBottom: "12px", fontWeight: "600" }}>
                  Room {index + 1} Policy
                </h4>
              )}

              {/* Dynamic Top Info */}
              <div className={styles.topInfo}>
                <p className={styles.mainText}>
                  {mainPolicy ||
                    (room.isRefundable
                      ? "Refundable Room*"
                      : "Non-Refundable Room*")}
                </p>
                {/* <p className={styles.subText}>
                  Status:{" "}
                  <strong>
                    {room.isRefundable ? "Refundable" : "Non-Refundable"}
                  </strong>
                </p> */}
              </div>

              {/* Dynamic Penalty Container */}
              <div className={styles.penaltyContainer}>
                <div className={styles.penaltyRow}>
                  <div className={styles.left}>
                    <span className={styles.label}>Cancellation Penalty:</span>
                  </div>
                  <div className={styles.right}>
                    {penaltyAmount && (
                      <span className={styles.amount}>{penaltyAmount}</span>
                    )}
                    <span className={styles.nonRefundable}>
                      {room.isRefundable
                        ? "Refundable Rules Apply"
                        : "Non-Refundable"}
                    </span>
                  </div>
                </div>

                {/* The timeline only represents a cancellable/refundable window. */}
                {room.isRefundable && (
                  <div className={styles.progressBarContainer}>
                    <div
                      className={styles.leftProgress}
                      style={{ width: "50%" }}
                    />
                    <div
                      className={styles.progressBar}
                      style={{ width: "50%" }}
                    />
                  </div>
                )}

                {/* Dynamic Date Row */}
                {cutoffDate && (
                  <div className={styles.dateRow}>
                    <span className={styles.label}>Cancel Between(IST):</span>
                    <div className={styles.right}>
                      <span className={styles.till}>Till {cutoffDate}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Notes List */}

                  {policies.length > 0 ? (
                      <ul className={styles.notes}>
                          {policies.map((policy, pIdx) => (
                              <li key={pIdx}>{policy.text}</li>
                          ))}
                      </ul>
                  ) : (
                      <ul className={styles.notes}>
                          <li>Cancellation is not allowed for this room.</li>
                      </ul>
                  )}
            </div>
          );
        })
      )}
    </div>
  );
}
