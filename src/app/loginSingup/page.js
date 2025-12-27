"use client";
import { useState } from "react";
import LoginPopup from "./LoginPopup";

export default function Page() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Popup</button>
      <LoginPopup open={open} onClose={() => setOpen(false)} />
    </>
  );
}