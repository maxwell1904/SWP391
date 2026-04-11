import { UserForm } from "../../layouts/LRFCLayout";
import success from "../../assets/images/success.svg";
import { AuthCommonBtn } from "../../components/buttons/Button";
import { useNavigate } from "react-router-dom";

const ResetSuccessPage = () => {
    const navigate = useNavigate();

    return(
        <UserForm>
            <div className="resetSuccess text-center flex flex-col pt-20 items-center space-y-10">
                <h1 className="font-poppins font-bold text-3xl">Password Reset</h1>
                <img src={success} className="w-96" alt="" />
                <AuthCommonBtn context="Return to home page" handleClick={() => navigate("/")} />
            </div>
        </UserForm>
    );
}
export default ResetSuccessPage;