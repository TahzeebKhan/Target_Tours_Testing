"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";

export default function Page() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  // ✅ API call (POST)
  const registerUser = async (payload) => {
    const res = await fetch("https://your-api.com/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${token}`, // if needed
      },
      body: JSON.stringify(payload),
    });

    // handle non-JSON / error response safely
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // if backend returns HTML or plain text
    }

    if (!res.ok) {
      const msg = json?.message || `Register failed (${res.status})`;
      throw new Error(msg);
    }

    return json;
  };

  const {
    mutate,
    isPending,
    isSuccess,
    isError,
    error,
    data,
  } = useMutation({
    mutationFn: () => registerUser (form),
    onSuccess: () => {
      // clear form after success
      setForm({ fullName: "", email: "", phone: "", password: "" });
    },
    // mutationKey
    // onSettled
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // basic validation
    if (!form.fullName.trim()) return alert("Full name required");
    if (!form.email.trim()) return alert("Email required");
    if (!form.password.trim()) return alert("Password required");

    mutate(form);
  };

  return (
    <div style={{ padding: 16, maxWidth: 420 }}>
      <h2>User Registration</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <div>
          <label>Full Name</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={onChange}
            placeholder="John Doe"
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="john@example.com"
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div>
          <label>Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="9876543210"
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="********"
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          style={{ padding: 10, cursor: isPending ? "not-allowed" : "pointer" }}
        >
          {isPending ? "Registering..." : "Register"}
        </button>

        {isError && (
          <p style={{ color: "red", margin: 0 }}>Error: {error.message}</p>
        )}

        {isSuccess && (
          <p style={{ color: "green", margin: 0 }}>
            Registered successfully{data?.message ? `: ${data.message}` : ""}.
          </p>
        )}
      </form>
    </div>
  );
}
