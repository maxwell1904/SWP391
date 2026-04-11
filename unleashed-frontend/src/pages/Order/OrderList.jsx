import React from 'react'
import OrderItemCard from './OrderItem'

export const OrderList = ({ OrderList }) => {
	if (!Array.isArray(OrderList) || OrderList.length === 0) {
		return <div className='text-center py-4'>No orders available.</div>
	}

	return (
		<div className='oList'>
			{OrderList.map((Order) => (
				<div key={Order.orderId} className='item py-3'>
					<OrderItemCard Order={Order} />
				</div>
			))}
		</div>
	)
}
