import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/Auth';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ProfilePage from './pages/Profile';
import Collections from './pages/Collections';
import CollectionDetailPage from './pages/CollectionDetailPage';
import Admin from './pages/Admin';
import Items from './pages/Items';
import SingleItemPage from './pages/SingleItemPage';
import SocialLogin from './components/SocialLogin';
import LanguageSwitcher from './components/languageSwitcher';
import ThemeToggle from './components/themeToggle';
import ExportToCSV from './components/ExportToCSV';
import ProfileIcon from './components/ProfileIcon';
import NavBar from './components/Navbar';
import './App.css';


const PrivateRoute = ({ element, ...rest }) => {
  const { currentUser } = AuthContext();
  const isAdmin = currentUser?.role === 'admin';

  if (rest.path === '/admin' && !isAdmin) {
    return <Navigate to="/" />;
  }

  if (rest.path === '/profile' && !currentUser) {
    return <Navigate to="/login" />;
  }

  return element;
};

const App = () => {
  return (
    <Router>
      <NavBar />
      <ProfileIcon />
      <LanguageSwitcher />
      <ThemeToggle />
      <ExportToCSV />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/items" element={<Items />} />
          <Route path="/items/:itemId" element={<SingleItemPage />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:collectionId" element={<CollectionDetailPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/social-login" element={<SocialLogin />} />
          <Route path="/admin" element={<PrivateRoute element={<Admin />} />} />
          <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
