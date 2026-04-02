import styles from "./RecentSearch.module.css";

export default function RecentSearch({ onSelect }) {
    const recentSearchData = {
        recentSearch: {
            title: "RECENT SEARCH",
            location: "BARCELONA, SPAIN",
            details: "Jul 14 - 18 , 2 Guests",
        },
        popular: {
            title: "POPULAR",
            locations: [
                "CHENNAI, INDIA",
                "MUMBAI, INDIA",
                "KOLKATA, INDIA",
                "LISBON, PORTUGAL",
                "CHENNAI, INDIA",
                "MUMBAI, INDIA",
                "KOLKATA, INDIA",
                "LISBON, PORTUGAL",
            ],
        },
    };

    const { recentSearch, popular } = recentSearchData;

    return (
        <div className={styles.wrapper}>
            <div className={styles.inner}>
                <p className={styles.sectionTitle}>{recentSearch.title}</p>
                {/* RECENT SEARCH */}
                <div className={styles.section}>
                    <div
                        className={styles.recentItem}
                        onClick={() => onSelect?.(recentSearch.location)}
                    >
                        <h3>{recentSearch.location}</h3>
                        <p>{recentSearch.details}</p>
                    </div>
                </div>

                <p className={styles.sectionTitle}>{popular.title}</p>

                {/* POPULAR */}
                <div className={styles.section}>


                    <ul className={styles.list}>
                        {popular.locations.map((city, index) => (
                            <li key={index} onClick={(e) => {
                                e.stopPropagation();        // 🔥 IMPORTANT
                                onSelect?.(city);
                            }}>
                                {city}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
