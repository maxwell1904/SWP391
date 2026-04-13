import React, { useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { IoCartOutline, IoSearchOutline } from "react-icons/io5";
import { useCart } from "react-use-cart";
import superlogo from "../../assets/images/superlogo.png";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import LoggedMenu from "../menus/LoggedMenu";
import GuessMenu from "../menus/GuessMenu";
import CartDrawer from "../Cart/CartDrawer";
import { Badge, IconButton, Tooltip } from "@mui/material";
import NotificationIcon from "../menus/NotificationMenu";
import SearchBar from "../Search/SearchBar";
import { useSearchBar } from "../hooks/SearchHook";

export function Navbar() {
  const dropdownRef = useRef(null);
  const isAuth = useIsAuthenticated();

  const [isCartOpen, setIsCartOpen] = useState(false);

  const { toggleSearchBar } = useSearchBar();

  const { totalItems } = useCart();

  const toggleCartDrawer = (open) => () => {
    setIsCartOpen(open); // Open or close the CartDrawer
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="absolute inset-0 border-b border-white/10 bg-black/65 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl"></div>

      <div className="navitem relative z-10 grid min-h-[96px] grid-cols-2 items-center px-4 md:min-h-[104px] md:grid-cols-3 md:px-8 lg:px-12">

        <div className="nav-left flex items-center justify-start">
          <NavLink to="/" className="flex items-center">
            <img
              src={superlogo}
              alt="Logo"
              className="block h-14 w-auto object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)] md:h-20"
            />
          </NavLink>
        </div>

        <div className="nav-center justify-center hidden md:flex">
          <ul className="flex space-x-6 md:space-x-20 items-center">

            {/*<li>*/}
            {/*  <NavLink*/}
            {/*    to="/"*/}
            {/*    className={({ isActive }) =>*/}
            {/*      `font-poppins text-sm md:text-base hover:text-base-300 transition duration-300 relative ${*/}
            {/*        isActive ? "text-base-300" : ""*/}
            {/*      }`*/}
            {/*    }*/}
            {/*  >*/}
            {/*    Home*/}
            {/*    <span*/}
            {/*      className={({ isActive }) =>*/}
            {/*        `absolute left-0 bottom-[-2px] w-full h-[2px] bg-base-300 transition-transform duration-300 ${*/}
            {/*          isActive ? "scale-x-100" : "scale-x-0"*/}
            {/*        }`*/}
            {/*      }*/}
            {/*    ></span>*/}
            {/*  </NavLink>*/}
            {/*</li>*/}

            <li>
              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `font-poppins text-sm text-white/80 hover:text-[#ff4d4d] transition duration-300 relative ${
                    isActive ? "text-[#ff4d4d]" : ""
                  }`
                }
              >
                Shop
                <span
                  className={({ isActive }) =>
                    `absolute left-0 bottom-[-4px] w-full h-[2px] bg-[#ff4d4d] transition-transform duration-300 ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`
                  }
                ></span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `font-poppins text-sm text-white/80 hover:text-[#ff4d4d] transition duration-300 relative ${
                    isActive ? "text-[#ff4d4d]" : ""
                  }`
                }
              >
                About
                <span
                  className={({ isActive }) =>
                    `absolute left-0 bottom-[-4px] w-full h-[2px] bg-[#ff4d4d] transition-transform duration-300 ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`
                  }
                ></span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `font-poppins text-sm text-white/80 hover:text-[#ff4d4d] transition duration-300 relative ${
                    isActive ? "text-[#ff4d4d]" : ""
                  }`
                }
              >
                Contact
                <span
                  className={({ isActive }) =>
                    `absolute left-0 bottom-[-4px] w-full h-[2px] bg-[#ff4d4d] transition-transform duration-300 ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`
                  }
                ></span>
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="nav-right col-span-1 flex items-center justify-end space-x-2 md:space-x-6">
          {isAuth && <NotificationIcon />}
          {isAuth ? (
            <div className="dropdown dropdown-bottom" ref={dropdownRef}>
              <LoggedMenu />
            </div>
          ) : (
            <GuessMenu />
          )}

          <div className="searchBtn hover:text-base-300 transition duration-300">
            <Tooltip title="Ctrl + F">
              <IconButton onClick={toggleSearchBar}>
                <IoSearchOutline className="text-2xl md:text-3xl text-white" />
              </IconButton>
            </Tooltip>
          </div>

          {/* Cart Button */}
          <div className="cartBtn hover:text-base-300 transition duration-300">
            <IconButton onClick={toggleCartDrawer(true)}>
              <Badge color="secondary" badgeContent={totalItems}>
                <IoCartOutline className="text-2xl md:text-3xl text-white" />
              </Badge>
            </IconButton>
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isCartOpen={isCartOpen} toggleCartDrawer={toggleCartDrawer} />

        <SearchBar />
    </nav>
  );
}
