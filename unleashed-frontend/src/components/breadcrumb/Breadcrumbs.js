import React from "react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="text-sm font-medium text-gray-600">
      <ol className="list-reset flex">
        <li>
          <Link
            to="/Dashboard"
            className="text-gray-500 hover:underline"
          ></Link>
        </li>

        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={index} className="flex items-center">
              <span className="mx-2">/</span>

              {isLast || value === "Edit" ? (
                <span className="text-gray-500">{value}</span>
              ) : (
                <Link to={to} className="text-blue-600 hover:underline">
                  {value}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
