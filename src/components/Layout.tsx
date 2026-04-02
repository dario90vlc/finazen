import { ReactNode } from 'react';
import { Wallet, Bell, Plus, LayoutDashboard, Receipt, QrCode, PieChart, Settings } from 'lucide-react';
import { auth } from '../firebase';

interface LayoutProps {
  children: ReactNode;
  onNewTransaction: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Layout({ children, onNewTransaction, activeTab, onTabChange }: LayoutProps) {
  const user = auth.currentUser;
  const firstName = user?.displayName?.split(' ')[0] || 'Usuario';

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden">
      {/* Header Section */}
      <header className="sticky top-0 z-20 bg-background-dark/95 backdrop-blur-md border-b border-border-dark px-4 pt-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/20">
              <Wallet className="text-white h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">FinanZen</h1>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-dark hover:bg-border-dark transition-colors">
            <Bell className="text-text-muted h-5 w-5" />
          </button>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-text-muted mb-1">Buenas tardes,</p>
            <h2 className="text-2xl font-bold leading-tight text-white">{firstName}</h2>
          </div>
          <button 
            onClick={onNewTransaction}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full font-medium text-sm transition-all shadow-lg shadow-primary/25 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span>Nueva</span>
          </button>
        </div>
      </header>

      {/* Main Content Scroll Area */}
      <main className="flex-1 px-4 py-6 pb-24 space-y-6">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-dark bg-background-dark/95 backdrop-blur-lg pb-safe pt-2">
        <div className="flex justify-around items-center px-4 pb-4">
          <button onClick={() => onTabChange('dashboard')} className="group flex flex-col items-center gap-1 min-w-[60px]">
            <LayoutDashboard className={`transition-colors h-6 w-6 ${activeTab === 'dashboard' ? 'text-primary' : 'text-text-muted group-hover:text-white'}`} />
            <span className={`text-[10px] font-medium ${activeTab === 'dashboard' ? 'text-primary' : 'text-text-muted group-hover:text-white'}`}>Inicio</span>
          </button>
          <button onClick={() => onTabChange('transactions')} className="group flex flex-col items-center gap-1 min-w-[60px]">
            <Receipt className={`transition-colors h-6 w-6 ${activeTab === 'transactions' ? 'text-primary' : 'text-text-muted group-hover:text-white'}`} />
            <span className={`text-[10px] font-medium ${activeTab === 'transactions' ? 'text-primary' : 'text-text-muted group-hover:text-white'}`}>Trans.</span>
          </button>
          <div className="relative -top-5">
            <button onClick={onNewTransaction} className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 transition-transform active:scale-90 border-4 border-background-dark">
              <QrCode className="h-6 w-6" />
            </button>
          </div>
          <button onClick={() => onTabChange('budgets')} className="group flex flex-col items-center gap-1 min-w-[60px]">
            <PieChart className={`transition-colors h-6 w-6 ${activeTab === 'budgets' ? 'text-primary' : 'text-text-muted group-hover:text-white'}`} />
            <span className={`text-[10px] font-medium ${activeTab === 'budgets' ? 'text-primary' : 'text-text-muted group-hover:text-white'}`}>Presup.</span>
          </button>
          <button onClick={() => onTabChange('settings')} className="group flex flex-col items-center gap-1 min-w-[60px]">
            <Settings className={`transition-colors h-6 w-6 ${activeTab === 'settings' ? 'text-primary' : 'text-text-muted group-hover:text-white'}`} />
            <span className={`text-[10px] font-medium ${activeTab === 'settings' ? 'text-primary' : 'text-text-muted group-hover:text-white'}`}>Ajustes</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
