import React, { createContext, useContext, useState, useEffect } from 'react';
import { BUDGET_LIMITS as DEFAULT_BUDGET_LIMITS } from '../lib/constants';

export type ThemeType = 'emerald' | 'blue' | 'purple' | 'rose';

interface SettingsContextType {
  privateMode: boolean;
  setPrivateMode: (val: boolean) => void;
  currency: string;
  setCurrency: (val: string) => void;
  theme: ThemeType;
  setTheme: (val: ThemeType) => void;
  budgetLimits: Record<string, number>;
  setBudgetLimits: (val: Record<string, number>) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  privateMode: false,
  setPrivateMode: () => {},
  currency: 'EUR',
  setCurrency: () => {},
  theme: 'emerald',
  setTheme: () => {},
  budgetLimits: DEFAULT_BUDGET_LIMITS,
  setBudgetLimits: () => {},
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [privateMode, setPrivateMode] = useState(() => localStorage.getItem('privateMode') === 'true');
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'EUR');
  const [theme, setTheme] = useState<ThemeType>(() => (localStorage.getItem('theme') as ThemeType) || 'emerald');
  const [budgetLimits, setBudgetLimits] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('budgetLimits');
    return saved ? JSON.parse(saved) : DEFAULT_BUDGET_LIMITS;
  });

  useEffect(() => {
    localStorage.setItem('privateMode', String(privateMode));
  }, [privateMode]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('theme-emerald', 'theme-blue', 'theme-purple', 'theme-rose');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('budgetLimits', JSON.stringify(budgetLimits));
  }, [budgetLimits]);

  return (
    <SettingsContext.Provider value={{ privateMode, setPrivateMode, currency, setCurrency, theme, setTheme, budgetLimits, setBudgetLimits }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
