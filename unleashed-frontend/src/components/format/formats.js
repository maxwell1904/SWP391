export const formatPrice = (price) => {
  // If the price is negative, reset it to 0
  const validPrice = price < 0 ? 0 : price;

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(validPrice)
    .replace(/\./g, ","); // Replace periods with commas
};
