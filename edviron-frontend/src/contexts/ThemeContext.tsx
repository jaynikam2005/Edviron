import React from 'react';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};
