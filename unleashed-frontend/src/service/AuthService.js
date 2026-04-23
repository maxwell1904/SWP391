import { jwtDecode } from "jwt-decode";
import { toast, Zoom } from "react-toastify";
import { apiClient } from "../core/api";


export const LoginUser = async (data, navigate, signIn) => {
  const loginPromise = apiClient
    .post("/api/auth/login", {
      username: data.username,
      password: data.password,
    })
    .then((response) => {
      const user = jwtDecode(response.data.token);

      signIn({
        auth: {
          token: response.data.token,
          type: "Bearer",
        },
        userState: {
          username: data.username,
          userImage: user.image,
          role: user.role?.[0]?.authority,
          userEmail: user.userEmail,
        },
      });
      // Check the user's role 
      user.role?.[0]?.authority === "CUSTOMER" ?
        navigate("/") : navigate("/Dashboard");

      return response;
    });

  toast.promise(
    loginPromise,
    {
      pending: "Logging in...",
      success: "Login successful!",
      error: {
        render({ data }) {
          const errorMessage =
            data?.response?.data?.message ||
            "An error occurred. Please try again.";
          return errorMessage;
        },
      },
    },
    {
      position: "top-center",
      transition: Zoom,

    }
  );

  try {
    await loginPromise;
  } catch (error) {
    const responseStatus = error?.response?.status;
    const responseData = error?.response?.data;

    if (responseStatus === 403 && responseData?.email) {
      localStorage.setItem("mail", responseData.email);
      navigate("/register/confirm-registration");
    }
  }
};

export const RegisterUser = async (data, navigate) => {
  try {
    await apiClient.post("/api/auth/register", {
      userUsername: data.username,
      userFullname: data.fullname,
      userEmail: data.email,
      userPassword: data.password,
      userPhone: data.phoneNumber,
    });

    localStorage.setItem("mail", data.email);

    navigate("/register/confirm-registration");
  } catch (error) {
    if (error.response.data.message) {
      toast.error(error.response.data.message, {
        position: "top-center",
        transition: Zoom,
      });
      throw new Error(error.response.data);
    } else {
      throw new Error("An error occurred. Please try again.");
    }
  }
};

export const HandleForgotPassword = async (data, navigate) => {
  try {
    const response = await apiClient.post("/api/auth/forgot-password", {
      email: data.email,
    });

    const token = response.data.token;

    localStorage.setItem("ForgotAuth", token);

    navigate("/forgotPassword/success");
  } catch (error) {
    toast.error(error.response.data, {
      position: "top-center",
      transition: Zoom,
    });
  }
};

export const HandleLoginGoogle = async (accessToken, navigate, signIn) => {
    try {
        // This line will attempt to get the user data from your backend
        const response = await apiClient.get(
            `/api/auth/google-callback?token=${accessToken}`
        );

        // This part ONLY runs if the backend returns a successful (2xx) status.
        // For example, a 200 OK for a successful login.
        if (response.status === 200 && response.data.token) {
            const user = jwtDecode(response.data.token);
            signIn({
                auth: {
                    token: response.data.token,
                    type: "Bearer",
                },
                userState: {
                    username: user.sub,
                    userImage: user.image,
                    role: user.role?.[0]?.authority,
                },
            });

            toast.success("Login successful!", {
                position: "top-center",
                transition: Zoom,
            });
            navigate("/");
            return;
        }

        // This handles the 201 CREATED for a brand new user
        if (response.status === 201) {
            localStorage.setItem("mail", response.data.email);
            toast.info(response.data.message, { position: "top-center", autoClose: 6000 });
            navigate("/register/confirm-registration");
            return;
        }

    } catch (error) {
        // THIS IS THE CRUCIAL PART.
        // Any non-2xx response from the backend (like your 403) will land here.

        if (error.response) {
            // We have a response from the server, let's inspect it.
            const { status, data } = error.response;

            // --- SCENARIO: Account exists but is NOT activated ---
            if (status === 403) {
                // Use the email from the backend's error response
                localStorage.setItem("mail", data.email);

                // Show the user a helpful message
                toast.warn(data.message, {
                    position: "top-center",
                    autoClose: 6000, // Keep message on screen longer
                });

                // Redirect to the confirmation page
                navigate("/register/confirm-registration");
                return; // Stop execution
            }

            // --- SCENARIO: Email conflict (account exists with password) ---
            if (status === 409) {
                toast.error(data.message, {
                    position: "top-center",
                    autoClose: 6000,
                });
                return; // Stop execution
            }
        }

        // --- Fallback for any other unexpected errors ---
        toast.error("An unexpected error occurred during Google Sign-In.", {
            position: "top-center"
        });
        console.error("Unhandled Error in HandleLoginGoogle:", error);
    }
};

