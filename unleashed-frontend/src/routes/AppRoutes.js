import { Route, Routes, useNavigate, Navigate } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import DashboardLayout from '../layouts/DashboardLayout'
import DashboardStockTransactions from '../pages/Dashboard/DashboardStockTransactions'
import DashboardEditAccount from '../pages/Dashboard/DashboardEditAccount'
import DashboardAccounts from '../pages/Dashboard/DashboardAccount'
import DashboardAccountDetailPage from '../pages/Dashboard/DashboardAccountDetailPage'
import DashboardWarehouseDetail from '../pages/Dashboard/DashboardWarehouseDetail'
import DashboardWarehouse from '../pages/Dashboard/DashboardWarehouse'
import DashboardEditBrand from '../pages/Dashboard/DashboardEditBrand'
import DashboardCreateBrand from '../pages/Dashboard/DashboardCreateBrand'
import DashboardBrands from '../pages/Dashboard/DashboardBrands'
import DashboardBrandDetailPage from '../pages/Dashboard/DashboardBrandDetailPage';
import DashboardEditCategory from '../pages/Dashboard/DashboardEditCategory'
import DashboardCategoryDetailPage from '../pages/Dashboard/DashboardCategoryDetailPage';
import DashboardProviderDetailPage from '../pages/Dashboard/DashboardProviderDetailPage';
import DashboardCreateCategory from '../pages/Dashboard/DashboardCreateCategory'
import DashboardCategories from '../pages/Dashboard/DashboardCategories'
import { ErrorNotFound } from '../pages/NotFound/404NotFound'
import CheckoutPage from '../pages/CartAndPay/Checkout'
import { ProtectedRoute } from './ProtectedRoute'
import UserProfile from '../pages/User/UserSettings'
import RegisterSuccess from '../pages/Register/RegisterSuccess'
import ProductDetailPage from '../pages/Home/ProductDetail'
import {ConfirmRegister } from '../pages/Register/ConfirmRegister'
import ForgotSuccess from '../pages/Forgot/ForgotPasswordSuccess'
import ResetSuccessPage from '../pages/ResetPassword/ResetSuccess'
import ResetPasswordPage from '../pages/ResetPassword/ResetPassword'
import ForgotPassword from '../pages/Forgot/ForgotPassword'
import Register from '../pages/Register/Register'
import { Login } from '../pages/Login/Login'
import { About } from '../pages/Home/About'
import Shop from '../pages/Home/Shop'
import Logout from '../pages/Login/Logout'
import Dashboard from '../pages/Dashboard/Dashboard'
import UserChangePassword from '../pages/User/UserChangePassword'
import DiscountPage from '../pages/Discount/Discounts'
import DashboardSales from '../pages/Dashboard/DashboardSales'
import DashboardCreateStaffAccount from '../pages/Dashboard/DashboardCreateStaffAccount'
import DashboardViewSaleProduct from '../pages/Dashboard/DashboardViewSaleProduct'
import DashboardCreateSale from '../pages/Dashboard/DashboardCreateSale'
import DashboardEditSale from '../pages/Dashboard/DashboardEditSale'
import DashboardAddProductToSale from '../pages/Dashboard/DashboardAddProductToSale'
import DashboardNotifications from '../pages/Dashboard/DashboardNotifications'
import DashboardNotificationDetailPage from '../pages/Dashboard/DashboardNotificationDetailPage';
import DashboardCreateNotification from '../pages/Dashboard/DashboardCreateNotification'
import DashboardDiscounts from '../pages/Dashboard/DashboardDiscounts.js'
import DashboardCreateDiscount from '../pages/Dashboard/DashboardCreateDiscount.js'
import DashboardEditDiscount from '../pages/Dashboard/DashboardEditDiscount.js'
import DashboardProducts from '../pages/Dashboard/DashboardProducts.js'
import DashboardOrders from '../pages/Dashboard/DashboardOrders.js'
import DashboardOrderDetailPage from '../pages/Dashboard/DashboardOrderDetailPage.jsx'
import OrderPage from '../pages/Order/Order.jsx'
import DashboardProductVariations from '../pages/Dashboard/DashboardProductVariations.js'
import DashboardAddProducts from '../pages/Dashboard/DashboardAddProducts.js'
import DashboardImportProducts from '../pages/Dashboard/DashboardImportProducts.js'
import OrderDetail from '../pages/Order/OrderDetail.jsx'
import DashboardViewUserDiscount from '../pages/Dashboard/DashboardViewUserDiscount.js'
import DashboardAddAccountToDiscount from '../pages/Dashboard/DashboardAddAccountToDiscount.js'
import DashboardEditProduct from '../pages/Dashboard/DashboardEditProduct.js'
import DashboardAddProductVariations from '../pages/Dashboard/DashboardAddProductVariations.js'
import DashboardEditProductVariation from '../pages/Dashboard/DashboardEditProductVariation.js'
import DashboardProviders from '../pages/Dashboard/DashboardProviders.js'
import DashboardCreateProvider from '../pages/Dashboard/DashboardCreateProvider.js'
import DashboardEditProvider from '../pages/Dashboard/DashboardEditProvider.js'
import OrderSuccess from '../pages/Order/OrderSuccess.jsx'
import OrderFail from '../pages/Order/OrderFail.jsx'
import OrderBankTransfer from '../pages/Order/OrderBankTransfer.jsx'
import PaymentOptions from '../pages/footer/PaymentOptions.jsx'
import ReturnOrder from '../pages/footer/ReturnOrder.jsx'
import PrivacyPolicies from '../pages/footer/PrivacyPolicies.jsx'
import SearchResultsPage from '../pages/SearchResult/SearchResultsPage.jsx'
import DiscountDetailPage from '../pages/Discount/DiscountDetailPage'
import Membership from '../pages/User/Membership.jsx'
import AllReviewsPage from '../pages/AllReviewsPage/AllReviewsPage'
import DashboardMembership from '../pages/Dashboard/DashboardMembership.jsx'
import ReviewHistory from '../pages/User/HistoryReviews.jsx'
import WishlistPage from '../pages/Wishlist/Wishlist.jsx'
import DashboardReview from '../pages/Dashboard/DashboardReview.jsx'
import DashboardReviewProduct from '../pages/Dashboard/DashboardReviewProduct.jsx'
import { useEffect } from 'react'
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader'
import { checkStatus } from '../service/AuthService.js'
import NotificationPage from '../pages/User/NotificationPage';
import NotificationDetailPage from '../pages/Notification/NotificationDetail';
import DashboardAssignDiscount from '../pages/Dashboard/DashboardAssignDiscount';
import UserPageLayout from '../layouts/UserPageLayout.jsx';


