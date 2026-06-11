"use client";

import { toast } from "react-toastify";
import styles from "./AppToast.module.css";

const toastConfig = {
  success: {
    className: "targetToastSuccess",
  },
  error: {
    className: "targetToastError",
  },
  info: {
    className: "targetToastInfo",
  },
  warn: {
    className: "targetToastWarning",
  },
};

function AppToastContent({ message, type }) {
  const iconSrc =
    type === "error" ? "/images/errorIcon.svg" : "/images/checkIcon.svg";

  return (
    <div className={`${styles.toastContent} toastContent`}>
      <img src={iconSrc} alt="" className={styles.toastIcon} />
      <span className={styles.toastMessage}>{message}</span>
    </div>
  );
}

const showToast = (type, message, options = {}) =>
  toast(<AppToastContent message={message} type={type} />, {
    ...options,
    type,
    icon: false,
    className: `targetToast ${toastConfig[type]?.className || ""} ${
      options.className || ""
    }`.trim(),
  });

export const appToast = {
  success: (message, options) => showToast("success", message, options),
  error: (message, options) => showToast("error", message, options),
  info: (message, options) => showToast("info", message, options),
  warn: (message, options) => showToast("warn", message, options),
};
