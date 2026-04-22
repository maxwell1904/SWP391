import { useEffect, useState } from "react";

const CAN_THO_LATITUDE = 10.0364634;
const CAN_THO_LONGITUDE = 105.7875821;
const DEFAULT_SHIPPING_FEE = 20000;

const DISTANCE_FEE_BANDS = [
  { maxKm: 30, fee: 12000 },
  { maxKm: 80, fee: 18000 },
  { maxKm: 200, fee: 25000 },
  { maxKm: 500, fee: 35000 },
  { maxKm: Infinity, fee: 45000 },
];

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

const toCoordinateNumber = (value) => Number.parseFloat(value);

const getShippingFee = (province) => {
  const latitude = toCoordinateNumber(province.latitude);
  const longitude = toCoordinateNumber(province.longitude);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return DEFAULT_SHIPPING_FEE;
  }

  const distance = calculateDistance(
    latitude,
    longitude,
    CAN_THO_LATITUDE,
    CAN_THO_LONGITUDE
  );

  const matchedBand = DISTANCE_FEE_BANDS.find((band) => distance <= band.maxKm);
  return matchedBand ? matchedBand.fee : DEFAULT_SHIPPING_FEE;
};

const ShipmentSelector = ({ provinceName, onFeeCalculated }) => {
  const [tinh, setTinh] = useState([]);

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
      if (onFeeCalculated) onFeeCalculated(fee);
    }
  }, [tinh, provinceName, onFeeCalculated]);

};

export default ShipmentSelector;
