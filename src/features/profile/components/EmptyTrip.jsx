import Image from 'next/image';
import styles from './EmptyTrip.module.css';

const EmptyTrip = () => {
  return (
    <section className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Illustration */}
        <div className={styles.imageContainer}>
          <Image
            src="/images/empty_trip.png" 
            alt="No upcoming bookings illustration"
            width={200}
            height={200}
            className={styles.illustration}
            priority
          />
        </div>

        {/* Action Button */}
        <button className={styles.searchButton} type="button">
          START SEARCHING
        </button>

        {/* Text Content */}
        <div className={styles.textGroup}>
          <h1 className={styles.heading}>
            Looks empty, you've no upcoming bookings.
          </h1>
          <p className={styles.subtext}>
            Discover and book your next getaway now!
          </p>
        </div>
      </div>
    </section>
  );
};

export default EmptyTrip;