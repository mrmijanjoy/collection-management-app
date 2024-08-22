import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { auth } from '../firebase';

const ProfileIcon = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleClick = () => {
    if (!user) {
      navigate('/login');
    } else if (user && user.isAdmin) {
      navigate('/admin');
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="profile-icon" onClick={handleClick}>
      <FaUser size={24} />
    </div>
  );
};

export default ProfileIcon;
