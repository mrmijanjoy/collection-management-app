import React, { useCallback } from 'react';
import { useTheme } from '../context/theme';
import { FaSun, FaMoon } from 'react-icons/fa';


const ThemeToggle = React.memo(() => {
  const { theme, toggleTheme } = useTheme();

  const handleClick = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const iconColor = theme === 'light' ? '#000' : '#fff';

  return (
    <button className="theme-toggle-button" onClick={handleClick}>
      {theme === 'light' ? (
        <FaMoon color={iconColor} />
      ) : (
        <FaSun color={iconColor} />
      )}
    </button>
  );
});

export default ThemeToggle;
