import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { X } from 'lucide-react';

interface TransactionModalProps {
  onClose: () => void;
}

const CATEGORIES = ['Vivienda', 'Comida', 'Ocio', 'Transporte', 'Compras', 'Nómina', 'Otros'];

export default function TransactionModal({ onClose }: TransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Comida');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !amount || !title) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: auth.currentUser.uid,
        amount: parseFloat(amount),
        type,
        category,
        title,
        date: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      onClose();
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Error al guardar la transacción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface-dark border border-border-dark rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border-dark">
          <h3 className="text-lg font-semibold text-white">Nueva Transacción</h3>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-white hover:bg-border-dark rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Type Selector */}
          <div className="flex p-1 bg-background-dark rounded-xl border border-border-dark">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${type === 'expense' ? 'bg-accent-red text-white shadow-md' : 'text-text-muted hover:text-white'}`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${type === 'income' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-white'}`}
            >
              Ingreso
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Cantidad (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="0.00"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Concepto</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Ej. Compra semanal"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 mt-2"
          >
            {loading ? 'Guardando...' : 'Guardar Transacción'}
          </button>
        </form>
      </div>
    </div>
  );
}
