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
        status: "on_the_way",
        paymentStatus: "unpaid",
        garageId: "grg-1",
        garageName: "Apex Auto Care",
        technician: { id: "tech-1", name: "James R.", phone: "+1 (555) 018-9901" },
        towingId: null,
        eta: "14 mins",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
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
        paymentStatus: "paid",
        garageId: "grg-1",
        garageName: "Apex Auto Care",
        technician: { id: "tech-3", name: "David K.", phone: "+1 (555) 018-9903" },
        towingId: null,
        eta: "Completed",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
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
        paymentStatus: "unpaid",
        garageId: null,
        towingId: "tow-1",
        towingName: "Rapid Towing & Recovery",
        technician: null,
        eta: "Pending Driver Assignment",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        fee: "$180.00"
      },
      {
        id: "req-4",
        userId: "usr-1",
        userName: "Alex Mercer",
        userPhone: "+1 (555) 019-2834",
        vehicle: { make: "Tesla", model: "Model S", year: "2022", plate: "E-DRIVE1" },
        category: "Battery Issue",
        symptoms: "Dead battery, click click sound on startup.",
        description: "Battery drained overnight due to cabin overhead light being left on.",
        location: "555 Oakwood Lane, Suburbs",
        gps: { lat: 37.7550, lng: -122.4300 },
        imageSimulated: false,
        audioSimulated: false,
        status: "completed",
        paymentStatus: "unpaid",
        garageId: "grg-1",
        garageName: "Apex Auto Care",
        technician: { id: "tech-1", name: "James R.", phone: "+1 (555) 018-9901" },
        towingId: null,
        eta: "Completed",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        fee: "$150.00"
      }
    ];
    localStorage.setItem("vamp-requests", JSON.stringify(defaultRequests));
  }
};

const seedTransactions = () => {
  const transactions = localStorage.getItem("vamp-transactions");
  if (!transactions) {
    const defaultTransactions = [
      {
        id: "TXN-100201",
        requestId: "req-2",
        userId: "usr-1",
        userName: "Alex Mercer",
        garageId: "grg-1",
        garageName: "Apex Auto Care",
        vehicle: "Toyota RAV4 (TR-8923A)",
        amount: "$85.00",
        paymentMethod: "Visa ending 4521",
        status: "Successful",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem("vamp-transactions", JSON.stringify(defaultTransactions));
  }
};

export const RequestProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    seedRequests();
    seedTransactions();
    const storedReqs = localStorage.getItem("vamp-requests");
    if (storedReqs) setRequests(JSON.parse(storedReqs));
    const storedTxns = localStorage.getItem("vamp-transactions");
    if (storedTxns) setTransactions(JSON.parse(storedTxns));
    const storedNotifs = localStorage.getItem("vamp-notifications");
    if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
  }, []);

  // Cross-tab sync: when another browser tab updates localStorage, reflect it here
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "vamp-requests") setRequests(JSON.parse(e.newValue || "[]"));
      if (e.key === "vamp-transactions") setTransactions(JSON.parse(e.newValue || "[]"));
      if (e.key === "vamp-notifications") setNotifications(JSON.parse(e.newValue || "[]"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateLocalStorage = (newRequests) => {
    setRequests(newRequests);
    localStorage.setItem("vamp-requests", JSON.stringify(newRequests));
  };

  const updateTransactionsStorage = (newTransactions) => {
    setTransactions(newTransactions);
    localStorage.setItem("vamp-transactions", JSON.stringify(newTransactions));
  };

  const updateNotificationsStorage = (newNotifs) => {
    setNotifications(newNotifs);
    localStorage.setItem("vamp-notifications", JSON.stringify(newNotifs));
  };

  const createRequest = (requestData) => {
    const newRequest = {
      id: `req-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: "pending",
      paymentStatus: "unpaid",
      garageId: null,
      technician: null,
      towingId: null,
      eta: "Searching for helpers...",
      fee: "$150.00",
      ...requestData
    };

    const updated = [newRequest, ...requests];
    updateLocalStorage(updated);
    return newRequest;
  };

  const updateRequestStatus = (requestId, status, additionalFields = {}) => {
    const updated = requests.map((req) => {
      if (req.id === requestId) {
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

    // Create a notification for the user when their request is accepted
    if (status === "accepted") {
      const targetReq = requests.find((r) => r.id === requestId);
      if (targetReq?.userId) {
        const existingNotifs = JSON.parse(localStorage.getItem("vamp-notifications") || "[]");
        const alreadyNotified = existingNotifs.some(
          (n) => n.requestId === requestId && (n.type === "accepted" || n.type === "tow_accepted")
        );
        if (!alreadyNotified) {
          const isTow = targetReq.isTowingRequest === true;
          const notif = {
            id: `notif-${Date.now()}`,
            userId: targetReq.userId,
            type: isTow ? "tow_accepted" : "accepted",
            title: isTow ? "Tow Truck Accepted Your Request" : "Garage Accepted Your Request",
            message: isTow
              ? `${additionalFields.towingName || "A tow truck driver"} has accepted your ${targetReq.category} tow request and is heading to your location.`
              : `${additionalFields.garageName || "A nearby garage"} has accepted your ${targetReq.category} request and is preparing assistance.`,
            timestamp: new Date().toISOString(),
            read: false,
            requestId
          };
          updateNotificationsStorage([notif, ...existingNotifs]);
        }
      }
    }
  };

  const confirmPayment = (requestId, paymentMethod) => {
    let targetReq = null;
    const updatedRequests = requests.map((req) => {
      if (req.id === requestId) {
        targetReq = { ...req, paymentStatus: "paid" };
        return targetReq;
      }
      return req;
    });

    if (!targetReq) return null;

    updateLocalStorage(updatedRequests);

    const newTxn = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      requestId: targetReq.id,
      userId: targetReq.userId,
      userName: targetReq.userName,
      garageId: targetReq.garageId,
      garageName: targetReq.garageName || "VAMP Platform",
      vehicle: `${targetReq.vehicle.make} ${targetReq.vehicle.model} (${targetReq.vehicle.plate})`,
      amount: targetReq.fee,
      paymentMethod: paymentMethod || "Visa ending 4521",
      status: "Successful",
      date: new Date().toISOString()
    };

    const updatedTxns = [newTxn, ...transactions];
    updateTransactionsStorage(updatedTxns);
    return newTxn;
  };

  const withdrawGarageBalance = (garageId) => {
    return true;
  };

  const getRequestsByRole = (role, id) => {
    if (role === "admin") return requests;
    if (role === "user") return requests.filter((r) => r.userId === id);
    if (role === "garage") return requests.filter((r) => r.garageId === id || (!r.garageId && r.status === "pending" && !r.towingId));
    if (role === "towing") return requests.filter((r) => r.towingId === id || (!r.towingId && r.status === "pending" && (r.isTowingRequest || r.category === "Accident")));
    return [];
  };

  const dismissNotification = (notifId) => {
    const updated = notifications.filter((n) => n.id !== notifId);
    updateNotificationsStorage(updated);
  };

  const markAllNotificationsRead = (userId) => {
    const updated = notifications.map((n) =>
      n.userId === userId ? { ...n, read: true } : n
    );
    updateNotificationsStorage(updated);
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        transactions,
        notifications,
        createRequest,
        updateRequestStatus,
        confirmPayment,
        withdrawGarageBalance,
        getRequestsByRole,
        dismissNotification,
        markAllNotificationsRead
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};
