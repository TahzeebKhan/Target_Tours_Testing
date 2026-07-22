import React from 'react'
import styles from './CancellationRules.module.css'

const CancellationRules = () => {

    const cancellationRulesData = [
  {
    airline: {
      name: "Batik Air, Indones....",
      code: "6E- 541",
      logo: "/images/flightCompanyLogos/batikAirlines.png"
    },
    rules: [
      {
        timeFrame: "0 HOURS TO 24 HOURS*",
        fee: "ADULT : NON REFUNDABLE"
      },
      {
        timeFrame: "24 HOURS TO 365 DAYS*",
        fee: "$16,325 + $250"
      }
    ]
  },
  {
    airline: {
      name: "Indonesia AirAsia",
      code: "6E- 541",
      logo: "/images/flightCompanyLogos/indigo.png"
    },
    rules: [
      {
        timeFrame: "0 HOURS TO 24 HOURS*",
        fee: "ADULT : NON REFUNDABLE"
      },
      {
        timeFrame: "24 HOURS TO 365 DAYS*",
        fee: "$16,325 + $250"
      }
    ]
  }
];

    return (
        <div className={styles.cancellationRulesWapper}>

            {cancellationRulesData.map((item, index) => (
                <div
                    key={index}
                    className={`${styles.tabContentCancellationRules} ${styles.fadeIn}`}
                >
                    {/* Heading */}
                    <div className={styles.HeadingCont}>
                        <img src={item.airline.logo} alt={item.airline.name} />
                        <h3 className={styles.ariLineName}>
                            {item.airline.name}
                            <span className={styles.ariLineNumber}>
                                ({item.airline.code})
                            </span>
                        </h3>
                    </div>

                    {/* Table */}
                    <div className={styles.table}>
                        {/* Header */}
                        <div className={styles.tableHeader}>
                            <span>TIME FRAME</span>
                            <span>AIRLINE FEE + TARGET TOURS FEE</span>
                        </div>

                        {/* Rows */}
                        {item.rules.map((rule, i) => (
                            <div key={i} className={styles.tableRows}>
                                <span className={styles.timeFrame}>
                                    {rule.timeFrame}
                                </span>
                                <span className={styles.textRight}>
                                    {rule.fee}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

        </div>
    )
}

export default CancellationRules
