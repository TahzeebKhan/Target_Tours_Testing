import Navbar from "./Navbar";
import styles from "./FlightsLayout.module.css";
import DatePriceSlider from "./components/DatePriceSlider";
import FlightFilters from "./components/FlightsFilters";

export default function FlightsLayout({ children }) {
  return (
    <>
      {/* Top Navbar */}
      <div className={styles.wrapper}>
        <Navbar />
        <div className={styles.imageBackgound}></div>
      </div>
      {/* Page Wrapper */}
      <main className={styles.page}>
        <div className={styles.container}>
          {/* top date slider */}
          <div className={styles.dateSlider}>
            <DatePriceSlider />
          </div>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <FlightFilters />
          </aside>

          {/* Main content */}
          <section className={styles.content}>{children}</section>
        </div>
      </main>
    </>
  );
}
