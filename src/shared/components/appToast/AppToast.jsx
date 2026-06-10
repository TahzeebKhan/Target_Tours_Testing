"use client";

import { AlertCircle, Check } from "lucide-react";
import { toast } from "react-toastify";
import styles from "./AppToast.module.css";

const toastConfig = {
  success: {
    className: "targetToastSuccess",
    icon: Check,
  },
  error: {
    className: "targetToastError",
    icon: AlertCircle,
  },
  info: {
    className: "targetToastInfo",
    icon: AlertCircle,
  },
  warn: {
    className: "targetToastWarning",
    icon: AlertCircle,
  },
};

function AppToastContent({ message, type }) {
  const Icon = toastConfig[type]?.icon || AlertCircle;

  return (
    <div className={`${styles.toastContent} toastContent`}>
      {/* <Icon className={styles.toastIcon} strokeWidth={2.5} /> */}
      <img src="/images/checkIcon.svg" alt="check" className={styles.toastIcon} />
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
