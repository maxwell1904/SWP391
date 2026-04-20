import { UserForm } from "../../layouts/LRFCLayout";
import { Formik, Form } from "formik";
import { useState } from "react";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { Link, useLocation, useNavigate} from "react-router-dom";
import * as Yup from "yup";
import {InputField} from "../../components/inputs/InputField";
import { ResetPassword } from "../../service/AuthService";
import { AuthCommonBtn } from "../../components/buttons/Button";

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  // const [resetPassword, setResetPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const email = queryParams.get("email");
  const isStaffActivation =
    location.pathname.startsWith("/staff/activate-password") ||
    queryParams.get("source") === "staff";

  // useEffect(() => {
  //   if (token === undefined && email === undefined) {
  //       setResetPassword(true);
  //   }
  // },[email, token]);


  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (values, { setSubmitting }) => {
    try {
      const successPath = isStaffActivation
        ? "/staff/activate-password/success"
        : "/reset-password/success";
      await ResetPassword(values.password, email, token, navigate, successPath);
    } catch (error) {
    }
  };

  const ResetPasswordSchema = Yup.object().shape({
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
        "Password must contain one uppercase, one lowercase, and one number"
      ),
    confirmPassword: Yup.string()
      .required("Confirm your password")
      .oneOf([Yup.ref("password")], "Passwords must match"),
  });

  return (
    <UserForm>
      <div className="resetPassword">
        <div className="pt-20">
          <h2 className="font-poppins text-5xl mb-6 text-left">
            {isStaffActivation ? "Activate Staff Account" : "Reset Password"}
          </h2>
          {isStaffActivation && (
            <p className="mb-6 text-base text-gray-500">
              Set your password to activate your staff account.
            </p>
          )}
          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={ResetPasswordSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xl text-gray-500">
                      New Password
                    </label>
                    <button
                      type="button"
                      className="flex items-center text-gray-500 text-xl swap"
                      onClick={toggleShowPassword}
                    >
                      {showPassword ? (
                        <>
                          <BiSolidHide className="mr-1 text-3xl text-gray-500" />{" "}
                          Hide
                        </>
                      ) : (
                        <>
                          <BiSolidShow className="mr-1 text-3xl text-gray-500" />{" "}
                          Show
                        </>
                      )}
                    </button>
                  </div>
                  <InputField
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    tabIndex={1}
                  />
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="text-xl text-gray-500">
                    Confirm Password
                  </label>
                  <InputField
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    tabIndex={2}
                  />
                </div>

                <AuthCommonBtn
                  context={isStaffActivation ? "Set Password & Activate" : "Confirm Password"}
                  type={"submit"}
                />
              </Form>
            )}
          </Formik>
          <div className="OtherFeature pt-10 flex justify-center">
            <Link to="/login">
              <p className="font-semibold font-montserrat underline">
                Back to login
              </p>
            </Link>
          </div>
        </div>
      </div>
    </UserForm>
  );
};
export default ResetPasswordPage;
