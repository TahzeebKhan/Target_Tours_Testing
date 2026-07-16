"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./PayWithOptions.module.css";
import { getHotelPaymentGateways } from "@/shared/services/hotelSearch";

const GATEWAY_LOGOS = {
  cashfree: "/images/cashfree.png",
  phonepe: "/images/phonepeLogo.png",
  razorpay: "/images/payment-razorpay.svg",
};

const formatGatewayLabel = (value = "") =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getGatewayId = (gateway = {}) =>
  String(
    gateway && typeof gateway === "object"
      ? gateway.id ||
          gateway.slug ||
          gateway.code ||
          gateway.name ||
          gateway.payment_gateway ||
          gateway.paymentGateway ||
          gateway.gateway ||
          ""
      : gateway || "",
  )
    .trim()
    .toLowerCase();

const getGatewayLabel = (gateway = {}, id = "") =>
  (typeof gateway.display_name === "string" && gateway.display_name) ||
  (typeof gateway.displayName === "string" && gateway.displayName) ||
  (typeof gateway.title === "string" && gateway.title) ||
  (typeof gateway.name === "string" && gateway.name) ||
  formatGatewayLabel(id);

const isGatewayEnabled = (gateway = {}) => {
  const enabledValue =
    gateway.enabled ??
    gateway.is_enabled ??
    gateway.isEnabled ??
    gateway.active ??
    gateway.status;

  if (typeof enabledValue === "boolean") return enabledValue;
  if (typeof enabledValue === "string") {
    const normalized = enabledValue.trim().toLowerCase();
    return !["false", "inactive", "disabled", "0"].includes(normalized);
  }

  return true;
};

const getGatewayPayloadData = (payload) =>
  payload?.data?.data && typeof payload.data.data === "object"
    ? payload.data.data
    : payload?.data && typeof payload.data === "object"
      ? payload.data
      : payload && typeof payload === "object"
        ? payload
        : {};

const normalizeGatewayList = (payload) => {
  const data = getGatewayPayloadData(payload);
  const availableGateways =
    data.available_gateways ||
    data.availableGateways ||
    data.gateways ||
    data.payment_gateways ||
    payload?.gateways ||
    payload?.payment_gateways ||
    [];
  const defaultGateway = String(
    data.default_gateway || data.defaultGateway || "",
  )
    .trim()
    .toLowerCase();

  const list = Array.isArray(availableGateways)
    ? availableGateways
    : availableGateways && typeof availableGateways === "object"
      ? Object.entries(availableGateways).map(([key, value]) =>
          value && typeof value === "object"
            ? { id: key, ...value }
            : { id: key, enabled: Boolean(value) },
        )
      : [];

  const gateways = list
    .map((gateway) =>
      typeof gateway === "string" ? { id: gateway, name: gateway } : gateway,
    )
    .filter(isGatewayEnabled)
    .map((gateway) => {
      const id = getGatewayId(gateway);
      if (!id) return null;

      return {
        id,
        label: getGatewayLabel(gateway, id),
        icon: gateway.logo || gateway.icon || gateway.image || GATEWAY_LOGOS[id] || "",
      };
    })
    .filter(Boolean);

  return { gateways, defaultGateway };
};

const PayWithOptions = ({ setPaymentMethod, selected }) => {
  const [gateways, setGateways] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const defaultGatewayRef = useRef("");
  const selectedId = getGatewayId(selected);

  useEffect(() => {
    let isActive = true;

    const loadGateways = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getHotelPaymentGateways();
        if (!isActive) return;

        const { gateways: nextGateways, defaultGateway } = normalizeGatewayList(response);
        setGateways(nextGateways);
        defaultGatewayRef.current =
          nextGateways.find((gateway) => gateway.id === defaultGateway)?.id ||
          nextGateways[0]?.id ||
          "";
      } catch (error) {
        if (!isActive) return;

        console.error("Unable to load payment gateways:", error);
        setGateways([]);
        setErrorMessage("Unable to load payment options.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadGateways();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (isLoading || errorMessage || selectedId || !gateways.length) return;
    setPaymentMethod(defaultGatewayRef.current || gateways[0].id);
  }, [errorMessage, gateways, isLoading, selectedId, setPaymentMethod]);

  const paymentMethods = useMemo(() => gateways, [gateways]);

  return (
    <div className={styles.wrapper}>
      {isLoading && <div className={styles.stateText}>Loading payment options...</div>}
      {!isLoading && errorMessage && (
        <div className={styles.stateText}>{errorMessage}</div>
      )}
      {!isLoading && !errorMessage && !paymentMethods.length && (
        <div className={styles.stateText}>No payment options available.</div>
      )}

      {paymentMethods.map((method) => {
        const isSelected = selectedId === method.id;

        return (
        <label
          key={method.id}
          className={`${styles.card} ${isSelected ? styles.active : ""}`}
          onClick={() => setPaymentMethod(method.id)}
        >
          <input
            type="radio"
            name="payment"
            checked={isSelected}
            onChange={() => setPaymentMethod(method.id)}
          />
          <span className={styles.radioIndicator} aria-hidden="true" />

          {method.icon && <img src={method.icon} alt={method.label} />}

          <span>{method.label}</span>
        </label>
      );
      })}
    </div>
  );
};

export default PayWithOptions;
