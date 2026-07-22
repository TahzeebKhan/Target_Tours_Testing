import React from "react";
import styles from "./CancellationPolicyModal.module.css";

const toArray = (value) => (Array.isArray(value) ? value : []);

const formatAmount = (value, currency = "INR") => {
  const text = String(value ?? "").trim();
  const amount = Number(text.replace(/[^\d.]/g, ""));
  if (text && Number.isFinite(amount)) {
    const symbol = String(currency || "INR").toUpperCase() === "INR" ? "₹" : currency;
    return `${symbol} ${amount.toLocaleString("en-IN")}`;
  }
  return text || "—";
};

const getRoutePolicies = (fareRulesData) => {
  const rules = fareRulesData?.data?.rules;
  if (!rules || typeof rules !== "object" || Array.isArray(rules)) return [];

  return Object.entries(rules).map(([route, fareRules]) => ({
    route,
    fareRules: toArray(fareRules).map((fareRule) => ({
      remark: fareRule?.FareRuleRemarks || "",
      groups: toArray(fareRule?.Rule).map((group) => ({
        head: group?.Head || "Fare Rule",
        rows: toArray(group?.Info).map((info) => ({
          description: info?.Description || "—",
          adult: formatAmount(info?.AdultAmount, info?.CurrencyCode),
          child: formatAmount(info?.ChildAmount, info?.CurrencyCode),
          infant: formatAmount(info?.InfantAmount, info?.CurrencyCode),
        })),
      })),
    })),
  }));
};

const CancellationPolicyModal = ({ fareRulesData, onClose }) => {
  const policies = getRoutePolicies(fareRulesData);

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancellation-policy-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <h2 id="cancellation-policy-title">Cancellation & Date Change Policy</h2>
            <p>Complete airline fare rules for every flight in your journey.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close policy modal">
            ×
          </button>
        </div>

        <div className={styles.content}>
          {policies.length ? policies.map((policy) => (
            <section className={styles.routeCard} key={policy.route}>
              <h3>{policy.route}</h3>
              {policy.fareRules.map((fareRule, fareIndex) => (
                <div key={`${policy.route}-${fareIndex}`}>
                  {fareRule.remark && <p className={styles.remark}>{fareRule.remark}</p>}
                  {fareRule.groups.map((group, groupIndex) => (
                    <div className={styles.ruleGroup} key={`${group.head}-${groupIndex}`}>
                      <h4>{group.head}</h4>
                      <div className={styles.tableHeader}>
                        <span>Time Frame</span>
                        <span>Adult</span>
                        <span>Child</span>
                        <span>Infant</span>
                      </div>
                      {group.rows.map((row, rowIndex) => (
                        <div className={styles.tableRow} key={`${row.description}-${rowIndex}`}>
                          <span>{row.description}</span>
                          <span>{row.adult}</span>
                          <span>{row.child}</span>
                          <span>{row.infant}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </section>
          )) : (
            <div className={styles.empty}>Policy details are not available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CancellationPolicyModal;
