/**
 * Parses XML stored in FareRuleText JSON string (e.g. Air India / 1A GDS <NewDataSet><Table1>...</Table1></NewDataSet>)
 */
export const parseXmlFareRules = (rawText) => {
  const text = String(rawText || "").trim();
  if (!text || (!text.includes("<NewDataSet>") && !text.includes("<Table1>"))) {
    return null;
  }

  try {
    if (typeof window === "undefined" || !window.DOMParser) return null;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) return null;

    const tableNodes = Array.from(xmlDoc.querySelectorAll("Table1"));
    const noteNodes = Array.from(xmlDoc.querySelectorAll("IMPORTANT_NOTE NOTE, NOTE"));

    const sections = tableNodes.map((table) => {
      const segment = table.querySelector("SEGMENT")?.textContent?.trim() || "";
      const farebasis = table.querySelector("FAREBASIS")?.textContent?.trim() || "";
      const rule = table.querySelector("RULE")?.textContent?.trim() || "FARE RULE";
      const ruleText = table.querySelector("TEXT")?.textContent?.trim() || "";
      return {
        segment,
        farebasis,
        rule,
        text: ruleText,
      };
    });

    const notes = noteNodes.map((note) => note.textContent?.trim()).filter(Boolean);

    return {
      sections,
      notes,
    };
  } catch (err) {
    console.error("Error parsing XML fare rule:", err);
    return null;
  }
};
