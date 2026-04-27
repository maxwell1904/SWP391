import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import Column3DChart from "../../components/chart/3dColumnChart";
import { formatPrice } from "../../components/format/formats";

const TOP_BEST_SELLING_PRODUCTS = 10;

const bestSellingFilters = [
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
  { label: "All time", value: "all" },
];

const Dashboard = () => {
  const [monthlyRevenueChartData, setMonthlyRevenueChartData] = useState([]);
  const [monthlyTotalRevenue, setMonthlyTotalRevenue] = useState(0);
  const [yearlyRevenue, setYearlyRevenue] = useState(0);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [bestSellingFilter, setBestSellingFilter] = useState("30");
  const [bestSellingLoading, setBestSellingLoading] = useState(false);
  const [bestSellingError, setBestSellingError] = useState("");

  const [orderStatusList, setOrderStatusList] = useState([]); // State cho danh sách trạng thái đơn hàng

  const [currentPage, setCurrentPage] = useState(0); // State cho trang hiện tại
  const [totalPages, setTotalPages] = useState(0); // State cho tổng số trang
  const [isPageDropdownVisible, setIsPageDropdownVisible] = useState(false); // State để kiểm soát dropdown
  const pageDropdownRef = useRef(null); // Ref cho dropdown container

  const varToken = useAuthHeader();
  const [currentDate, setCurrentDate] = useState(new Date()); // State để theo dõi tháng/năm hiện tại

  const currentMonth = currentDate.getMonth() + 1; // Tháng trong Javascript bắt đầu từ 0
  const currentYear = currentDate.getFullYear();
  const maxBestSellingTotal = useMemo(
    () =>
      bestSellingProducts.reduce(
        (max, product) => Math.max(max, Number(product.totalSold || 0)),
        0,
      ),
    [bestSellingProducts],
  );

  // Tạo list tháng và năm để chọn
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const years = Array.from(
    { length: new Date().getFullYear() - 2000 + 1 },
    (_, index) => 2000 + index,
  ); // Năm từ 2000 đến năm hiện tại

  useEffect(() => {
    let isMounted = true;

    const fetchBestSellingProducts = async () => {
      setBestSellingLoading(true);
      setBestSellingError("");

      const isAllTime = bestSellingFilter === "all";
      const endpoint = isAllTime
        ? "/api/statistics/best-selling-products/all-time"
        : "/api/statistics/best-selling-products";
      const params = isAllTime
        ? { topNProducts: TOP_BEST_SELLING_PRODUCTS }
        : {
            numberOfDays: Number(bestSellingFilter),
            topNProducts: TOP_BEST_SELLING_PRODUCTS,
          };

      try {
        const response = await apiClient.get(endpoint, {
          headers: {
            Authorization: varToken,
          },
          params,
        });

        if (isMounted) {
          setBestSellingProducts(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching best selling products:", error);
        if (isMounted) {
          setBestSellingProducts([]);
          setBestSellingError("Could not load best-selling data.");
        }
      } finally {
        if (isMounted) {
          setBestSellingLoading(false);
        }
      }
    };

    fetchBestSellingProducts();

    return () => {
      isMounted = false;
    };
  }, [varToken, bestSellingFilter]);

  useEffect(() => {
    // Effect để xử lý click bên ngoài dropdown để đóng dropdown
    const handleClickOutside = (event) => {
      if (
        pageDropdownRef.current &&
        !pageDropdownRef.current.contains(event.target)
      ) {
        setIsPageDropdownVisible(false); // Đóng dropdown khi click bên ngoài
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pageDropdownRef]);

  const fetchMonthlyRevenue = useCallback(async (month, year) => {
    try {
      const response = await apiClient.get(
        `/api/statistics/revenue/monthly?month=${month}&year=${year}`,
        {
          headers: {
            Authorization: varToken,
          },
        },
      );

      // Kiểm tra xem dailyRevenues có dữ liệu hay không
      if (
        response.data.dailyRevenues &&
        response.data.dailyRevenues.length > 0
      ) {
        const formattedData = response.data.dailyRevenues.map((item) => ({
          category: `${item.day}`,
          revenue: item.totalAmount,
        }));
        setMonthlyRevenueChartData(() => formattedData);
      } else {
        // Nếu không có dữ liệu, set chart data về mảng rỗng để hiển thị biểu đồ trống
        setMonthlyRevenueChartData(() => []);
      }

      // Kiểm tra và set tổng doanh thu tháng
      if (response.data.totalMonthlyRevenue) {
        setMonthlyTotalRevenue(response.data.totalMonthlyRevenue);
      } else {
        // Nếu không có tổng doanh thu, set về 0
        setMonthlyTotalRevenue(0);
      }
    } catch (error) {
      console.error("Error fetching monthly revenue:", error);
      // Xử lý lỗi, ví dụ set chart data và total revenue về 0 hoặc mảng rỗng khi có lỗi fetch
      setMonthlyRevenueChartData(() => []);
      setMonthlyTotalRevenue(0);
    }
  }, [varToken]);

  const fetchYearlyRevenue = useCallback(async (year) => {
    // Thêm tham số năm
    try {
      const response = await apiClient.get(
        `/api/statistics/revenue/yearly?year=${year}`,
        {
          // Truyền năm vào query params
          headers: {
            Authorization: varToken,
          },
        },
      );
      setYearlyRevenue(response.data.totalAmount);
    } catch (error) {
      console.error("Error fetching yearly revenue:", error);
    }
  }, [varToken]);

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleMonthChange = (event) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(event.target.value) - 1);
    setCurrentDate(newDate);
  };

  const handleYearChange = (event) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(event.target.value));
    setCurrentDate(newDate);
  };

  const isPreviousMonthButtonDisabled = () => {
    return currentYear === 2000 && currentMonth === 1;
  };

  const isNextMonthButtonDisabled = () => {
    const now = new Date();
    return currentYear === now.getFullYear() && currentMonth === 12;
  };

  const fetchOrderStatusData = useCallback(async () => {
    try {
      const response = await apiClient.get(
        `/api/statistics/order-status-list?page=${currentPage}&size=20`,
        {
          // Truyền currentPage và size vào query params
          headers: {
            Authorization: varToken,
          },
        },
      );
      setOrderStatusList(response.data.content); // Lấy danh sách order status từ response.data.content
      setTotalPages(response.data.totalPages); // Lấy tổng số trang từ response.data.totalPages
    } catch (error) {
      console.error("Error fetching order status list:", error);
    }
  }, [currentPage, varToken]);

  useEffect(() => {
    fetchMonthlyRevenue(currentMonth, currentYear);
    fetchYearlyRevenue(currentYear);
    fetchOrderStatusData();
  }, [
    currentMonth,
    currentYear,
    fetchMonthlyRevenue,
    fetchOrderStatusData,
    fetchYearlyRevenue,
  ]); // Fetch lại khi tháng/năm thay đổi

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setIsPageDropdownVisible(false); // Đóng dropdown khi chọn trang
  };

  const togglePageDropdown = () => {
    // Hàm toggle dropdown visibility
    setIsPageDropdownVisible(!isPageDropdownVisible);
  };

  return (
    <div className="p-2">
      {/* Header Section */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
        <p>Welcome to the admin dashboard!</p>
        <p>Here you can view your overall statistics and insights.</p>{" "}
        {/* Hiển thị tháng năm hiện tại */}
      </div>

      {/* Monthly Revenue Section */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            Monthly Revenue Chart {currentMonth}/{currentYear}
          </h3>
          <div>
            {/* Nút Tháng trước/sau */}
            <button
              onClick={goToPreviousMonth}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
              disabled={isPreviousMonthButtonDisabled()} // Disable button Tháng trước
            >
              Previous Month
            </button>
            <button
              onClick={goToNextMonth}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
              disabled={isNextMonthButtonDisabled()} // Disable button Tháng sau
            >
              Next Month
            </button>
            {/* Dropdown chọn tháng */}
            <select
              className="p-2 border rounded"
              value={currentMonth}
              onChange={handleMonthChange}
            >
              {months.map((month, index) => (
                <option key={index + 1} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            {/* Dropdown chọn năm */}
            <select
              className="p-2 border rounded"
              value={currentYear}
              onChange={handleYearChange}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        {monthlyRevenueChartData.length > 0 ? (
          <Column3DChart chartData={monthlyRevenueChartData} />
        ) : (
          <p className="text-center text-gray-500">
            No revenue data for this month.
          </p>
        )}
        <h4 className="text-xl font-semibold mt-4">
          Total Monthly Revenue:{" "}
          <span className="font-bold">{formatPrice(monthlyTotalRevenue)}</span>
        </h4>{" "}
        {/* Hiển thị tổng doanh thu tháng */}
        <h4 className="text-xl font-semibold mt-2">
          Yearly Revenue ({currentYear}):{" "}
          <span className="font-bold">{formatPrice(yearlyRevenue)}</span>
        </h4>{" "}
        {/* Hiển thị tổng doanh thu năm trong thẻ div monthly */}
      </div>

      {/* Best Selling Products Section */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">Best Selling Products</h3>
            <p className="text-sm text-gray-500">
              Completed orders only | Top {TOP_BEST_SELLING_PRODUCTS}
            </p>
          </div>
          <div className="inline-flex w-full md:w-auto rounded-md border border-gray-300 overflow-hidden bg-white">
            {bestSellingFilters.map((filter) => {
              const isActive = bestSellingFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setBestSellingFilter(filter.value)}
                  className={`flex-1 md:flex-none px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {bestSellingLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 rounded bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : bestSellingError ? (
          <p className="text-center text-red-500 py-8">{bestSellingError}</p>
        ) : bestSellingProducts.length > 0 ? (
          <div className="space-y-3">
            {bestSellingProducts.map((product, index) => {
              const totalSold = Number(product.totalSold || 0);
              const barWidth =
                maxBestSellingTotal > 0
                  ? `${Math.max((totalSold / maxBestSellingTotal) * 100, 6)}%`
                  : "0%";

              return (
                <div
                  key={`${product.productName}-${index}`}
                  className="grid grid-cols-1 md:grid-cols-[3rem_minmax(0,1fr)_7rem] gap-2 md:gap-4 items-center"
                >
                  <div className="text-sm font-bold text-gray-500">
                    #{index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex justify-between gap-3 mb-1">
                      <span className="font-medium text-gray-800 truncate">
                        {product.productName || "Unnamed product"}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: barWidth }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700 md:text-right">
                    {totalSold.toLocaleString()} sold
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No best-selling data for this range.
          </p>
        )}
      </div>

      {/* Order Status Section */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Order Status Statistics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-400">
            <thead>
              <tr>
                <th className="border border-gray-400 px-4 py-2">Order ID</th>
                <th className="border border-gray-400 px-4 py-2">Status</th>
                <th className="border border-gray-400 px-4 py-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {orderStatusList.map((orderStatus, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="border border-gray-400 px-4 py-2">
                    {orderStatus.orderId}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    {orderStatus.orderStatusName}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    {new Date(orderStatus.orderCreatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orderStatusList.length === 0 && (
            <p className="text-center text-gray-500 mt-4">
              No order status data available.
            </p>
          )}
        </div>

        {/* Pagination Section - Sửa đổi UI phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 items-center space-x-4 relative">
            {" "}
            {/* Thêm relative để định vị dropdown */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l disabled:opacity-50"
            >
              Previous
            </button>
            {/* Thay input bằng button/span để mở dropdown */}
            <button
              onClick={togglePageDropdown}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              ref={pageDropdownRef} // Gán ref cho button/span chứa số trang hiện tại
            >
              Page {currentPage + 1} of {totalPages}
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r disabled:opacity-50"
            >
              Next
            </button>
            {/* Dropdown số trang */}
            {isPageDropdownVisible && (
              <div
                ref={pageDropdownRef}
                className="absolute mt-2 w-24 bg-white border border-gray-300 rounded shadow-md z-10 max-h-60 overflow-y-scroll"
              >
                {" "}
                {/* Thêm max-h-40 và overflow-y-scroll */}
                {Array.from({ length: totalPages }, (_, index) => index).map(
                  (pageIndex) => (
                    <button
                      key={pageIndex}
                      onClick={() => handlePageChange(pageIndex)}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${currentPage === pageIndex ? "bg-gray-200" : ""}`}
                    >
                      {pageIndex + 1}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
