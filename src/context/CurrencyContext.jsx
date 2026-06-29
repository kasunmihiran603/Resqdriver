import React, { createContext, useContext, useState } from "react";

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", rate: 1.0 },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", rate: 300.0 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.78 }
];

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem("vamp-currency") || "USD";
  });

  const currentCurrencyObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const setCurrency = (code) => {
    if (CURRENCIES.find(c => c.code === code)) {
      setCurrencyState(code);
      localStorage.setItem("vamp-currency", code);
    }
  };

  const formatAmount = (amountInUSD) => {
    const value = amountInUSD * currentCurrencyObj.rate;
    if (currentCurrencyObj.code === "LKR") {
      return `Rs ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${currentCurrencyObj.symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, currencySymbol: currentCurrencyObj.symbol, setCurrency, formatAmount, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
};
