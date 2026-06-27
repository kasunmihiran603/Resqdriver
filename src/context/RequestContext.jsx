import React, { createContext, useContext, useState, useEffect } from "react";

const RequestContext = createContext();

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error("useRequests must be used within a RequestProvider");
  }
  return context;
};

const seedRequests = () => {
  const requests = localStorage.getItem("vamp-requests");
  if (!requests) {
    const defaultRequests = [
      {
        id: "req-1",
        userId: "usr-1",
        userName: "Alex Mercer",
        userPhone: "+1 (555) 019-2834",
        vehicle: { make: "Tesla", model: "Model S", year: "2022", plate: "E-DRIVE1" },
        category: "Engine Issue",
        symptoms: "Loud rattling from motor, speed capped at 30mph.",
        description: "Rattling noise started on the highway and car went into limp mode. Battery levels seem stable but power draw is high.",
        location: "Highway 101 South, Near Mile Marker 45",
        gps: { lat: 37.7845, lng: -122.4012 },
        imageSimulated: true,
        audioSimulated: false,
        status: "on_the_way", // pending, accepted, technician_assigned, on_the_way, repair_in_progress, completed
        garageId: "grg-1",
        garageName: "Apex Auto Care",
        technician: { id: "tech-1", name: "James R.", phone: "+1 (555) 018-9901" },
        towingId: null,
        eta: "14 mins",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
        fee: "$240.00"
      },
      {
        id: "req-2",
        userId: "usr-1",
        userName: "Alex Mercer",
        userPhone: "+1 (555) 019-2834",
        vehicle: { make: "Toyota", model: "RAV4", year: "2019", plate: "TR-8923A" },
        category: "Tire Issue",
        symptoms: "Right rear tire pressure dropping rapidly.",
        description: "Ran over a metal nail in the construction zone. Spare tire is in trunk but I do not have a jack.",
        location: "284 Market Street, Downtown",
        gps: { lat: 37.7749, lng: -122.4194 },
        imageSimulated: false,
        audioSimulated: true,
        status: "completed",
        garageId: "grg-1",
        garageName: "Apex Auto Care",
        technician: { id: "tech-3", name: "David K.", phone: "+1 (555) 018-9903" },
        towingId: null,
        eta: "Completed",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        fee: "$85.00"
      },
      {
        id: "req-3",
        userId: "usr-2",
        userName: "Sarah Connor",
        userPhone: "+1 (555) 012-7744",
        vehicle: { make: "Ford", model: "F-150", year: "2018", plate: "R-TRUCK", insurance: "Allstate" },
        category: "Accident",
        symptoms: "Fender bender, front bumper detached, radiator leaking.",
        description: "Rear-ended by a sedan. Coolant is leaking, cannot start engine without smoke. Need towing to local garage.",
        location: "Intersection of 5th Ave and Lincoln St",
        gps: { lat: 37.7698, lng: -122.4468 },
        imageSimulated: true,
        audioSimulated: true,
        status: "pending",
        garageId: null,
        towingId: "tow-1",
        towingName: "Rapid Towing & Recovery",
        technician: null,
        eta: "Pending Driver Assignment",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
        fee: "$180.00"
      }
    ];
    localStorage.setItem("vamp-requests", JSON.stringify(defaultRequests));
  }
};

export const RequestProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    seedRequests();
    const stored = localStorage.getItem("vamp-requests");
    if (stored) {
      setRequests(JSON.parse(stored));
    }
  }, []);

  const updateLocalStorage = (newRequests) => {
    setRequests(newRequests);
    localStorage.setItem("vamp-requests", JSON.stringify(newRequests));
  };

  const createRequest = (requestData) => {
    const newRequest = {
      id: `req-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: "pending",
      garageId: null,
      technician: null,
      towingId: null,
      eta: "Searching for helpers...",
      fee: "$150.00", // baseline estimated fee
      ...requestData
    };

    const updated = [newRequest, ...requests];
    updateLocalStorage(updated);
    return newRequest;
  };

  const updateRequestStatus = (requestId, status, additionalFields = {}) => {
    const updated = requests.map((req) => {
      if (req.id === requestId) {
        // Handle custom ETA messages based on status changes if not provided
        let defaultEta = req.eta;
        if (status === "accepted") defaultEta = "Assigning tech...";
        else if (status === "technician_assigned") defaultEta = "25 mins";
        else if (status === "on_the_way") defaultEta = "12 mins";
        else if (status === "repair_in_progress") defaultEta = "Under repair";
        else if (status === "completed") defaultEta = "Completed";

        return {
          ...req,
          status,
          eta: additionalFields.eta || defaultEta,
          ...additionalFields
        };
      }
      return req;
    });
    updateLocalStorage(updated);
  };

  const getRequestsByRole = (role, id) => {
    if (role === "admin") return requests;
    if (role === "user") return requests.filter((r) => r.userId === id);
    if (role === "garage") return requests.filter((r) => r.garageId === id || (!r.garageId && r.status === "pending" && !r.towingId));
    if (role === "towing") return requests.filter((r) => r.towingId === id || (!r.towingId && r.status === "pending" && (r.isTowingRequest || r.category === "Accident")));
    return [];
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        createRequest,
        updateRequestStatus,
        getRequestsByRole
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};
