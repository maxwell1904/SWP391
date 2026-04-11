import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React, { useEffect, useState } from "react";

const LocationSelector = ({ onLocationChange, initialAddress }) => {
  const [tinh, setTinh] = useState([]);
  const [quan, setQuan] = useState([]);
  const [phuong, setPhuong] = useState([]);
  const [selectedTinh, setSelectedTinh] = useState("");
  const [selectedQuan, setSelectedQuan] = useState("");
  const [selectedPhuong, setSelectedPhuong] = useState("");

  useEffect(() => {
    // Lấy tỉnh thành
    fetch("https://esgoo.net/api-tinhthanh/1/0.htm")
      .then((response) => response.json())
      .then((data) => {
        if (data.error === 0) {
          setTinh(data.data);

          // Tách địa chỉ ban đầu và thiết lập giá trị
          if (initialAddress) {
            const [, phuongName, quanName, tinhName] = initialAddress.split(", ").map((part) => part.trim());

            // Tìm tỉnh theo tên và thiết lập
            const foundTinh = data.data.find((t) => t.name === tinhName);
            if (foundTinh) {
              setSelectedTinh(foundTinh.id);
              loadQuan(foundTinh.id, quanName, phuongName);
            }
          }
        }
      });
  }, [initialAddress]);

  const loadQuan = (tinhId, quanName, phuongName) => {
    fetch(`https://esgoo.net/api-tinhthanh/2/${tinhId}.htm`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error === 0) {
          setQuan(data.data);

          // Tìm quận theo tên và thiết lập
          const foundQuan = data.data.find((q) => q.name === quanName);
          if (foundQuan) {
            setSelectedQuan(foundQuan.id);
            loadPhuong(foundQuan.id, phuongName);
          }
        }
      });
  };

  const loadPhuong = (quanId, phuongName) => {
    fetch(`https://esgoo.net/api-tinhthanh/3/${quanId}.htm`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error === 0) {
          setPhuong(data.data);

          // Tìm phường theo tên và thiết lập
          const foundPhuong = data.data.find((p) => p.name === phuongName);
          if (foundPhuong) {
            setSelectedPhuong(foundPhuong.id);

            // Gửi dữ liệu ban đầu đến callback
            onLocationChange({
              tinh: tinh.find((t) => t.id === selectedTinh)?.name || "",
              quan: quan.find((q) => q.id === selectedQuan)?.name || "",
              phuong: phuong.find((p) => p.id === foundPhuong.id)?.name || "",
            });
          }
        }
      });
  };

  const handleTinhChange = (e) => {
    const idtinh = e.target.value;
    setSelectedTinh(idtinh);
    setQuan([]);
    setSelectedQuan("");
    setSelectedPhuong("");

    fetch(`https://esgoo.net/api-tinhthanh/2/${idtinh}.htm`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error === 0) {
          setQuan(data.data);
        }
      });
  };

  const handleQuanChange = (e) => {
    const idquan = e.target.value;
    setSelectedQuan(idquan);
    setPhuong([]);
    setSelectedPhuong("");

    fetch(`https://esgoo.net/api-tinhthanh/3/${idquan}.htm`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error === 0) {
          setPhuong(data.data);
        }
      });
  };

  const handlePhuongChange = (e) => {
    const idphuong = e.target.value;
    setSelectedPhuong(idphuong);

    const tinhName = tinh.find((t) => t.id === selectedTinh)?.name || "";
    const quanName = quan.find((q) => q.id === selectedQuan)?.name || "";
    const phuongName = phuong.find((p) => p.id === idphuong)?.name || "";

    onLocationChange({ tinh: tinhName, quan: quanName, phuong: phuongName });
  };

  useEffect(() => {
    // Gửi dữ liệu cho cha khi tất cả các dropdown đã được khởi tạo
    if (selectedTinh && selectedQuan && selectedPhuong) {
      const tinhName = tinh.find((t) => t.id === selectedTinh)?.name || "";
      const quanName = quan.find((q) => q.id === selectedQuan)?.name || "";
      const phuongName = phuong.find((p) => p.id === selectedPhuong)?.name || "";

      onLocationChange({ tinh: tinhName, quan: quanName, phuong: phuongName });
    }
  }, [selectedTinh, selectedQuan, selectedPhuong, tinh, quan, phuong]);


  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <FormControl style={{ width: '300px' }}> {/* Set absolute width here */}
        <InputLabel id="province-label">Province</InputLabel>
        <Select
          labelId="province-label"
          id="province"
          value={selectedTinh}
          label="Province"
          onChange={handleTinhChange}
        >
          <MenuItem value="">
            <em>Select Province</em>
          </MenuItem>
          {tinh.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.full_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl disabled={!selectedTinh} style={{ width: '200px' }}> {/* Set absolute width here */}
        <InputLabel id="district-label">District</InputLabel>
        <Select
          labelId="district-label"
          id="district"
          value={selectedQuan}
          label="District"
          onChange={handleQuanChange}
        >
          <MenuItem value="">
            <em>Select District</em>
          </MenuItem>
          {quan.map((q) => (
            <MenuItem key={q.id} value={q.id}>
              {q.full_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl disabled={!selectedQuan} style={{ width: '200px' }}> {/* Set absolute width here */}
        <InputLabel id="ward-label">Ward</InputLabel>
        <Select
          labelId="ward-label"
          id="ward"
          value={selectedPhuong}
          label="Ward"
          onChange={handlePhuongChange}
        >
          <MenuItem value="">
            <em>Select Ward</em>
          </MenuItem>
          {phuong.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.full_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default LocationSelector;
