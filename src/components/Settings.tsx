import { useState } from 'react';
import { auth, logout, db } from '../firebase';
import { LogOut, Bell, Download, Trash2, Eye, EyeOff, CreditCard, AlertTriangle, Palette } from 'lucide-react';
import { useSettings, ThemeType } from '../contexts/SettingsContext';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function Settings() {
  const user = auth.currentUser;
  const { privateMode, setPrivateMode, currency, setCurrency, theme, setTheme } = useSettings();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportCSV = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const txs = snapshot.docs.map(d => d.data());
      
      let csv = 'Fecha,Concepto,Categoría,Tipo,Cantidad\n';
      txs.forEach(tx => {
        const date = tx.date?.toDate ? tx.date.toDate().toLocaleDateString() : '';
        csv += `${date},"${tx.title}","${tx.category}",${tx.type},${tx.amount}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'finanzen_export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteData = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'transactions', d.id)));
      await Promise.all(deletePromises);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting data", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const themes: { id: ThemeType, name: string, color: string }[] = [
    { id: 'emerald', name: 'Esmeralda', color: '#10b77f' },
    { id: 'blue', name: 'Océano', color: '#3b82f6' },
    { id: 'purple', name: 'Amatista', color: '#a855f7' },
    { id: 'rose', name: 'Carmesí', color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-white">Ajustes</h2>

      {/* Profile Card */}
      <div className="rounded-2xl bg-surface-dark border border-border-dark p-5 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {user?.displayName?.charAt(0) || 'U'}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{user?.displayName || 'Usuario'}</h3>
          <p className="text-sm text-text-muted">{user?.email}</p>
        </div>
      </div>

      {/* Preferencias */}
      <div>
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 ml-1">Preferencias</h3>
        <div className="rounded-2xl bg-surface-dark border border-border-dark overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border-dark">
            <div className="flex items-center gap-3 text-white">
              {privateMode ? <EyeOff className="h-5 w-5 text-text-muted" /> : <Eye className="h-5 w-5 text-text-muted" />}
              <span className="text-sm font-medium">Modo Privado</span>
            </div>
            <button 
              onClick={() => setPrivateMode(!privateMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privateMode ? 'bg-primary' : 'bg-background-dark border border-border-dark'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privateMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border-b border-border-dark">
            <div className="flex items-center gap-3 text-white">
              <CreditCard className="h-5 w-5 text-text-muted" />
              <span className="text-sm font-medium">Moneda Principal</span>
            </div>
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-background-dark border border-border-dark text-white text-sm rounded-lg px-2 py-1 focus:outline-none focus:border-primary"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="flex flex-col p-4 border-b border-border-dark">
            <div className="flex items-center gap-3 text-white mb-3">
              <Palette className="h-5 w-5 text-text-muted" />
              <span className="text-sm font-medium">Tema de Color</span>
            </div>
            <div className="flex gap-3 pl-8">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-transform ${theme === t.id ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-surface-dark' : 'hover:scale-110'}`}
                  style={{ backgroundColor: t.color }}
                  title={t.name}
                />
              ))}
            </div>
          </div>

          <button className="w-full flex items-center justify-between p-4 hover:bg-border-dark transition-colors">
            <div className="flex items-center gap-3 text-white">
              <Bell className="h-5 w-5 text-text-muted" />
              <span className="text-sm font-medium">Notificaciones</span>
            </div>
            <span className="text-xs text-text-muted bg-background-dark px-2 py-1 rounded-md">Activadas</span>
          </button>
        </div>
      </div>

      {/* Datos */}
      <div>
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 ml-1">Datos</h3>
        <div className="rounded-2xl bg-surface-dark border border-border-dark overflow-hidden">
          <button 
            onClick={handleExportCSV}
            disabled={isExporting}
            className="w-full flex items-center justify-between p-4 hover:bg-border-dark transition-colors border-b border-border-dark"
          >
            <div className="flex items-center gap-3 text-white">
              <Download className="h-5 w-5 text-text-muted" />
              <span className="text-sm font-medium">{isExporting ? 'Exportando...' : 'Exportar a CSV'}</span>
            </div>
          </button>
          
          {showDeleteConfirm ? (
            <div className="p-4 bg-accent-red/10">
              <div className="flex items-center gap-2 text-accent-red mb-3">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-medium">¿Borrar todas las transacciones?</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 text-sm font-medium text-white bg-border-dark rounded-lg hover:bg-border-hover"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDeleteData}
                  disabled={isDeleting}
                  className="flex-1 py-2 text-sm font-medium text-white bg-accent-red rounded-lg hover:bg-red-600"
                >
                  {isDeleting ? 'Borrando...' : 'Sí, borrar'}
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-accent-red/10 transition-colors group"
            >
              <div className="flex items-center gap-3 text-accent-red">
                <Trash2 className="h-5 w-5" />
                <span className="text-sm font-medium">Borrar todos los datos</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <button 
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 bg-border-dark hover:bg-accent-red/20 text-accent-red hover:text-accent-red p-4 rounded-2xl transition-colors font-medium border border-transparent hover:border-accent-red/30 mt-8"
      >
        <LogOut className="h-5 w-5" />
        Cerrar Sesión
      </button>

      {/* Footer credits */}
      <div className="pt-8 pb-4 text-center">
        <p className="text-xs text-text-muted">Versión 1.0.0</p>
        <p className="text-xs text-text-muted mt-1">Desarrollado con ♥ por <span className="font-semibold text-white">Dario Fernandez</span></p>
      </div>
    </div>
  );
}