export const ResetPassword = async (
  password,
  email,
  token,
  navigate,
  successPath = "/reset-password/success",
  signIn = null,
  isStaffActivation = false
) => {
  try {
    const response = await apiClient.post("/api/auth/reset-password", {
      email: email,
      newPassword: password,
      token: token,
    });

    if (isStaffActivation && response.data?.token && signIn) {
      const user = jwtDecode(response.data.token);
      const signedIn = signIn({
        auth: {
          token: response.data.token,
          type: "Bearer",
        },
        userState: {
          username: user.sub,
          userFullName: user.fullName,
          userImage: user.image,
          role: user.role?.[0]?.authority,
          userEmail: user.userEmail,
        },
      });

      if (!signedIn) {
        throw new Error("Automatic sign-in failed.");
      }
    }

    const successMessage =
      typeof response.data === "string"
        ? response.data
        : response.data?.message || "Password updated successfully";
    toast.success(successMessage, {
      position: "bottom-center",
      transition: Zoom,
    });

    if (isStaffActivation && response.data?.token) {
      navigate("/Dashboard");
      return response;
    }

    navigate(successPath);
    return response;
  } catch (error) {
    const errorMessage = error.response
      ? typeof error.response.data === "string"
        ? error.response.data
        : error.response.data?.message || error.message
      : error.message;
    toast.error(`Reset password error: ${errorMessage}`, {
      position: "bottom-center",
      transition: Zoom,
    });
  }
};

export const loginForStaffAndAdmin = async (data, navigate, signIn) => {
  const loginPromise = apiClient.post("/api/auth/login-for-staff-and-admin", {
    username: data.username,
    password: data.password,
  });

  toast.promise(
    loginPromise,
    {
      pending: "Logging in...",
      // success: "Login successful!",
      error: {
        render({ data }) {
          if (data.response) {
            const errorMessage =
              data.response.data?.message ||
              "An error occurred. Please try again.";
            return errorMessage;
          }
          return "An error occurred. Please try again.";
        },
      },
    },
    {
      position: "bottom-center",
      transition: Zoom,
    }
  );

  try {
    const response = await loginPromise;
    const user = jwtDecode(response.data.token);
    localStorage.setItem("userImage", user.image);
    localStorage.setItem("userFullName", user.fullName);
    // console.log(response.data.token);
    // console.log(user);

    signIn({
      auth: {
        token: response.data.token,
        type: "Bearer",
      },
      userState: {
        username: data.username,
        userFullName: user.fullName,
        userImage: user.image,
        role: user.role?.[0]?.authority,
      },
    });

    navigate("/Dashboard");
  } catch (error) {
    throw new Error(
      error.response?.data.message || "An error occurred. Please try again."
    );
  }
};

export const logout = (token) => {
  try {
    const response = apiClient.delete("/api/auth/logout", {
      headers: {
        Authorization: token,
      },
    })
    // console.log(response);
    return response;
  } catch (error) {
    // console.log(error)
  }
};

export const checkStatus = (token) => {
  try {
    const response = apiClient.get("/api/auth/token", {
      headers: {
        Authorization: token,
      },
    })
    // console.log(response);
    return response;
  } catch (error) {
    // console.log(error)
  }
};
