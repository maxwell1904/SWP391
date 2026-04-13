import React, { useState } from 'react'
import { FaBars, FaCog, FaSignOutAlt, FaTimes } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { Box, Typography, IconButton, Tooltip } from '@mui/material'
import Sidebar from '../components/sidebars/Sidebar'
import Breadcrumb from '../components/breadcrumb/Breadcrumbs'
import useAuthUser from 'react-auth-kit/hooks/useAuthUser'
import userDefault from '../assets/images/userdefault.webp'
import ManagerSettings from '../pages/User/ManagerSettings'

const DashboardLayout = ({ toggleSidebar, isOpen, children }) => {
    const authUser = useAuthUser()

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
    const [userImage, setUserImage] = useState(
        localStorage.getItem('userImage') || authUser.userImage || userDefault
    )
    const [fullName, setFullName] = useState(
        localStorage.getItem('userFullName') || authUser.userFullName
    )

    const openSettingsModal = () => setIsSettingsModalOpen(true)
    const closeSettingsModal = () => setIsSettingsModalOpen(false)

    return (
        <div className='flex h-screen bg-gray-100'>
            <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

            <div className='flex-1 flex flex-col'>
                <header className='flex justify-between items-center p-4 bg-white border-b border-gray-200'>
                    <div className='flex items-center gap-4'>
                        <button onClick={toggleSidebar} className='text-gray-600 hover:text-gray-900'>
                            {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                        </button>
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Breadcrumb />
                        </Box>
                    </div>

                    <div className='flex items-center gap-4'>
						<span
                            className={`font-medium px-3 py-1 rounded-full text-sm ${
                                authUser.role === 'STAFF'
                                    ? 'text-yellow-800 bg-yellow-100'
                                    : authUser.role === 'ADMIN'
                                        ? 'text-red-800 bg-red-100'
                                        : 'text-gray-800 bg-gray-100'
                            }`}
                        >
							{authUser.role}
						</span>

                        <div className='flex items-center space-x-3'>
                            <img src={userImage} alt='User' className='w-10 h-10 rounded-full object-cover' />
                            <Box>
                                <Typography variant="body1" fontWeight="bold" lineHeight={1.2}>{fullName}</Typography>
                                <Typography variant="body2" color="text.secondary" lineHeight={1.2}>{authUser.username}</Typography>
                            </Box>
                        </div>

                        <Tooltip title="Settings">
                            <IconButton onClick={openSettingsModal} size="medium" sx={{ color: 'text.secondary' }}>
                                <FaCog />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Log Out">
                            <IconButton component={Link} to="/Dashboard/Logout" size="medium" sx={{ color: 'error.main' }}>
                                <FaSignOutAlt />
                            </IconButton>
                        </Tooltip>
                    </div>
                </header>

                <ManagerSettings
                    open={isSettingsModalOpen}
                    onClose={closeSettingsModal}
                    onImageUpdate={(newImage) => setUserImage(newImage)}
                    onFullNameUpdate={(newFullName) => setFullName(newFullName)}
                />

                <main className='flex-1 p-6 overflow-auto'>
                    {children}
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout