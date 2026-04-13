import React, { useState } from "react";
import { AiOutlineLock } from "react-icons/ai";
import { FaRegUser } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import { CiUser } from "react-icons/ci";
import { ListItemIcon, ListItemText } from "@mui/material";

const GuessMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        aria-controls="guess-menu"
        aria-haspopup="true"
        onClick={handleMenuOpen}
        color="inherit"
      >
        <CiUser className="text-4xl text-white" />
      </IconButton>
      <Menu
        id="guess-menu"
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        disableScrollLock={true}
        sx={{
          borderRadius: "30px", // Apply rounded corners
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Optional: adds a slight shadow
        }}
      >
        <MenuItem onClick={handleMenuClose} component={Link} to="/login">
          <ListItemIcon sx={{ fontSize: "1.70rem", minWidth: "40px" }}>
            <FaRegUser className="text-3xl" />
          </ListItemIcon>
          <ListItemText primary="Login" />
        </MenuItem>
        <MenuItem onClick={handleMenuClose} component={Link} to="/register">
          <ListItemIcon sx={{ fontSize: "1.70rem", minWidth: "40px" }}>
            <FiUsers className="text-3xl" />
          </ListItemIcon>
          <ListItemText primary="Register"/>
        </MenuItem>
        <MenuItem
          onClick={handleMenuClose}
          component={Link}
          to="/forgotPassword"
        >
          <ListItemIcon sx={{ fontSize: "1.7rem", minWidth: "40px" }}>
            <AiOutlineLock className="text-3xl" />
          </ListItemIcon>
          <ListItemText primary="Forgot Password" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default GuessMenu;