const AppRoutes = ({ toggleSidebar, isOpen }) => {
    const token = useAuthHeader();
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            const checkUserStatus = async () => {
                try {
                    await checkStatus(token);
                } catch (error) {
                    window.location.reload(true)
                    navigate("/")
                }
            };

            checkUserStatus();
            const intervalId = setInterval(checkUserStatus, 60000);

            return () => clearInterval(intervalId);
        }
    }, [navigate, token]);

    return (
        <Routes>
            <Route path='/' element={<Navigate to="/shop" replace />} />
            <Route path='/shop' element={<ProtectedRoute types={['GUEST', 'CUSTOMER']}><Shop /></ProtectedRoute>} />
            <Route path='/reviews/product/:productId' element={<ProtectedRoute types={['GUEST', 'CUSTOMER']}><AllReviewsPage /></ProtectedRoute>} />
            <Route path='/search' element={<ProtectedRoute types={['GUEST', 'CUSTOMER']}><SearchResultsPage /></ProtectedRoute>} />
            <Route path='/about' element={<ProtectedRoute types={['GUEST', 'CUSTOMER']}><About /></ProtectedRoute>} />
            <Route path='/payment-options' element={<ProtectedRoute types={['GUEST', 'CUSTOMER']}><PaymentOptions /></ProtectedRoute>} />
            <Route path='/return' element={<ProtectedRoute types={['GUEST', 'CUSTOMER']}><ReturnOrder /></ProtectedRoute>} />
            <Route path='/privacy-policies' element={<ProtectedRoute types={['GUEST', 'CUSTOMER']}><PrivacyPolicies /></ProtectedRoute>} />
            <Route path='/login' element={<ProtectedRoute types={['GUEST']}><Login /></ProtectedRoute>} />
            <Route path='/register' element={<ProtectedRoute types={['GUEST']}><Register /></ProtectedRoute>} />
            <Route path='/forgotPassword' element={<ProtectedRoute types={['GUEST']}><ForgotPassword /></ProtectedRoute>} />
            <Route path='/reset-password' element={<ResetPasswordPage />} />
            <Route path='/reset-password/success' element={<ResetSuccessPage />} />
            <Route path='/staff/activate-password' element={<ResetPasswordPage />} />
            <Route path='/staff/activate-password/success' element={<ResetSuccessPage />} />
            <Route path='/logout' element={<ProtectedRoute types={['CUSTOMER']}><Logout /></ProtectedRoute>} />
            <Route path='/orders/success' element={<ProtectedRoute types={['CUSTOMER']}><OrderSuccess /></ProtectedRoute>} />
            <Route path='/orders/bankTransfer' element={<ProtectedRoute types={['CUSTOMER']}><OrderBankTransfer /></ProtectedRoute>} />
            <Route path='/orders/error' element={<ProtectedRoute types={['CUSTOMER']}><OrderFail /></ProtectedRoute>} />
            <Route path='/user/orders/me/:orderId' element={<ProtectedRoute types={['CUSTOMER']}><OrderDetail /></ProtectedRoute>} />
            <Route path='/forgotPassword/success' element={<ForgotSuccess />} />
            <Route path='/register/confirm-registration' element={<ProtectedRoute types={['REGISTER']}><ConfirmRegister /></ProtectedRoute>} />
            <Route path='/confirm-registration/success' element={<ProtectedRoute types={['REGISTER']}><RegisterSuccess /></ProtectedRoute>} />
            <Route path='/shop/product/:id' element={<ProductDetailPage />} />
            <Route path='/checkout' element={<ProtectedRoute types={['CUSTOMER']}><CheckoutPage /></ProtectedRoute>} />

            <Route element={<ProtectedRoute types={['CUSTOMER']}><UserPageLayout /></ProtectedRoute>}>
                <Route path='/user/information' element={<UserProfile />} />
                <Route path='/user/orders' element={<OrderPage />} />
                <Route path='/user/histoty-review' element={<ReviewHistory />} />
                <Route path='/user/discounts' element={<DiscountPage />} />
                <Route path='/user/discounts/:discountId' element={<DiscountDetailPage />} />
                <Route path='/user/notifications' element={<NotificationPage />} />
                <Route path='/user/notifications/:notificationId' element={<NotificationDetailPage />} />
                <Route path='/user/wish-list' element={<WishlistPage />} />
                <Route path='/user/changePassword' element={<UserChangePassword />} />
            </Route>

            <Route path='/Dashboard' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><Dashboard /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Categories' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardCategories /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Categories/:categoryId' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardCategoryDetailPage /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Providers' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardProviders /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Providers/:providerId' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardProviderDetailPage /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Providers/Create' element={<PrivateRoute requiredRoles={['ADMIN']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardCreateProvider /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Providers/Edit/:providerId' element={<PrivateRoute requiredRoles={['ADMIN']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardEditProvider /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Categories/Create' element={<PrivateRoute requiredRoles={['ADMIN']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardCreateCategory /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Categories/Edit/:categoryId' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardEditCategory /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Brands' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardBrands /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Brands/:brandId' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardBrandDetailPage /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Brands/Create' element={<PrivateRoute requiredRoles={['ADMIN']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardCreateBrand /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Brands/Edit/:brandId' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardEditBrand /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Warehouse' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardWarehouse /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Warehouse/:stockId' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardWarehouseDetail /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Accounts' element={<PrivateRoute requiredRoles={['ADMIN']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardAccounts /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Accounts/:userId' element={<PrivateRoute requiredRoles={['ADMIN']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardAccountDetailPage /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Accounts/Edit/:userId' element={<PrivateRoute requiredRoles={['ADMIN']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardEditAccount /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Accounts/Create' element={<PrivateRoute requiredRoles={['ADMIN']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardCreateStaffAccount /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/StockTransactions' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardStockTransactions /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Sales' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardSales /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Sales/:saleId' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardViewSaleProduct /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Sales/Create' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardCreateSale /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Sales/Edit/:saleId' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardEditSale /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Sales/:saleId/AddProduct' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardAddProductToSale /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Notifications' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardNotifications /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Notifications/:notificationId' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardNotificationDetailPage /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Notifications/Create' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardCreateNotification /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Discounts' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardDiscounts /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Discounts/:discountId' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardViewUserDiscount /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Discounts/:discountId/AddAccount' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardAddAccountToDiscount /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Discounts/:discountId/Assign' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardAssignDiscount /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Discounts/Create' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardCreateDiscount /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Discounts/Edit/:discountId' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardEditDiscount /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Products' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardProducts /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Products/:productId' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardProductVariations /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Products/Add' element={<PrivateRoute requiredRoles={['ADMIN']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardAddProducts /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Products/:productId/Add' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardAddProductVariations /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Products/Edit/:productId' element={<PrivateRoute requiredRoles={['ADMIN']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardEditProduct /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Products/:productId/Edit/:productVariationId' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardEditProductVariation /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Warehouse/:stockId/Import' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardImportProducts /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Orders' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardOrders /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Orders/:orderId' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardOrderDetailPage /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Logout' element={<Logout isDashboard={true} />} />
            <Route path='/Dashboard/Product-Reviews' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardReview /></DashboardLayout></PrivateRoute>} />
            <Route path='/Dashboard/Product-Reviews/:productId' element={<PrivateRoute requiredRoles={['ADMIN', 'STAFF']}><DashboardLayout toggleSidebar={toggleSidebar} isOpen={isOpen}><DashboardReviewProduct /></DashboardLayout></PrivateRoute>} />

            <Route path='*' element={<ErrorNotFound />} />
        </Routes>
    )
}

export default AppRoutes;