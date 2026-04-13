import React, { useEffect, useState } from 'react'
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material'
import { FaRegUserCircle } from 'react-icons/fa'
import { IoLogOutOutline } from 'react-icons/io5'
import { LuMousePointerClick } from 'react-icons/lu'
import { TbRosetteDiscount } from 'react-icons/tb'
import { Link, useLocation } from 'react-router-dom'
import userDefault from '../../assets/images/userdefault.webp'
import useAuthUser from 'react-auth-kit/hooks/useAuthUser'
import { RateReviewOutlined, FavoriteBorder, Notifications } from '@mui/icons-material'

const LoggedMenu = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const authUser = useAuthUser()
    const [profileImageUrl, setProfileImageUrl] = useState(authUser?.userImage || userDefault)
    const location = useLocation()

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (authUser?.userImage) {
                const isGoogleImage = authUser.userImage.startsWith('https://lh3.googleusercontent.com/')
                if (isGoogleImage) {
                    setProfileImageUrl(authUser.userImage)
                } else {
                    setProfileImageUrl(`${authUser.userImage}?t=${new Date().getTime()}`)
                }
            } else {
                setProfileImageUrl(userDefault)
            }
        }, 3000)

        return () => clearInterval(intervalId)
    }, [authUser])

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget)
        setIsMenuOpen(true)
    }

    const handleMenuClose = () => {
        setIsMenuOpen(false)
        setAnchorEl(null)
    }

    return (
        <>
            <IconButton
                aria-controls={isMenuOpen ? 'menu-appbar' : undefined}
                aria-haspopup='true'
                onClick={handleMenuOpen}
                color='inherit'
            >
                <img
                    src={profileImageUrl}
                    className='rounded-full w-6 md:w-8 h-6 md:h-8 object-cover'
                    loading='eager'
                    alt='Profile'
                    onError={(e) => {
                        e.target.onerror = null
                        e.target.src = userDefault
                    }}
                />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                PaperProps={{
                    style: {
                        borderRadius: 8,
                        minWidth: 220,
                    },
                }}
                MenuListProps={{
                    sx: {
                        maxHeight: '400px',
                        overflowY: 'auto',
                    },
                }}
            >
                <MenuItem component={Link} to='/user/information' onClick={handleMenuClose}>
                    <ListItemIcon sx={{ fontSize: '1.75rem', minWidth: '40px' }}>
                        <FaRegUserCircle className='text-3xl' />
                    </ListItemIcon>
                    <ListItemText primary='Account Settings' />
                </MenuItem>

                <MenuItem component={Link} to='/user/orders' onClick={handleMenuClose}>
                    <ListItemIcon sx={{ fontSize: '1.75rem', minWidth: '40px' }}>
                        <LuMousePointerClick className='text-3xl' />
                    </ListItemIcon>
                    <ListItemText primary='Orders' />
                </MenuItem>

                <MenuItem component={Link} to='/user/discounts' onClick={handleMenuClose}>
                    <ListItemIcon sx={{ fontSize: '1.75rem', minWidth: '40px' }}>
                        <TbRosetteDiscount className='text-3xl' />
                    </ListItemIcon>
                    <ListItemText primary='Discounts' />
                </MenuItem>

                <MenuItem component={Link} to='/user/histoty-review' onClick={handleMenuClose}>
                    <ListItemIcon sx={{ fontSize: '1.75rem', minWidth: '40px' }}>
                        <RateReviewOutlined className='text-3xl' />
                    </ListItemIcon>
                    <ListItemText primary='History Review' />
                </MenuItem>

                {/* This code will now work correctly */}
                <MenuItem
                    component={Link}
                    to="/user/notifications"
                    onClick={handleMenuClose}
                    selected={location.pathname === '/user/notifications'}
                >
                    <ListItemIcon sx={{ fontSize: '1.75rem', minWidth: '40px' }}>
                        <Notifications />
                    </ListItemIcon>
                    <ListItemText primary="Notifications" />
                </MenuItem>

                <MenuItem component={Link} to='/user/wish-list' onClick={handleMenuClose}>
                    <ListItemIcon sx={{ fontSize: '1.75rem', minWidth: '40px' }}>
                        <FavoriteBorder className='text-3xl' />
                    </ListItemIcon>
                    <ListItemText primary='Wishlist' />
                </MenuItem>

                <MenuItem component={Link} to='/logout' onClick={handleMenuClose}>
                    <ListItemIcon sx={{ fontSize: '1.75rem', minWidth: '40px' }}>
                        <IoLogOutOutline className='text-3xl' />
                    </ListItemIcon>
                    <ListItemText primary='Sign out' />
                </MenuItem>
            </Menu>
        </>
    )
}

export default LoggedMenu