import { Backdrop, Pagination, Box } from '@mui/material'
import { OrderList } from './OrderList'
import { useEffect, useState } from 'react'
import { getMyorders } from '../../service/UserService'
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader'
import { CircularProgress } from '@mui/material'

const OrderPage = () => {
    const [orderData, setOrderData] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const authHeader = useAuthHeader()

    const fetchOrders = async (page) => {
        setLoading(true)
        try {
            const response = await getMyorders(authHeader, page)
            const { orders, totalPages, currentPage } = response.data

            setOrderData(orders)
            setTotalPages(totalPages)
            setCurrentPage(currentPage)
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const savedPage = localStorage.getItem('currentPage')
        if (savedPage) {
            setCurrentPage(Number(savedPage))
        } else {
            setCurrentPage(0)
        }
    }, [])

    useEffect(() => {
        fetchOrders(currentPage)
        localStorage.setItem('currentPage', currentPage)
    }, [authHeader, currentPage])

    const handlePageChange = (event, page) => {
        setCurrentPage(page - 1)
    }

    return (
        <Box>
            {loading ? (
                <div className='flex justify-center items-center h-full'>
                    <Backdrop
                        sx={(theme) => ({
                            color: '#fff',
                            zIndex: theme.zIndex.drawer + 1,
                        })}
                        open={true}
                    >
                        <CircularProgress />
                    </Backdrop>
                </div>
            ) : orderData.length > 0 ? (
                <>
                    <OrderList OrderList={orderData} />
                    <div className='pagination-controls max-w-[800px] flex justify-center py-4'>
                        <Pagination
                            count={totalPages}
                            page={currentPage + 1}
                            onChange={handlePageChange}
                            shape='rounded'
                            color='primary'
                        />
                    </div>
                </>
            ) : (
                <div className='text-center max-w-[800px] py-4 font-montserrat'>No orders available!</div>
            )}
        </Box>
    )
}

export default OrderPage