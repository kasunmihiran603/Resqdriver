import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "./api";
import { useAuth } from "./AuthContext";

const RequestContext = createContext();

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error("useRequests must be used within a RequestProvider");
  }
  return context;
};

export const RequestProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useAuth();

  const fetchData = useCallback(async () => {
    if (!currentUser) {
      setRequests([]);
      setTransactions([]);
      setNotifications([]);
      return;
    }
    try {
      const [reqsRes, txnsRes, notifsRes] = await Promise.all([
        api.get("/api/requests"),
        api.get("/api/transactions"),
        api.get("/api/notifications")
      ]);
      setRequests(reqsRes.data || []);
      setTransactions(txnsRes.data || []);
      setNotifications(notifsRes.data || []);
    } catch (err) {
      console.error("Error fetching data from API", err);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createRequest = async (requestData) => {
    try {
      const res = await api.post("/api/requests", requestData);
      fetchData();
      return res.data;
    } catch (err) {
      console.error("Failed to create request", err);
      throw err;
    }
  };

  const updateRequestStatus = async (requestId, status, additionalFields = {}) => {
    try {
      const payload = {
        status,
        additionalFields
      };
      await api.put(`/api/requests/${requestId}`, payload);
      fetchData();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const confirmPayment = async (requestId, paymentMethod) => {
    try {
      const res = await api.post("/api/transactions", { requestId, paymentMethod });
      fetchData();
      return res.data;
    } catch (err) {
      console.error("Failed to confirm payment", err);
      throw err;
    }
  };

  const withdrawGarageBalance = (garageId) => {
    return true;
  };

  const getRequestsByRole = (role, id) => {
    // The backend already filters requests by the current user's role/id.
    return requests;
  };

  const dismissNotification = async (notifId) => {
    try {
      await api.delete(`/api/notifications/${notifId}`);
      fetchData();
    } catch (err) {
      console.error("Failed to dismiss notification", err);
    }
  };

  const markAllNotificationsRead = async (userId) => {
    try {
      await api.put("/api/notifications/read");
      fetchData();
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
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