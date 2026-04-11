import React from 'react';

export const UserForm = ({ children }) => {
  return (
    <div className="flex justify-center min-h-[calc(100vh-100px)] bg-base-100 overflow-x-hidden"> 
      <div className="bg-base-100 p-2 rounded w-full max-w-screen-md"> 
        {children}
      </div>
    </div>
  );
};