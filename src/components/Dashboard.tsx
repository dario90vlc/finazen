import { useState } from 'react';
import { TrendingUp, HelpCircle, PieChart as PieChartIcon, Trash2 } from 'lucide-react';
import { formatCurrency, formatShortDate } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTransactions } from '../hooks/useTransactions';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../lib/constants';
import { useSettings } from '../contexts/SettingsContext';
import { db } from '../firebase';
import { deleteDoc, doc } from 'firebase/firestore';

export default function Dashboard() {
  const { transactions, loading } = useTransactions();
  const { privateMode, currency } = useSettings();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
      setDeletingId(null);
    } catch (error) {
      console.error("Error deleting transaction", error);
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const incomePercentage = totalIncome > 0 ? (totalIncome / (totalIncome + totalExpense)) * 100 : 0;
  const expensePercentage = totalExpense > 0 ? (totalExpense / (totalIncome + totalExpense)) * 100 : 0;

  // Calculate category spending
  const categoryTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.keys(categoryTotals).map(key => ({
    name: key,
    value: categoryTotals[key],
    color: CATEGORY_COLORS[key] || CATEGORY_COLORS['Otros']
  })).sort((a, b) => b.value - a.value);

  const currentMonth = new Intl.DateTimeFormat('es-ES', { month: 'short', year: 'numeric' }).format(new Date());

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-text-muted">Cargando...</div>;
  }

  return (
    <>
      {/* Total Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-dark border border-border-dark p-6 shadow-xl">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="relative z-10 flex flex-col gap-1">
          <p className="text-text-muted text-sm font-medium">Saldo Total</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-bold text-white font-mono tracking-tight">{formatCurrency(balance, currency, privateMode)}</h3>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary border border-primary/20">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+0.0%</span>
            </div>
            <span className="text-xs text-text-muted">vs mes anterior</span>
          </div>
        </div>
      </div>

      {/* Cash Flow & Quick Stats Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Cash Flow */}
        <div className="rounded-2xl bg-surface-dark border border-border-dark p-5">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-white">Flujo de Caja</h4>
            <span className="text-xs text-text-muted font-mono capitalize">{currentMonth}</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-text-muted">Ingresos</span>
                <span className="text-white font-mono">{formatCurrency(totalIncome, currency, privateMode)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-background-dark">
                <div className="h-2 rounded-full bg-primary transition-all duration-500" style={{ width: `${incomePercentage}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-text-muted">Gastos</span>
                <span className="text-white font-mono">{formatCurrency(totalExpense, currency, privateMode)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-background-dark">
                <div className="h-2 rounded-full bg-text-muted transition-all duration-500" style={{ width: `${expensePercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Spending by Category */}
        <div className="rounded-2xl bg-surface-dark border border-border-dark p-5">
          <h4 className="text-sm font-medium text-white mb-4">Gasto por Categoría</h4>
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 flex-shrink-0">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full rounded-full border-4 border-border-dark flex items-center justify-center">
                  <PieChartIcon className="text-text-muted h-6 w-6" />
                </div>
              )}
              {pieData.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <PieChartIcon className="text-text-muted h-5 w-5" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              {pieData.length > 0 ? pieData.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-white">{item.name}</span>
                  </div>
                  <span className="font-mono text-text-muted">
                    {Math.round((item.value / totalExpense) * 100)}%
                  </span>
                </div>
              )) : (
                <div className="text-xs text-text-muted">No hay gastos registrados</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-sm font-medium text-white">Últimas Transacciones</h4>
          <button className="text-xs text-primary hover:text-primary-dark font-medium">Ver todo</button>
        </div>
        <div className="flex flex-col gap-2">
          {transactions.length > 0 ? transactions.slice(0, 5).map((tx) => {
            const Icon = CATEGORY_ICONS[tx.category] || HelpCircle;
            const isIncome = tx.type === 'income';
            return (
              <div key={tx.id} className="group flex items-center justify-between rounded-xl bg-surface-dark p-3 transition-colors hover:bg-border-dark border border-transparent hover:border-border-hover">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-border-dark group-hover:bg-border-hover group-hover:text-white transition-colors ${isIncome ? 'text-primary' : 'text-text-muted'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white leading-none mb-1">{tx.title}</p>
                    <p className="text-xs text-text-muted">{formatShortDate(tx.date?.toDate() || new Date())}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {deletingId === tx.id ? (
                    <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                      <button 
                        onClick={() => setDeletingId(null)} 
                        className="text-xs font-medium text-text-muted hover:text-white transition-colors px-2 py-1.5 rounded-md hover:bg-background-dark"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={() => handleDelete(tx.id)} 
                        className="text-xs font-medium bg-accent-red text-white px-2 py-1.5 rounded-md hover:bg-red-600 transition-colors"
                      >
                        Borrar
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className={`font-mono text-sm font-medium ${isIncome ? 'text-primary' : 'text-accent-red'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency, privateMode)}
                      </span>
                      <button 
                        onClick={() => setDeletingId(tx.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-all ml-1"
                        title="Borrar transacción"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8 text-text-muted text-sm bg-surface-dark rounded-xl border border-border-dark">
              No hay transacciones aún.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
