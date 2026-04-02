import { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency } from '../lib/utils';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../lib/constants';
import { HelpCircle, Edit2, Check } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function Budgets() {
  const { transactions, loading } = useTransactions();
  const { privateMode, currency, budgetLimits, setBudgetLimits } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [localLimits, setLocalLimits] = useState(budgetLimits);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-text-muted">Cargando...</div>;
  }

  // Calculate spending per category for the current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const expensesThisMonth = transactions.filter(tx => {
    if (tx.type !== 'expense') return false;
    const date = tx.date?.toDate() || new Date();
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const spentByCategory = expensesThisMonth.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.keys(budgetLimits);

  const handleSave = () => {
    setBudgetLimits(localLimits);
    setIsEditing(false);
  };

  const handleLimitChange = (category: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setLocalLimits(prev => ({ ...prev, [category]: numValue }));
    } else if (value === '') {
      setLocalLimits(prev => ({ ...prev, [category]: 0 }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Presupuestos</h2>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <button 
              onClick={handleSave}
              className="flex items-center gap-1 text-xs bg-primary text-white px-3 py-1.5 rounded-md font-medium transition-colors hover:bg-primary-dark"
            >
              <Check className="h-3.5 w-3.5" />
              Guardar
            </button>
          ) : (
            <button 
              onClick={() => {
                setLocalLimits(budgetLimits);
                setIsEditing(true);
              }}
              className="flex items-center gap-1 text-xs text-text-muted bg-surface-dark px-3 py-1.5 rounded-md border border-border-dark hover:text-white hover:border-border-hover transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Editar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {categories.map(category => {
          const spent = spentByCategory[category] || 0;
          const limit = isEditing ? localLimits[category] : budgetLimits[category];
          const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : (spent > 0 ? 100 : 0);
          const isOverBudget = limit > 0 ? spent > limit : spent > 0;
          const Icon = CATEGORY_ICONS[category] || HelpCircle;
          const color = CATEGORY_COLORS[category] || 'var(--theme-text-muted)';

          return (
            <div key={category} className="rounded-2xl bg-surface-dark border border-border-dark p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-border-dark text-white" style={{ color }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{category}</h3>
                    <p className="text-xs text-text-muted">
                      {isOverBudget 
                        ? 'Presupuesto excedido' 
                        : `${formatCurrency(Math.max(0, limit - spent), currency, privateMode)} restantes`}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className={`text-sm font-mono font-medium ${isOverBudget ? 'text-accent-red' : 'text-white'}`}>
                    {formatCurrency(spent, currency, privateMode)}
                  </p>
                  {isEditing ? (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-text-muted">de</span>
                      <input
                        type="number"
                        value={localLimits[category] || ''}
                        onChange={(e) => handleLimitChange(category, e.target.value)}
                        className="w-20 bg-background-dark border border-border-dark rounded px-2 py-0.5 text-xs text-white font-mono text-right focus:outline-none focus:border-primary"
                        min="0"
                        step="10"
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted font-mono">de {formatCurrency(limit, currency, privateMode)}</p>
                  )}
                </div>
              </div>
              
              <div className="h-2 w-full rounded-full bg-background-dark overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-accent-red' : ''}`}
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: isOverBudget ? undefined : color
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
