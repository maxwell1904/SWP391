import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../../core/api";
import { toast, Zoom } from "react-toastify";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import CircularProgress from "@mui/material/CircularProgress";

const DashboardEditAccount = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [enable, setEnable] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const varToken = useAuthHeader();

  useEffect(() => {
    apiClient
      .get(`/api/admin/${userId}`, {
        headers: {
          Authorization: varToken,
        },
      })
      .then((response) => {
        setUser(response.data);
        setEnable(response.data.isUserEnabled);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, [userId, varToken]);

  const handleSave = () => {
    const updatedUser = {
      enable,
    };

    setLoading(true);

    setTimeout(() => {
      apiClient
        .put(`/api/admin/${userId}`, updatedUser, {
          headers: {
            Authorization: varToken,
          },
        })
        .then(
          (response) =>
            toast.success(response.data, {
              position: "bottom-right",
              transition: Zoom,
            }),

          navigate("/Dashboard/Accounts")
        )
        .catch((error) => {
          toast.error("Update user failed", {
            position: "bottom-right",
            transition: Zoom,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }, 1000);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold">Edit Account</h1>
      <div>
        <label className="block text-gray-700">Username:</label>
        <input
          type="text"
          value={user.username}
          readOnly
          className="mt-2 border border-gray-300 rounded-lg p-2 w-full"
        />
      </div>
      <div>
        <label className="block text-gray-700">Email:</label>
        <input
          type="email"
          value={user.userEmail}
          readOnly
          className="mt-2 border border-gray-300 rounded-lg p-2 w-full"
        />
      </div>
      <div>
        <label className="block text-gray-700">Role:</label>
        <input
          type="text"
          value={user.role.roleName}
          readOnly
          className="mt-2 border border-gray-300 rounded-lg p-2 w-full"
        />
      </div>
      <div>
        <label className="block text-gray-700">Status:</label>
        <button
          onClick={() => setEnable((prev) => !prev)}
          className={`mt-2 px-4 py-2 rounded-lg ${user?.role?.roleName === "ADMIN" ? "bg-gray-400 text-white cursor-not-allowed" :
              !enable ? "bg-red-500 text-white" :
                "bg-green-500 text-white"
            }`}
          disabled={user?.role?.roleName === "ADMIN"}
        >
          {enable ? "Enable" : "Disable"}
        </button>
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-300 text-black rounded-lg"
        >
          Go Back
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className={`mt-4 px-4 py-2 rounded-lg ${loading ? "bg-gray-500" : "bg-blue-500"
            } text-white flex items-center justify-center`}
        >
          {loading ? (
            <CircularProgress size={24} className="text-white" />
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
};

export default DashboardEditAccount;
