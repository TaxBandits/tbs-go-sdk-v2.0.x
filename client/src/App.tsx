import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import OverviewPage from './components/OverviewPage';
import AddressBookPage from './components/AddressBookPage';
import OAuthPage from './components/OAuthPage';
import Form1099SeriesPage from './components/Form1099SeriesPage';

export default function App() {
  const [user, setUser] = useState<{ username: string } | null>(null);

  const handleLogin = (username: string) => {
    setUser({ username });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div id="app-root">
        <Routes>
          {/* Public Route */}
          <Route 
            path="/login" 
            element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />} 
          />

          {/* Protected Routes */}
          <Route 
            path="/" 
            element={user ? <Dashboard username={user.username} onLogout={handleLogout} /> : <Navigate to="/login" />}
          >
            <Route index element={<OverviewPage />} />
            <Route path="address-book" element={<AddressBookPage />} />
            <Route path="oauth" element={<OAuthPage />} />
            <Route path="form-1099-series" element={<Form1099SeriesPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
