import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionModal from './components/TransactionModal';
import TransactionsList from './components/TransactionsList';
import Budgets from './components/Budgets';
import Settings from './components/Settings';
import { SettingsProvider } from './contexts/SettingsContext';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check if user document exists, if not create it
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            name: currentUser.displayName || 'Usuario',
            email: currentUser.email,
            createdAt: serverTimestamp()
          });
        }
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <SettingsProvider>
      <Layout 
        onNewTransaction={() => setShowModal(true)} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      >
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'transactions' && <TransactionsList />}
        {activeTab === 'budgets' && <Budgets />}
        {activeTab === 'settings' && <Settings />}
      </Layout>
      {showModal && <TransactionModal onClose={() => setShowModal(false)} />}
    </SettingsProvider>
  );
}
