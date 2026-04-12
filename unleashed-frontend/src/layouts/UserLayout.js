import React from "react";
import UserSideMenu from "../components/menus/UserMenu";
import { Grid2 } from "@mui/material";

const UserLayout = ({ children }) => {
  return (
    <Grid2>
      <Grid2 size={4}>
        <UserSideMenu />
      </Grid2>
      <Grid2 size={7}>{children}</Grid2>
    </Grid2>
  );
};

export default UserLayout;
