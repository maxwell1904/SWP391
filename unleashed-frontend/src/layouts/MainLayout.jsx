import React from "react";

const MainLayout = ({ children }) => {
  return (
    <>
      <div className="mainLayout">
        {children}
      </div>
    </>
  );
};

export default MainLayout;
