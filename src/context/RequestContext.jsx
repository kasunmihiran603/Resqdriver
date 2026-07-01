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
  const cached = localStorage.getItem("vamp-requests");
  if (!cached) {
    localStorage.setItem("vamp-requests", JSON.stringify([]));
  }
};

const seedTransactions = () => {
  const transactions = localStorage.getItem("vamp-transactions");
  if (!transactions) {
    localStorage.setItem("vamp-transactions", JSON.stringify([]));
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

  // Platform commission rate applied to the dispatch cost
  const PLATFORM_COMMISSION_RATE = 0.10;

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
      // fee is calculated from distance at acceptance time, not at creation
      fee: null,
      dispatchCost: null,
      platformCommission: null,
      providerShare: null,
      distance: null,
      ...requestData
    };

    const updated = [newRequest, ...requests];
    updateLocalStorage(updated);
    return newRequest;
  };

  const calculateHaversineDistance = (coords1, coords2) => {
    if (!coords1 || !coords2) return 8.5; // default fallback distance in km
    const R = 6371; // radius of Earth in km
    const dLat = ((coords2.lat - coords1.lat) * Math.PI) / 180;
    const dLon = ((coords2.lng - coords1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coords1.lat * Math.PI) / 180) *
      Math.cos((coords2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // in km
    return Math.round(distance * 10) / 10; // round to 1 decimal place
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

        // Calculate Dispatch Cost when a provider accepts the request
        // The dispatch cost is derived purely from distance × rate-per-km.
        // Platform takes PLATFORM_COMMISSION_RATE of the dispatch cost;
        // the remaining (1 - PLATFORM_COMMISSION_RATE) goes to the provider.
        let updatedFeeFields = {};
        if (status === "accepted") {
          const providerId = additionalFields.garageId || additionalFields.towingId;
          const users = JSON.parse(localStorage.getItem("vamp-users") || "[]");
          const provider = users.find((u) => u.id === providerId);
          const ratePerKM = provider?.ratePerKM || (provider?.role === "towing" ? 200 : 150);

          // Distance (km) between user GPS and provider GPS
          const distance = calculateHaversineDistance(req.gps, provider?.gps);

          // Dispatch Cost = distance × rate, scaled to a USD figure
          const dispatchCost = Math.round((distance * ratePerKM) / 300.0 * 100) / 100;
          const platformCommission = Math.round(dispatchCost * PLATFORM_COMMISSION_RATE * 100) / 100;
          const providerShare = Math.round((dispatchCost - platformCommission) * 100) / 100;

          updatedFeeFields = {
            fee: `$${dispatchCost.toFixed(2)}`,
            dispatchCost,
            platformCommission,
            providerShare,
            distance
          };
        }

        return {
          ...req,
          status,
          eta: additionalFields.eta || defaultEta,
          ...additionalFields,
          ...updatedFeeFields
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
