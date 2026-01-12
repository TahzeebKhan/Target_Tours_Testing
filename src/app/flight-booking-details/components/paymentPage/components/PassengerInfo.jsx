import styles from "./PassengerInfo.module.css";

const passengers = [
  {
    name: "MS PRACHI MEHTA (ADULT)",
    gender: "FEMALE",
    email: "ABC@GMAIL.COM",
    contact: "+91 7875434345",
  },
  {
    name: "MRS ARUN KUMAR (CHILD)",
    gender: "FEMALE",
    email: "ABC@GMAIL.COM",
    contact: "+91 7875434345",
  },
  {
    name: "MS VIKAS MEHTA (INFANT)",
    gender: "FEMALE",
    email: "RYTC@GMAIL.COM",
    contact: "+91 7875434345",
  },
  {
    name: "MS PRACHI MEHTA (ADULT)",
    gender: "FEMALE",
    email: "ABC@GMAIL.COM",
    contact: "+91 7875434345",
  },
];
const passengers2 = [
  {
    name: "MS PRACHI MEHTA",
    email: "ABC@GMAIL.COM",
    phone: "+91 7875434345",
    type: "Adult",
    gender: "Male",
  },
  {
    name: "MRS ARUN KUMAR (CHILD)",
    email: "ABC@GMAIL.COM",
    phone: "+91 7875434345",
    type: "Child",
    gender: "Male",
  },
  {
    name: "MRS ARUN KUMAR (CHILD)",
    email: "ABC@GMAIL.COM",
    phone: "+91 7875434345",
    type: "Child",
    gender: "Male",
  },
];

const PassengerInfo = () => {
  return (
    <>
      <div className={styles.wrapper}>
        {/* TABLE */}
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.header}`}>
            <span>NAME</span>
            <span>GENDER</span>
            <span>EMAIL</span>
            <span>CONTACT NUMBER</span>
          </div>

          {passengers.map((p, index) => (
            <div key={index} className={styles.row}>
              <span>{p.name}</span>
              <span>{p.gender}</span>
              <span>{p.email}</span>
              <span>{p.contact}</span>
            </div>
          ))}
        </div>

        {/* FOOTER INFO */}
        <div className={styles.footer}>
          <span className={styles.footerLabel}>
            Booking details will be sent to
          </span>

          <div className={styles.footerRight}>
            <span className={styles.primary}>
              Prachi Kumari (primary), +4 Traveller
            </span>
            <span className={styles.secondary}>
              prachi1605@gmail.com, +91 78795465384
            </span>
          </div>
        </div>
      </div>
      <div className={styles.wrapperMobile}>
        {passengers2.map((passenger, index) => (
          <>
            {" "}
            <div
              key={index}
              className={`${styles.passengerItemMobile} ${
                index !== passengers.length - 1 ? styles.withBorderMobile : ""
              }`}
            >
              <div className={styles.leftMobile}>
                <p className={styles.nameMobile}>{passenger.name}</p>
                <p className={styles.metaMobile}>
                  {passenger.type}
                  <span className={styles.dotMobile}></span>
                  {passenger.gender}
                </p>
              </div>

              <div className={styles.rightMobile}>
                <p className={styles.emailMobile}>{passenger.email}</p>
                <p className={styles.phoneMobile}>{passenger.phone}</p>
              </div>
            </div>
            {index !== passengers2.length - 1 && (
              <div className={styles.dashedBorder} />
            )}
          </>
        ))}
      </div>
    </>
  );
};

export default PassengerInfo;
