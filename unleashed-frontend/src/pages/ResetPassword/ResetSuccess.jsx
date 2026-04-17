import { UserForm } from "../../layouts/LRFCLayout";
import success from "../../assets/images/success.svg";
import { AuthCommonBtn } from "../../components/buttons/Button";
import { useLocation, useNavigate } from "react-router-dom";

const ResetSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isStaffActivation = location.pathname.startsWith("/staff/activate-password");

    return(
        <UserForm>
            <div className="resetSuccess text-center flex flex-col pt-20 items-center space-y-10">
                <h1 className="font-poppins font-bold text-3xl">
                    {isStaffActivation ? "Staff Account Activated" : "Password Reset"}
                </h1>
                <img src={success} className="w-96" alt="" />
                <AuthCommonBtn
                    context={isStaffActivation ? "Go to login" : "Return to home page"}
                    handleClick={() => navigate(isStaffActivation ? "/login" : "/")}
                />
            </div>
        </UserForm>
    );
}
export default ResetSuccessPage;