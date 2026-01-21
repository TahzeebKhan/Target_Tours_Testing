"use client";

import { SupportFlowProvider } from "../context/SupportFlowContext";
import MobileOnlyLayout from "./MobileOnlyLayout";
// import MobileOnlyLayout from "./MobileLayout";
// import { SupportFlowProvider } from "./context/SupportFlowContext";

export default function Layout({ children }) {
  return (
    <SupportFlowProvider>
      <MobileOnlyLayout>{children}</MobileOnlyLayout>
    </SupportFlowProvider>
  );
}
