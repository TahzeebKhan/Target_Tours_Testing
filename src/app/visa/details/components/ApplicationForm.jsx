"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./applicationForm.module.css";

const sections = [
  { id: "personal", title: "Personal Details" },
  { id: "passport", title: "Passport Details" },
  { id: "travel", title: "Travel Details" },
  { id: "purpose", title: "Purpose Of Travel" },
];

const initialData = {
  givenNames: "",
  lastName: "",
  dob: "",
  gender: "",
  placeOfBirth: "",
  nationality: "",
  email: "",
  phone: "",
  passportNumber: "",
  issueDate: "",
  expiryDate: "",
  placeOfIssue: "",
  passportFile: null,
  passportFileName: "",
  destinationCountry: "Vietnam",
  visaClassification: "Tourist Visa",
  arrivalDate: "",
  departureDate: "",
  portOfEntry: "",
  visitedBefore: false,
  primaryPurpose: "",
  stayLimit: "",
  itinerary: "",
};

const ApplicationForm = () => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState("personal");
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef(null);
  const sectionRefs = useRef({
    personal: null,
    passport: null,
    travel: null,
    purpose: null,
  });

  const setSectionRef = useCallback(
    (sectionId) => (element) => {
      sectionRefs.current[sectionId] = element;
    },
    [],
  );

  const scrollToSection = useCallback((sectionId) => {
    const section = sectionRefs.current[sectionId];
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionId);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const offset = 140;
      const sectionPositions = sections
        .map((section) => {
          const el = sectionRefs.current[section.id];
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return { id: section.id, top: rect.top, bottom: rect.bottom };
        })
        .filter(Boolean);

      let currentSection = sectionPositions.length
        ? sectionPositions[0].id
        : activeSection;
      const visibleSection = sectionPositions.find(
        (item) => item.top <= offset && item.bottom > offset,
      );

      if (visibleSection) {
        currentSection = visibleSection.id;
      } else {
        const nextSection = sectionPositions.find((item) => item.top > offset);
        if (nextSection) {
          currentSection = nextSection.id;
        } else if (sectionPositions.length) {
          currentSection = sectionPositions[sectionPositions.length - 1].id;
        }
      }

      if (currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection]);

  const sectionByField = useMemo(
    () => ({
      givenNames: "personal",
      lastName: "personal",
      dob: "personal",
      gender: "personal",
      placeOfBirth: "personal",
      nationality: "personal",
      email: "personal",
      phone: "personal",
      passportNumber: "passport",
      issueDate: "passport",
      expiryDate: "passport",
      placeOfIssue: "passport",
      passportFile: "passport",
      destinationCountry: "travel",
      visaClassification: "travel",
      arrivalDate: "travel",
      departureDate: "travel",
      portOfEntry: "travel",
      visitedBefore: "travel",
      primaryPurpose: "purpose",
      stayLimit: "purpose",
      itinerary: "purpose",
    }),
    [],
  );

  const validateForm = useCallback(() => {
    const newErrors = {};

    const requiredFields = [
      "givenNames",
      "lastName",
      "dob",
      "gender",
      "placeOfBirth",
      "nationality",
      "email",
      "phone",
      "passportNumber",
      "issueDate",
      "expiryDate",
      "placeOfIssue",
      "passportFile",
      "destinationCountry",
      "visaClassification",
      "arrivalDate",
      "departureDate",
      "portOfEntry",
      "primaryPurpose",
      "stayLimit",
      "itinerary",
    ];

    requiredFields.forEach((field) => {
      const value = formData[field];
      if (field === "passportFile") {
        if (!value) {
          newErrors[field] = "Please upload your passport file.";
        }
        return;
      }
      if (typeof value === "string" && !value.trim()) {
        newErrors[field] = "This field is required.";
      }
    });

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (formData.phone && !/^\+?[0-9\s\-]{7,20}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid phone number.";
    }

    if (formData.arrivalDate && formData.departureDate) {
      const arrival = new Date(formData.arrivalDate);
      const departure = new Date(formData.departureDate);
      if (arrival >= departure) {
        newErrors.arrivalDate =
          "Arrival date must be earlier than departure date.";
        newErrors.departureDate = "Departure date must be after arrival date.";
      }
    }

    return newErrors;
  }, [formData]);

  const handleChange = useCallback(
    (field) => (event) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        if (!prev[field]) {
          return prev;
        }
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    },
    [],
  );

  const handleSectionFocus = useCallback(
    (sectionId) => () => {
      setActiveSection(sectionId);
    },
    [],
  );

  const handleFileClick = useCallback(() => {
    fileInputRef.current?.click();
    setActiveSection("passport");
  }, []);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      passportFile: file,
      passportFileName: file.name,
    }));
    setErrors((prev) => {
      if (!prev.passportFile) {
        return prev;
      }
      const updated = { ...prev };
      delete updated.passportFile;
      return updated;
    });
    event.target.value = "";
  }, []);

  const handleBackToForm = useCallback(() => {
    setActiveSection("personal");
    setStatusMessage("");
  }, []);

  const handleContinue = useCallback(() => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstField = Object.keys(validationErrors)[0];
      const nextSection = sectionByField[firstField] || "personal";
      setActiveSection(nextSection);
      setStatusMessage(
        "Please correct the highlighted fields before continuing.",
      );
      return;
    }
    setStatusMessage("All fields are valid. You can continue to documents.");
  }, [sectionByField, validateForm]);

  const currentStepIndex = useMemo(
    () => sections.findIndex((section) => section.id === activeSection),
    [activeSection],
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.formLayout}>
          <div className={styles.mainCard}>
            <header className={styles.header}>
              <div className={styles.countryRow}>
                <span className={styles.flag} aria-hidden="true">
                  <img src="/icons/vietnamFlag.svg" alt="Country Flag" />
                </span>
                <span className={styles.countryLabel}>Vietnam</span>
              </div>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>Application Form</h1>
                <div>
                  <div className={styles.autosaved}>Autosaved</div>
                  <p className={styles.description}>
                    All fields marked with * are required
                  </p>
                </div>
              </div>
            </header>

            <section
              id="personal"
              ref={setSectionRef("personal")}
              data-section-id="personal"
              className={styles.planCard}
            >
              <div className={styles.sectionHeader}>
                <span className={styles.stepLabel}>STEP 1 OF 4</span>
                <h2 className={styles.sectionTitle}>Personal Information</h2>
                <p className={styles.sectionText}>Your name and contact.</p>
              </div>
              <div className={styles.fieldGroupRow}>
                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>
                      Given names (as in passport)
                    </span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBox}>
                    <input
                      className={styles.input}
                      type="text"
                      value={formData.givenNames}
                      onChange={handleChange("givenNames")}
                      placeholder="e.g. John"
                    />
                  </div>
                  {errors.givenNames && (
                    <p className={styles.fieldError}>{errors.givenNames}</p>
                  )}
                </div>

                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>Last Name</span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBox}>
                    <input
                      className={styles.input}
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange("lastName")}
                      placeholder="e.g. Doe"
                    />
                  </div>
                  {errors.lastName && (
                    <p className={styles.fieldError}>{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className={styles.fieldGroupRow}>
                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>Date of Birth</span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBox}>
                    <input
                      className={styles.input}
                      type="date"
                      value={formData.dob}
                      onChange={handleChange("dob")}
                    />
                  </div>
                  {errors.dob && (
                    <p className={styles.fieldError}>{errors.dob}</p>
                  )}
                </div>

                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>Gender</span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBox}>
                    <select
                      className={styles.input}
                      value={formData.gender}
                      onChange={handleChange("gender")}
                    >
                      <option value="">Select</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {errors.gender && (
                    <p className={styles.fieldError}>{errors.gender}</p>
                  )}
                </div>
              </div>

              <div className={styles.fieldGroupRow}>
                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>Place Of Birth</span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBox}>
                    <input
                      className={styles.input}
                      type="text"
                      value={formData.placeOfBirth}
                      onChange={handleChange("placeOfBirth")}
                      placeholder="e.g New York"
                    />
                  </div>
                  {errors.placeOfBirth && (
                    <p className={styles.fieldError}>{errors.placeOfBirth}</p>
                  )}
                </div>

                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>Nationality</span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBox}>
                    <select
                      className={styles.input}
                      value={formData.nationality}
                      onChange={handleChange("nationality")}
                    >
                      <option value="">Select your country</option>
                      <option value="Vietnam">Vietnam</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                  {errors.nationality && (
                    <p className={styles.fieldError}>{errors.nationality}</p>
                  )}
                </div>
              </div>

              <div className={styles.fieldGroupRow}>
                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>Email Address</span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBox}>
                    <input
                      className={styles.input}
                      type="email"
                      value={formData.email}
                      onChange={handleChange("email")}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className={styles.fieldError}>{errors.email}</p>
                  )}
                </div>

                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>Phone Number</span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBox}>
                    <input
                      className={styles.input}
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange("phone")}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  {errors.phone && (
                    <p className={styles.fieldError}>{errors.phone}</p>
                  )}
                </div>
              </div>
            </section>

            <section
              ref={setSectionRef("passport")}
              data-section-id="passport"
              className={styles.planCard}
            >
              <div className={styles.sectionHeader}>
                <span className={styles.stepLabel}>STEP 2 OF 4</span>
                <h2 className={styles.sectionTitle}>Passport Details</h2>
                <p className={styles.sectionText}>
                  From your current passport.
                </p>
              </div>
              <div className={styles.uploadArea} onClick={handleFileClick}>
                <div className={styles.uploadIconBox}>
                  <span className={styles.uploadIcon} />
                </div>
                <div className={styles.uploadTextArea}>
                  <p className={styles.uploadHeading}>
                    Drag &amp; drop your passport here
                  </p>
                  <p className={styles.uploadSubheading}>
                    JPG, PNG or PDF · Max 5MB
                  </p>
                </div>
                <button
                  className={styles.chooseButton}
                  type="button"
                  onClick={handleFileClick}
                >
                  Choose File
                </button>
                {formData.passportFileName ? (
                  <div className={styles.fileNameDisplay}>
                    {formData.passportFileName}
                  </div>
                ) : null}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                className={styles.fileInput}
                onChange={handleFileChange}
              />
              {errors.passportFile && (
                <p className={styles.fieldError}>{errors.passportFile}</p>
              )}

              <div className={styles.fieldGroupRow}>
                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>Passport Number</span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBox}>
                    <input
                      className={styles.input}
                      type="text"
                      value={formData.passportNumber}
                      onChange={handleChange("passportNumber")}
                      placeholder="e.g. L87654321"
                    />
                  </div>
                  {errors.passportNumber && (
                    <p className={styles.fieldError}>{errors.passportNumber}</p>
                  )}
                </div>

                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>Issue Date</span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBox}>
                    <input
                      className={styles.input}
                      type="date"
                      value={formData.issueDate}
                      onChange={handleChange("issueDate")}
                    />
                  </div>
                  {errors.issueDate && (
                    <p className={styles.fieldError}>{errors.issueDate}</p>
                  )}
                </div>
              </div>

              <div className={styles.fieldGroupRow}>
                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>Expiry Date</span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBox}>
                    <input
                      className={styles.input}
                      type="date"
                      value={formData.expiryDate}
                      onChange={handleChange("expiryDate")}
                    />
                  </div>
                  {errors.expiryDate && (
                    <p className={styles.fieldError}>{errors.expiryDate}</p>
                  )}
                </div>

                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>Place of Issue</span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBox}>
                    <input
                      className={styles.input}
                      type="text"
                      value={formData.placeOfIssue}
                      onChange={handleChange("placeOfIssue")}
                      placeholder="e.g New York"
                    />
                  </div>
                  {errors.placeOfIssue && (
                    <p className={styles.fieldError}>{errors.placeOfIssue}</p>
                  )}
                </div>
              </div>
            </section>

            <section
              ref={setSectionRef("travel")}
              data-section-id="travel"
              className={styles.planCard}
            >
              <div className={styles.sectionHeader}>
                <span className={styles.stepLabel}>STEP 3 OF 4</span>
                <h2 className={styles.sectionTitle}>Travel Details</h2>
                <p className={styles.sectionText}>Dates and route.</p>
              </div>
              <div className={styles.fieldGroupRow}>
                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>
                      Destination Country
                    </span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBoxSecondary}>
                    <span className={styles.selectText}>
                      {formData.destinationCountry}
                    </span>
                  </div>
                  {errors.destinationCountry && (
                    <p className={styles.fieldError}>
                      {errors.destinationCountry}
                    </p>
                  )}
                </div>

                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>
                      Visa Classification
                    </span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBoxSecondary}>
                    <span className={styles.selectText}>
                      {formData.visaClassification}
                    </span>
                  </div>
                  {errors.visaClassification && (
                    <p className={styles.fieldError}>
                      {errors.visaClassification}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.fieldGroupRow}>
                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>
                      Intended Arrival Date
                    </span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBox}>
                    <input
                      className={styles.input}
                      type="date"
                      value={formData.arrivalDate}
                      onChange={handleChange("arrivalDate")}
                    />
                  </div>
                  {errors.arrivalDate && (
                    <p className={styles.fieldError}>{errors.arrivalDate}</p>
                  )}
                </div>

                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>
                      Intended Departure Date
                    </span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBox}>
                    <input
                      className={styles.input}
                      type="date"
                      value={formData.departureDate}
                      onChange={handleChange("departureDate")}
                    />
                  </div>
                  {errors.departureDate && (
                    <p className={styles.fieldError}>{errors.departureDate}</p>
                  )}
                </div>
              </div>

              <div className={styles.fieldGroupRow}>
                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>Port Of Entry</span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBox}>
                    <select
                      className={styles.input}
                      value={formData.portOfEntry}
                      onChange={handleChange("portOfEntry")}
                    >
                      <option value="">Select Airport</option>
                      <option value="Noi Bai">Noi Bai</option>
                      <option value="Tan Son Nhat">Tan Son Nhat</option>
                      <option value="Da Nang">Da Nang</option>
                    </select>
                  </div>
                  {errors.portOfEntry && (
                    <p className={styles.fieldError}>{errors.portOfEntry}</p>
                  )}
                </div>

                <div className={styles.visitedToggleColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>
                      Previously visited this country?
                    </span>
                  </div>
                  <label className={styles.toggleTrack}>
                    <input
                      type="checkbox"
                      className={styles.toggleInput}
                      checked={formData.visitedBefore}
                      onChange={handleChange("visitedBefore")}
                    />
                    <span className={styles.toggleThumb} />
                  </label>
                </div>
              </div>
            </section>

            <section
              ref={setSectionRef("purpose")}
              data-section-id="purpose"
              className={styles.planCard}
            >
              <div className={styles.sectionHeader}>
                <span className={styles.stepLabel}>STEP 4 OF 4</span>
                <h2 className={styles.sectionTitle}>Purpose Of Travel</h2>
                <p className={styles.sectionText}>Why you’re travelling.</p>
              </div>
              <div className={styles.fieldGroupRow}>
                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>
                      Primary Travel Purpose
                    </span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBox}>
                    <select
                      className={styles.input}
                      value={formData.primaryPurpose}
                      onChange={handleChange("primaryPurpose")}
                    >
                      <option value="">Select</option>
                      <option value="Tourism">Tourism</option>
                      <option value="Business">Business</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                  {errors.primaryPurpose && (
                    <p className={styles.fieldError}>{errors.primaryPurpose}</p>
                  )}
                </div>

                <div className={styles.fieldColumn}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldTitle}>
                      Stay Limit Duration
                    </span>
                    <span className={styles.required}>*</span>
                  </div>
                  <div className={styles.inputBox}>
                    <input
                      className={styles.input}
                      type="text"
                      value={formData.stayLimit}
                      onChange={handleChange("stayLimit")}
                      placeholder="e.g New York"
                    />
                  </div>
                  {errors.stayLimit && (
                    <p className={styles.fieldError}>{errors.stayLimit}</p>
                  )}
                </div>
              </div>

              <div className={styles.fieldColumnLarge}>
                <div className={styles.fieldLabelRow}>
                  <span className={styles.fieldTitle}>Brief Itinerary</span>
                </div>
                <div className={styles.textareaBox}>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    value={formData.itinerary}
                    onChange={handleChange("itinerary")}
                    placeholder="Cities, Plans, dates"
                  />
                </div>
                {errors.itinerary && (
                  <p className={styles.fieldError}>{errors.itinerary}</p>
                )}
              </div>
            </section>

            <footer className={styles.footer}>
              <button
                className={styles.backButton}
                type="button"
                onClick={handleBackToForm}
              >
                <span className={styles.backArrow} aria-hidden="true" />
                Back To Form
              </button>
              <button
                className={styles.submitButton}
                type="button"
                onClick={handleContinue}
              >
                Continue To Documents
              </button>
            </footer>
            {statusMessage && (
              <div className={styles.statusMessage}>{statusMessage}</div>
            )}
          </div>

          <aside className={styles.sidebar}>
            <nav className={styles.sidebarNav}>
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className={`${styles.sidebarItem} ${activeSection === section.id ? styles.activeSidebarItem : ""}`}
                  onClick={() => scrollToSection(section.id)}
                >
                  <span className={styles.sidebarItemTitle}>
                    {section.title}
                  </span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
