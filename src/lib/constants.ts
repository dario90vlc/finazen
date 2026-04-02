import { Coffee, ShoppingBag, Banknote, PlaySquare, Fuel, HelpCircle, Home } from 'lucide-react';

export const CATEGORY_COLORS: Record<string, string> = {
  'Vivienda': 'var(--theme-primary)',
  'Comida': 'var(--theme-text-muted)',
  'Ocio': 'var(--theme-border-hover)',
  'Transporte': '#f59e0b',
  'Compras': 'var(--theme-primary-dark)',
  'Nómina': 'var(--theme-primary)',
  'Otros': 'var(--theme-border)'
};

export const CATEGORY_ICONS: Record<string, any> = {
  'Comida': Coffee,
  'Compras': ShoppingBag,
  'Nómina': Banknote,
  'Ocio': PlaySquare,
  'Transporte': Fuel,
  'Vivienda': Home,
  'Otros': HelpCircle
};

export const BUDGET_LIMITS: Record<string, number> = {
  'Vivienda': 1000,
  'Comida': 400,
  'Ocio': 150,
  'Transporte': 100,
  'Compras': 200,
  'Otros': 150
};
