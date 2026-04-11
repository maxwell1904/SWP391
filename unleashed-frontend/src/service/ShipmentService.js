import { useEffect, useState } from "react";

const CAN_THO_LATITUDE = 10.0364634;
const CAN_THO_LONGITUDE = 105.7875821;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getShippingFee = (province) => {
  const distance = calculateDistance(
    province.latitude,
    province.longitude,
    CAN_THO_LATITUDE,
    CAN_THO_LONGITUDE
  );
  if (distance <= 0.5) return 12500;
  else if (distance <= 1.0) return 15000;
  return province.id.startsWith("0") ? 30000 : 20000;
};

const ShipmentSelector = ({ provinceName, onFeeCalculated }) => {
  const [tinh, setTinh] = useState([]);
  const [shippingFee, setShippingFee] = useState(0);

  useEffect(() => {
    fetch("https://esgoo.net/api-tinhthanh/1/0.htm")
      .then((response) => response.json())
      .then((data) => {
        if (data.error === 0) setTinh(data.data);
      });
  }, []);

  useEffect(() => {
    const selectedProvince = tinh.find((t) => t.name === provinceName);
    if (selectedProvince) {
      const fee = getShippingFee(selectedProvince);
      setShippingFee(fee);
      if (onFeeCalculated) onFeeCalculated(fee); // Gọi callback với phí vận chuyển
    }
  }, [tinh, provinceName, onFeeCalculated]);

};

export default ShipmentSelector;
