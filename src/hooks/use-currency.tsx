import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { type Currency, CURRENCIES } from "@/lib/constants";
import { loadCurrency, saveCurrency } from "@/lib/storage";

interface CurrencyContextType {
  readonly currency: Currency;
  readonly setCurrency: (currency: Currency) => void;
  readonly isInitialized: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { readonly children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(function loadCurrencyFromLocalStorage() {
    const storedCurrency = loadCurrency();
    if (storedCurrency) {
      const found = CURRENCIES.find((c) => c.code === storedCurrency.code);
      if (found) {
        setCurrency(found);
      }
    }
    setIsInitialized(true);
  }, []);

  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    saveCurrency(newCurrency);
  };

  const contextValue = useMemo(() => ({ currency, setCurrency: handleSetCurrency, isInitialized }), [currency, handleSetCurrency, isInitialized]);

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
