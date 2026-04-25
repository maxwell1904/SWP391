import React from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import superlogo from "../../assets/images/superlogo.png";
import {
  FaTags,
  FaList,
  FaBell,
  FaPercent,
  FaGift,
  FaWarehouse,
  FaFileInvoice,
  FaStar,
  FaUserGroup,
  FaBorderAll,
  FaCircleUser,
  FaRegStar,
} from "react-icons/fa6";

const MenuHeader = ({ title }) => (
  <li className="pt-4 pb-2 px-3">
    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {title}
    </span>
  </li>
);

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const authUser = useAuthUser();
  const userRole = authUser?.role;

  const getNavLinkClass = (path) =>
    clsx(
      "flex items-center p-3 rounded-lg transition-all duration-300 text-gray-700 relative",
      {
        "text-blue-500 cursor-default bg-gradient-to-r from-blue-100 to-transparent":
          location.pathname.startsWith(path),
        "hover:text-blue-500 hover:translate-x-2":
          !location.pathname.startsWith(path),
      },
    );

  const menuGroups = [
    {
      title: "Core Operations",
      items: [
        { to: "/Dashboard/Orders", icon: FaList, label: "Order Lists" },
        { to: "/Dashboard/Products", icon: FaBorderAll, label: "Products" },
        {
          to: "/Dashboard/Product-Reviews",
          icon: FaRegStar,
          label: "Product Reviews",
        },
      ],
    },
    {
      title: "Inventory & Logistics",
      items: [
        { to: "/Dashboard/Warehouse", icon: FaWarehouse, label: "Warehouse" },
        {
          to: "/Dashboard/StockHistory",
          icon: FaFileInvoice,
          label: "Stock History",
        },
        { to: "/Dashboard/Providers", icon: FaUserGroup, label: "Providers" },
      ],
    },
    {
      title: "Product Catalog",
      items: [
        { to: "/Dashboard/Categories", icon: FaTags, label: "Categories" },
        { to: "/Dashboard/Brands", icon: FaStar, label: "Brands" },
      ],
    },
    {
      title: "Communication",
      items: [
        {
          to: "/Dashboard/Notifications",
          icon: FaBell,
          label: "Notifications",
        },
      ],
    },
  ];

  if (userRole === "ADMIN") {
    menuGroups.splice(2, 0, {
      title: "Marketing & Promotions",
      items: [
        { to: "/Dashboard/Promotions", icon: FaGift, label: "Promotions" },
        { to: "/Dashboard/Vouchers", icon: FaPercent, label: "Vouchers" },
      ],
    });

    menuGroups.push({
      title: "Administration",
      items: [
        { to: "/Dashboard/Accounts", icon: FaCircleUser, label: "Accounts" },
      ],
    });
  }

  return (
    <div
      className={clsx(
        "bg-white shadow-lg h-screen transition-all duration-500 ease-in-out flex flex-col overflow-y-auto border-r border-gray-200",
        isOpen
          ? "max-w-[300px] w-full opacity-100"
          : "max-w-0 w-0 opacity-0 overflow-hidden",
      )}
    >
      {isOpen && (
        <>
          <div className="p-6">
            <Link
              to="/Dashboard"
              className="flex items-center justify-center p-4 rounded-lg font-bold text-4xl"
            >
              <img
                src={superlogo}
                alt="Unleashed logo"
                className="h-20 w-auto object-contain"
              />
            </Link>
          </div>

          <ul className="space-y-2 px-6 pb-6 flex-grow">
            {menuGroups.map((group) => (
              <React.Fragment key={group.title}>
                <MenuHeader title={group.title} />
                {group.items.map(({ to, icon: Icon, label }) => (
                  <li key={to}>
                    <Link to={to} className={getNavLinkClass(to)}>
                      {location.pathname.startsWith(to) && (
                        <span className="absolute left-0 h-full w-1 bg-blue-400 rounded-r-md"></span>
                      )}
                      <Icon
                        className={clsx("mr-3 text-lg", {
                          "text-blue-500": location.pathname.startsWith(to),
                        })}
                      />
                      <span
                        className={clsx({
                          "text-blue-500 font-semibold":
                            location.pathname.startsWith(to),
                        })}
                      >
                        {label}
                      </span>
                    </Link>
                  </li>
                ))}
              </React.Fragment>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Sidebar;
