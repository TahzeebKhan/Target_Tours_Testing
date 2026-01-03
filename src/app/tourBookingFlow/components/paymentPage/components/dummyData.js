export const tripSummaryData = {
  onward: {
    firstTrip: true,
    airline: {
      name: "Batik Air Malaysia",
      code: "OD 804",
      aircraft: "Boeing 737",
      logo: "/images/AirlineLogos.png",
    },
    fareType: "FLEXI PLUS FARE",
    cabin: "ECONOMY",
    segments: [
      {
        date: "THU, 18 DEC 2025",
        time: "06:45",
        city: "CGK - JAKARTA",
        terminal: "Terminal 2F",
        terminalName: "Soekarno–Hatta Interd",
      },
      {
        duration: {
          hours: "01",
          mins: "50",
        },
        nonStop: false,
      },
      {
        date: "THU, 18 DEC 2025",
        time: "08:00",
        city: "KUL - KUALA LUMPUR",
        terminal: "Terminal T3",
        terminalName: "Chnagi",
      },
    ],
  },
  onwardBusinessClass: {
    secondTrip: true,
    airline: {
      name: "Batik Air Malaysia",
      code: "OD 804",
      aircraft: "Boeing 737",
      logo: "/images/AirlineLogos.png",
    },
    fareType: "FLEXI PLUS FARE",
    cabin: "BUSINESS",
    segments: [
      {
        date: "THU, 18 DEC 2025",
        time: "06:45",
        city: "KUL – Kuala Lumpur",
        terminal: "Terminal 2F",
        terminalName: "Soekarno–Hatta Interd",
      },
      {
        duration: {
          hours: "01",
          mins: "50",
        },
        nonStop: false,
      },
      {
        date: "THU, 18 DEC 2025",
        time: "08:00",
        city: "SIN - Singapore",
        terminal: "Terminal T3",
        terminalName: "Chnagi",
      },
    ],
  },
  return: {
    airline: {
      name: "Garuda Indonesia",
      code: "6E-541",
      aircraft: "Boeing 737",
      logo: "/images/flightCompanyLogos/garunaIndnesia.png",
    },
    fareType: "FLEXI PLUS FARE",
    cabin: "FIRST CLASS",
    segments: [
      {
        date: "THU, 18 DEC 2025",
        time: "06:45",
        city: "SIN - SINGAPORE",
        terminal: "Terminal T3",
        terminalName: "Soekarno–Hatta Interd",
      },
      {
        duration: {
          hours: "01",
          mins: "50",
        },
        nonStop: true,
      },
      {
        date: "THU, 18 DEC 2025",
        time: "08:00",
        city: "CGK - JAKARTA",
        terminal: "Terminal 2F",
        terminalName: "Chnagi",
      },
    ],
    facilities: [
      "Baggage 20 kg, Cabin 7 kg",
      "In-flight entertainment",
      "Power & USB Port",
    ],
  },
};
