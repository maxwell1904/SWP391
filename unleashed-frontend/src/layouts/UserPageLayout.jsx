import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Grid } from '@mui/material';
import UserSideMenu from '../components/menus/UserMenu';

const UserPageLayout = () => {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={3}>
                    <UserSideMenu />
                </Grid>
                <Grid item xs={12} md={9}>
                    <Outlet />
                </Grid>
            </Grid>
        </Container>
    );
};

export default UserPageLayout;