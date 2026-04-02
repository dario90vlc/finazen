import { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency, formatShortDate } from '../lib/utils';
import { CATEGORY_ICONS } from '../lib/constants';
import { HelpCircle, Search, Trash2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { db } from '../firebase';
import { deleteDoc, doc } from 'firebase/firestore';

export default function TransactionsList() {
  const { transactions, loading } = useTransactions();
  const { privateMode, currency } = useSettings();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-text-muted">Cargando...</div>;
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
      setDeletingId(null);
    } catch (error) {
      console.error("Error deleting transaction", error);
    }
  };

  const filtered = transactions.filter(tx => {
    if (filter !== 'all' && tx.type !== filter) return false;
    if (search && !tx.title.toLowerCase().includes(search.toLowerCase()) && !tx.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Transacciones</h2>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-dark border border-border-dark rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex bg-surface-dark border border-border-dark rounded-xl p-1">
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === 'all' ? 'bg-border-dark text-white' : 'text-text-muted'}`}>Todas</button>
          <button onClick={() => setFilter('income')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === 'income' ? 'bg-border-dark text-primary' : 'text-text-muted'}`}>Ingresos</button>
          <button onClick={() => setFilter('expense')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === 'expense' ? 'bg-border-dark text-accent-red' : 'text-text-muted'}`}>Gastos</button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.length > 0 ? filtered.map((tx) => {
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
                  <p className="text-xs text-text-muted">{tx.category} • {formatShortDate(tx.date?.toDate() || new Date())}</p>
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
          <div className="text-center py-12 text-text-muted text-sm bg-surface-dark rounded-xl border border-border-dark">
            No se encontraron transacciones.
          </div>
        )}
      </div>
    </div>
  );
}
