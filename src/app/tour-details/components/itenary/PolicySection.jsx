import React from "react";
import styles from "./PolicySection.module.css";

const FALLBACK_ITEMS = [
  "Comfortable stay for 4 nights in your preferred category Hotels",
  "Professional English speaking guide to help you explore the cities",
  "Breakfast is included as mentioned in Itinerary.",
  "Per Peron rate on twin sharing basis",
  "Entrance Tickets to Genting Indoor Theme Park",
  "All Tours & Transfers on Seat In Coach Basis",
  "Visit Bali Safari & Marine Park with Jungle Hopper Pass",
];

const FALLBACK_POLICIES = [
  {
    title: "Confirmation Policy:",
    description:
      "<p>The customer receives a confirmation voucher via email within 24 hours of successful booking.</p><p>In case the preferred slots are unavailable, an alternate schedule of the customer’s preference will be arranged and a new confirmation voucher will be sent via email. Alternatively, the customer may choose to cancel their booking before confirmation and a full refund will be processed.</p>",
  },
  {
    title: "Cancellation Policy:",
    description:
      "<ul><li><strong>10 days:</strong> 100%</li><li><strong>10 to 15 days:</strong> 75% + Non Refundable Component</li><li><strong>15 to 30 days:</strong> 30% + Non Refundable Component</li><li><strong>Hotel / Air:</strong> 100% in case of non-refundable ticket / Hotel Room</li><li><strong>Cruise / Visa:</strong> On Actuals</li></ul><p>All Prices are in Indian Rupees and subject to change without prior notice.</p>",
  },
  {
    title: "Refund Policy:",
    description:
      "<ul><li>The applicable refund amount will be processed within 10 business days.</li><li>All applicable refunds will be done in the traveler’s Thrillophilia wallet as Thrillcash.</li></ul>",
  },
];

const stripHtml = (value = "") =>
  String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

const parseListFromDescription = (items) => {
  if (!Array.isArray(items) || items.length === 0) return [];

  return [...items]
    .sort((a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0))
    .flatMap((item) => {
      const raw = String(item?.description || item?.title || "");
      const listItems = raw.match(/<li[^>]*>(.*?)<\/li>/gis);

      if (listItems?.length) {
        return listItems.map(stripHtml).filter(Boolean);
      }

      return raw
        .split(/\n+/)
        .map(stripHtml)
        .filter(Boolean);
    });
};

const getPolicies = (data) => {
  const policies = Array.isArray(data?.trip_policies)
    ? [...data.trip_policies]
        .filter((policy) => policy?.enabled !== false)
        .sort((a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0))
    : [];

  return policies.length
    ? policies.map((policy) => ({
        title: policy?.title || "Policy:",
        description: policy?.description || "<p>No description available.</p>",
      }))
    : FALLBACK_POLICIES;
};

const toMediaUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}${path}`;
};

const getPolicyImage = (data) =>
  toMediaUrl(
    data?.policy_image?.formats?.large?.url ||
      data?.policy_image?.url ||
      data?.overview_image?.formats?.large?.url ||
      data?.overview_image?.url ||
      data?.main_image?.formats?.large?.url ||
      data?.main_image?.url,
  ) || "/tourBooking/glacier.jpg";

const PolicyList = ({ icon, items, title }) => (
  <div>
    <h3 className={styles.listTitle}>{title}</h3>
    {items.length ? (
      <ul className={styles.itemList}>
        {items.map((item, index) => (
          <li className={styles.item} key={`${title}-${item}-${index}`}>
            <img className={styles.icon} src={icon} alt="" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className={styles.empty}>No {title.toLowerCase()} available.</p>
    )}
  </div>
);

const PolicySection = ({ data }) => {
  const inclusions = parseListFromDescription(data?.inclusions);
  const exclusions = parseListFromDescription(data?.exclusions);
  const inclusionItems = inclusions.length ? inclusions : FALLBACK_ITEMS;
  const exclusionItems = exclusions.length ? exclusions : FALLBACK_ITEMS;
  const policies = getPolicies(data);

  return (
    <section className={styles.section} id="inclusions">
      <div className={styles.container}>
        <header>
          <h2 className={styles.heading}>
            Comprehensive Journey Inclusions and Exclusion
          </h2>
          <p className={styles.subheading}>
            Toggle specific days to read granular guides and highlight
            accommodation details
          </p>
        </header>

        <div className={styles.listGrid}>
          <PolicyList
            icon="/images/greenCheack.svg"
            items={inclusionItems}
            title="Inclusion"
          />
          <PolicyList
            icon="/images/redCross.svg"
            items={exclusionItems}
            title="Exclusion"
          />
        </div>

        <div className={styles.policyGrid} id="tour-policy">
          <div>
            <h2 className={styles.policyTitle}>Tour Policy</h2>
            <div className={styles.policyBlocks}>
              {policies.map((policy, index) => (
                <article
                  className={styles.policyBlock}
                  key={`${policy.title}-${index}`}
                >
                  <h3>{policy.title}</h3>
                  <div
                    className={styles.policyText}
                    dangerouslySetInnerHTML={{ __html: policy.description }}
                  />
                </article>
              ))}
            </div>
          </div>

          <div className={styles.imageWrap}>
            <img
              className={styles.policyImage}
              src={getPolicyImage(data)}
              alt={data?.title ? `${data.title} policy` : "Tour policy"}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PolicySection;
