import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../../core/api"; // Your API client
import { toast, Zoom } from "react-toastify";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";

const DashboardAddAccountToVoucher = () => {
  const { voucherId } = useParams(); // Get voucherId from the URL
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const varToken = useAuthHeader();
  const [voucherRank, setVoucherRank] = useState(null); // State to store voucher rank
    const [selectAllChecked, setSelectAllChecked] = useState(false); // State for select all checkbox
    const [loadingVoucher, setLoadingVoucher] = useState(true); // State to track voucher rank loading
    const [loadingAccounts, setLoadingAccounts] = useState(true); // State to track accounts loading

    useEffect(() => {
        const fetchVoucherRank = async () => {
            setLoadingVoucher(true);
            try {
                const response = await apiClient.get(`/api/vouchers/${voucherId}`, {
                    headers: { Authorization: varToken },
                });
                if (response.status === 200) {
                    setVoucherRank(response.data.voucherRank.rankNum); // Assuming your voucher object has a 'rank' property
                } else {
                    toast.error("Failed to fetch voucher details.", {
                        position: "bottom-right",
                        transition: Zoom,
                    });
                }
            } catch (error) {
                console.error("Error fetching voucher details:", error);
                toast.error(
                    error.response?.data?.message || "Error fetching voucher details.",
                    {
                        position: "bottom-right",
                        transition: Zoom,
                    }
                );
            } finally {
                setLoadingVoucher(false);
            }
        };

        fetchVoucherRank();
    }, [voucherId, varToken]);

    useEffect(() => {
        if (voucherRank !== null) {
            setLoadingAccounts(true);
            apiClient
                .get(`/api/vouchers/${voucherId}/users`, {
                    headers: { Authorization: varToken },
                })
                .then((resVoucher) => {
                    const existingAccountIds = resVoucher.data.users.map((user) => user.userId);
                    return apiClient
                        .get("/api/admin/users/search", {
                            headers: { Authorization: varToken },
                        })
                        .then((resUsers) => {
                            const fetchedAccounts = resUsers.data || [];
                            const customerAccounts = fetchedAccounts.filter(
                                (account) =>
                                    account.role === "CUSTOMER" &&
                                    account.rank?.rankNum >= voucherRank
                            );
                            const filteredByVoucher = customerAccounts.filter(
                                (account) => !existingAccountIds.includes(account.userId)
                            );
                            setAccounts(filteredByVoucher);
                            setFilteredAccounts(filteredByVoucher);
                        });
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                    toast.error(
                        error.response?.data?.message || "Error fetching data.",
                        {
                            position: "bottom-right",
                            transition: Zoom,
                        }
                    );
                })
                .finally(() => {
                    setLoadingAccounts(false);
                });
        }
    }, [voucherId, varToken, voucherRank]);

  useEffect(() => {
    const filtered = accounts.filter((account) =>
      account.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAccounts(filtered);
  }, [searchQuery, accounts]);

  const handleAccountChange = (accountId) => {
    if (selectedAccountIds.includes(accountId)) {
      setSelectedAccountIds(
        selectedAccountIds.filter((id) => id !== accountId)
      );
    } else {
      setSelectedAccountIds([...selectedAccountIds, accountId]);
    }
  };

    const handleSelectAllChange = (event) => {
        setSelectAllChecked(event.target.checked);
        if (event.target.checked) {
            // Select all accounts in filteredAccounts
            const allFilteredAccountIds = filteredAccounts.map((account) => account.userId);
            setSelectedAccountIds(allFilteredAccountIds);
        } else {
            // Deselect all accounts
            setSelectedAccountIds([]);
        }
    };

  const handleAddAccounts = () => {
    apiClient
      .post(`/api/vouchers/${voucherId}/users`, selectedAccountIds, {
        headers: {
          Authorization: varToken,
        },
      })
      .then((response) => {
        toast.success("Add users to voucher successfully", {
          position: "bottom-right",
          transition: Zoom,
        });
        navigate(`/Dashboard/Vouchers/${voucherId}`); // Redirect to voucher details page
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || "Add users to voucher failed",
          {
            position: "bottom-right",
            transition: Zoom,
          }
        );
      });
  };

    return (
        <div>
            <h1 className="text-2xl font-bold">Add Accounts to Voucher</h1>
            <input
                type="text"
                placeholder="Search by gmail"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-4 p-2 border border-gray-300 rounded-md w-full"
            />
            <div className="mt-2 flex items-center"> {/* Container for checkbox and label */}
                <input
                    type="checkbox"
                    id="select-all-accounts"
                    checked={selectAllChecked}
                    onChange={handleSelectAllChange}
                    className="mr-2" // Add some right margin for spacing
                />
                <label htmlFor="select-all-accounts" className="text-sm">
                    Select All Accounts
                </label>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredAccounts.map((account) => (
                    <div
                        key={account.userId} // Use userId for unique key
                        className={`border rounded-md p-2 flex flex-col relative transition-all duration-300 ${
                            selectedAccountIds.includes(account.userId)
                                ? "border-blue-500 border-[5px]"
                                : "border-gray-300"
                        }`}
                    >
                        <input
                            type="checkbox"
                            id={`account-${account.userId}`} // Use userId for checkbox id
                            checked={selectedAccountIds.includes(account.userId)}
                            onChange={() => handleAccountChange(account.userId)}
                            className="absolute opacity-0"
                        />
                        <label
                            htmlFor={`account-${account.userId}`} // Use userId for label
                            className="flex flex-col items-center justify-center p-4 cursor-pointer"
                        >
                            <h2 className="font-semibold">{account.username}</h2>
                            <p className="text-sm">{account.email}</p>
                            <p className="text-gray-500">Name: {account.fullName}</p>
                        </label>
                    </div>
                ))}
            </div>
            <button
                onClick={handleAddAccounts}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
                Add Accounts
            </button>
        </div>
    );
};

export default DashboardAddAccountToVoucher;
