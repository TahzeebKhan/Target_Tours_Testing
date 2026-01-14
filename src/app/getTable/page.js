"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function RoomsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showTable, setShowTable] = useState(true); // ✅ toggle state

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYzNlZGIxLTVkYWQtNGI5My1iYTNjLWY5YTAyZWJkYmZjYiIsImVtYWlsIjoidWRpdC52YXJzaG5leSIsInVpZCI6bnVsbCwicm9sZSI6InN1cGVyYWRtaW4iLCJzdHVkZW50SWQiOiI2MmMzZWRiMS01ZGFkLTRiOTMtYmEzYy1mOWEwMmViZGJmY2IiLCJmaXJzdE5hbWUiOiJVZGl0IiwibGFzdE5hbWUiOiJWYXJzaG5leSIsImlhdCI6MTc2ODM2NTUxNCwiZXhwIjoxNzY4NDUxOTE0fQ.EM-BSkUW8JfTsnKH3kl9yLe0iVOy2_s54RKOg0-sIbU";

  const fetchRooms = async ({ queryKey }) => {
    const [_key, page, limit] = queryKey;

    const res = await fetch(
      `https://hostelapi.pmu.org.in/room/room-allocation?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) throw new Error("API failed");
    return res.json();
  };

  // ✅ only fetch when table is ON
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["rooms", page, limit],
    queryFn: fetchRooms,
    keepPreviousData: true,
    gcTime:30004,
    enabled: showTable,
    staleTime:4000,
    // refetchInterval:1000,
    // refetchIntervalInBackground:true,
  });

  const rooms = data?.data?.data ?? [];
  const meta = data?.data?.meta;

  return (
    <div style={{ padding: 16 }}>
      <h2>Rooms</h2>

      {/* ✅ Toggle */}
      <div style={{ marginBottom: 12, display: "flex", gap: 12, alignItems: "center" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={showTable}
            onChange={(e) => setShowTable(e.target.checked)}
          />
          Show Rooms Table
        </label>

        <span style={{ fontSize: 12 }}>
          {showTable ? "Table view" : "Greeting view"}
        </span>
      </div>

      {/* ✅ If toggle OFF -> show message */}
      {!showTable && <h3>Hii Good Morning</h3>}

      {/* ✅ If toggle ON -> show table data */}
      {showTable && (
        <>
          {/* Limit Selector */}
          <div style={{ marginBottom: 12 }}>
            <label>
              Rows per page:&nbsp;
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 20, 50, 100].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isLoading && <p>Loading...</p>}
          {isError && <p>Error: {error.message}</p>}

          {!isLoading && !isError && (
            <>
              <ul>
                {rooms.map((room) => (
                  <li key={room.id}>
                    Room {room.roomNumber} — {room.status}
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Prev
                </button>

                <span>
                  Page {page} {isFetching && "(loading…)"}
                </span>

                <button
                  disabled={meta && page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}