import React, { useState } from 'react'
import {
	TextField,
	Button,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Slide,
	Box,
} from '@mui/material'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { ChangePassword } from '../../service/UserService' // ⚠️ Đổi lại từ UpdatePassword → ChangePassword

import { toast, Zoom } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader'
import useAuthUser from 'react-auth-kit/hooks/useAuthUser'

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction='up' ref={ref} {...props} />
})

const UserChangePassword = () => {
	const [open, setOpen] = useState(false)
	const authHeader = useAuthHeader()
	const authState = useAuthUser()
	const navigate = useNavigate()

	const handleClickOpen = () => {
		setOpen(true)
	}

	const handleClose = () => {
		setOpen(false)
	}

	const initialValues = {
		currentPassword: '',
		newPassword: '',
		confirmNewPassword: '',
	}

	const validationSchema = Yup.object().shape({
		currentPassword: Yup.string().required('Current password is required'),
		newPassword: Yup.string()
			.required('New password is required')
			.matches(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
				'Password must contain one uppercase, one lowercase, and one number'
			),
		confirmNewPassword: Yup.string()
			.oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
			.required('Please confirm your new password'),
	})

	const handleSubmit = async (values) => {
		try {
			const response = await ChangePassword(
				{
					userEmail: authState?.userEmail, // 🔥 Chắc chắn `userEmail` được gửi
					newPassword: values.newPassword,
					oldPassword: values.currentPassword,
				},
				authHeader
			)

			if (response?.data.statusCode === 200) {
				toast.success(response.data.message, {
					position: 'top-center',
					transition: Zoom,
				})
				handleClose()
				setTimeout(() => {
					toast.info('Please login again!', {
						position: 'top-center',
						transition: Zoom,
					})
					navigate('/logout')
				}, 3000)
			} else {
				toast.error(response?.data.message || 'Error changing password', {
					position: 'top-center',
					transition: Zoom,
				})
			}
		} catch (error) {
			toast.error(error?.response?.data?.message || 'Error changing password', {
				position: 'top-center',
				transition: Zoom,
			})
		}
	}

	return (
		<React.Fragment>
			<Button
				sx={{
					fontFamily: 'Montserrat',
					boxShadow: 'none',
					width: '170px',
					textTransform: 'none',
					borderRadius: '8px',
					backgroundColor: '#3f51b5',
					'&:hover': {
						backgroundColor: '#303f9f',
					},
				}}
				color='primary'
				variant='contained'
				onClick={handleClickOpen}
			>
				Change Password
			</Button>
			<Dialog
				open={open}
				onClose={handleClose}
				TransitionComponent={Transition}
				sx={{
					'& .MuiDialog-paper': {
						width: '400px',
						height: 'auto',
						borderRadius: '12px',
						padding: '20px',
						boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
					},
				}}
			>
				<DialogTitle sx={{ fontWeight: 600, color: '#333' }}>Change Password</DialogTitle>
				<DialogContent>
					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={handleSubmit}
					>
						{({ isSubmitting }) => (
							<Form>
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
									<Field name='currentPassword'>
										{({ field }) => (
											<TextField
												{...field}
												label='Enter current password'
												type='password'
												fullWidth
												variant='outlined'
												margin='normal'
												sx={{
													'& .MuiOutlinedInput-root': {
														borderRadius: '8px',
													},
												}}
											/>
										)}
									</Field>
									<ErrorMessage name='currentPassword'>
										{(msg) => (
											<Typography color='error' variant='body2'>
												{msg}
											</Typography>
										)}
									</ErrorMessage>

									<Field name='newPassword'>
										{({ field }) => (
											<TextField
												{...field}
												label='Enter new password'
												type='password'
												fullWidth
												variant='outlined'
												margin='normal'
												sx={{
													'& .MuiOutlinedInput-root': {
														borderRadius: '8px',
													},
												}}
											/>
										)}
									</Field>
									<ErrorMessage name='newPassword'>
										{(msg) => (
											<Typography color='error' variant='body2'>
												{msg}
											</Typography>
										)}
									</ErrorMessage>

									<Field name='confirmNewPassword'>
										{({ field }) => (
											<TextField
												{...field}
												label='Confirm new password'
												type='password'
												fullWidth
												variant='outlined'
												margin='normal'
												sx={{
													'& .MuiOutlinedInput-root': {
														borderRadius: '8px',
													},
												}}
											/>
										)}
									</Field>
									<ErrorMessage name='confirmNewPassword'>
										{(msg) => (
											<Typography color='error' variant='body2'>
												{msg}
											</Typography>
										)}
									</ErrorMessage>

									<DialogActions>
										<Button
											onClick={handleClose}
											color='secondary'
											sx={{
												fontWeight: 'bold',
												color: '#d32f2f',
												'&:hover': {
													backgroundColor: 'transparent',
													borderColor: '#d32f2f',
												},
											}}
										>
											Cancel
										</Button>
										<Button
											type='submit'
											variant='contained'
											color='primary'
											disabled={isSubmitting}
											sx={{
												fontWeight: 'bold',
												backgroundColor: '#3f51b5',
												'&:hover': {
													backgroundColor: '#303f9f',
												},
											}}
										>
											Change password
										</Button>
									</DialogActions>
								</Box>
							</Form>
						)}
					</Formik>
				</DialogContent>
			</Dialog>
		</React.Fragment>
	)
}

export default UserChangePassword
