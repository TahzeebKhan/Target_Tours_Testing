"use client";

import React, { useState, useCallback } from "react";
import EligibilityCheck from "./eligibilityCheck";
import RequiredDocuments from "./requiredDocuments";
import ApplicationForm from "./ApplicationForm";
import UploadDocuments from "./uploadDocuments";
import ReviewAndPay from "./ReviewAndPay";
import SuccessPage from "./SuccessPage";

import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import Footer from "../../../home-page/components/footer/Footer";
import LoginPopup from "@/app/account/loginPopUp/LoginPopup";
import SignupPopup from "@/app/account/signUpPopUp/SignupPopup";
// import VisaDetailSection from "./components/VisaDetailSection";
import VisaDetailsHeader from "./VisaDetailsHeader";

import styles from "../page.module.css";

const STEPS = {
  ELIGIBILITY: "eligibility",
  REQUIRED_DOCUMENTS: "requiredDocuments",
  APPLICATION_FORM: "applicationForm",
  UPLOAD_DOCUMENTS: "uploadDocuments",
  REVIEW_AND_PAY: "reviewAndPay",
  SUCCESS: "success",
};

const STEP_ORDER = [
  STEPS.ELIGIBILITY,
  STEPS.REQUIRED_DOCUMENTS,
  STEPS.APPLICATION_FORM,
  STEPS.UPLOAD_DOCUMENTS,
  STEPS.REVIEW_AND_PAY,
  STEPS.SUCCESS,
];

const VisaApplicationFlow = () => {
  const [currentStep, setCurrentStep] = useState(STEPS.ELIGIBILITY);

  const handleNext = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState("login");

  const openAuthModal = (view = "login") => {
    setAuthView(view);
    setShowAuthModal(true);
  };

  return (
    <>
      <div className={styles.heroTopBar}>
        <div className={styles.heroContainer}>
          <img
            className={styles.heroLogo}
            src="/images/footerIcon.png"
            alt="Target Tours"
          />

          <div className={styles.heroActions}>
            <button type="button" className={styles.heroButton}>
              DOWNLOAD THE APP
            </button>
            <button
              type="button"
              className={styles.heroButtonFilled}
              onClick={() => openAuthModal("login")}
            >
              SIGN IN
            </button>
          </div>
        </div>
      </div>

     <VisaDetailsHeader />

      {currentStep === STEPS.ELIGIBILITY && (
        <EligibilityCheck onNext={handleNext} />
      )}
      {currentStep === STEPS.REQUIRED_DOCUMENTS && (
        <RequiredDocuments onNext={handleNext} onBack={handleBack} />
      )}
      {currentStep === STEPS.APPLICATION_FORM && (
        <ApplicationForm onNext={handleNext} onBack={handleBack} />
      )}
      {currentStep === STEPS.UPLOAD_DOCUMENTS && (
        <UploadDocuments onNext={handleNext} onBack={handleBack} />
      )}
      {currentStep === STEPS.REVIEW_AND_PAY && (
        <ReviewAndPay onNext={handleNext} onBack={handleBack} />
      )}
      {currentStep === STEPS.SUCCESS && <SuccessPage onBack={handleBack} />}

      <Footer />

      {showAuthModal && authView === "login" && (
        <LoginPopup
          onClose={() => setShowAuthModal(false)}
          onNavigate={setAuthView}
        />
      )}

      {showAuthModal && authView === "signup" && (
        <SignupPopup
          onClose={() => setShowAuthModal(false)}
          onNavigate={setAuthView}
        />
      )}
    </>
  );
};

export default VisaApplicationFlow;
