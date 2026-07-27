import React, { useEffect } from "react";
import styles from "./CancellationPolicyModal.module.css";
import { parseXmlFareRules } from "@/features/flights/utils/xmlFareRules";

const toArray = (value) => (Array.isArray(value) ? value : []);

const decodeEscapedHtml = (value) => {
  const text = String(value || "");
  if (!/&lt;\s*\/?\s*[a-z][\s\S]*?&gt;/i.test(text)) return text;

  return text
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&");
};

const containsHtml = (value) =>
  /<\s*\/?\s*[a-z][^>]*>/i.test(decodeEscapedHtml(value));

const sanitizeFareRuleHtml = (value) => {
  let text = decodeEscapedHtml(value);

  if (/<NewDataSet>|<Table1>|<RULE>|<TEXT>/i.test(text)) {
    text = text
      .replace(/<\/?(?:NewDataSet|Table1|IMPORTANT_NOTE)[^>]*>/gi, "")
      .replace(/<SEGMENT>(.*?)<\/SEGMENT>/gi, "<strong>Segment: $1</strong><br/>")
      .replace(/<FAREBASIS>(.*?)<\/FAREBASIS>/gi, "<strong>Fare Basis: $1</strong><br/>")
      .replace(/<RULE>(.*?)<\/RULE>/gi, "<h4 style='margin-top:12px;margin-bottom:4px;'>$1</h4>")
      .replace(/<TEXT>(.*?)<\/TEXT>/gi, "<pre style='white-space:pre-wrap;font-family:inherit;background:#f8f9fa;padding:8px;border-radius:4px;'>$1</pre>")
      .replace(/<NOTE>(.*?)<\/NOTE>/gi, "<p style='font-style:italic;color:#666;'>$1</p>");
  }

  const allowedTags = new Set([
    "p", "br", "hr", "span", "strong", "b", "em", "i", "u",
    "ul", "ol", "li", "div", "table", "thead", "tbody",
    "tr", "th", "td", "h1", "h2", "h3", "h4", "h5", "h6", "pre",
  ]);

  return text
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|form|svg|math)[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<\s*(\/?)\s*([a-z][\w-]*)\b[^>]*>/gi, (tag, closing, tagName) => {
      const normalizedTag = String(tagName).toLowerCase();
      if (!allowedTags.has(normalizedTag)) return "";
      if (closing) return `</${normalizedTag}>`;
      return `<${normalizedTag}>`;
    });
};

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

  if (typeof rules?.FareRuleText === "string" && rules.FareRuleText.trim()) {
    return [{
      route: rules?.FareRuleStock || "Fare Rules",
      fareRules: [{
        remark: "",
        rawText: rules.FareRuleText.trim(),
        groups: [],
      }],
    }];
  }

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

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

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
                  {fareRule.rawText && (() => {
                    const xmlParsed = parseXmlFareRules(fareRule.rawText);
                    if (xmlParsed && xmlParsed.sections.length > 0) {
                      return (
                        <div className={styles.xmlContainer}>
                          {xmlParsed.sections.map((sec, secIdx) => (
                            <div key={secIdx} className={styles.xmlSection}>
                              <div className={styles.xmlSectionHeader}>
                                <h4>{sec.rule}</h4>
                                {sec.segment && <span className={styles.xmlBadge}>{sec.segment}</span>}
                                {sec.farebasis && <span className={styles.xmlBadgeSecondary}>{sec.farebasis}</span>}
                              </div>
                              <pre className={styles.rawText}>{sec.text}</pre>
                            </div>
                          ))}
                          {xmlParsed.notes.map((note, noteIdx) => (
                            <div key={noteIdx} className={styles.xmlNote}>
                              <strong>Note:</strong> {note}
                            </div>
                          ))}
                        </div>
                      );
                    }

                    return containsHtml(fareRule.rawText) ? (
                      <div
                        className={styles.rawHtml}
                        dangerouslySetInnerHTML={{
                          __html: sanitizeFareRuleHtml(fareRule.rawText),
                        }}
                      />
                    ) : (
                      <pre className={styles.rawText}>{fareRule.rawText}</pre>
                    );
                  })()}
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
