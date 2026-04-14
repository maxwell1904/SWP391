import React from "react";
import { FaRegStar, FaStar } from "react-icons/fa";

const getStarColor = (rating) => {
  switch (rating) {
    case 5:
      return "#4CAF50";
    case 4:
      return "#2196F3";
    case 3:
      return "#FFC107";
    case 2:
      return "#FF5722";
    default:
      return "#F44336";
  }
};

const getRatingIcon = (rating) => {
  const icons = ["😢", "😟", "😐", "😊", "😍"];
  return icons[rating - 1];
};

const ReviewStars = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        style={{
          color: i <= rating ? getStarColor(rating) : "#E0E0E0",
          marginRight: 2,
          cursor: "pointer",
          fontSize: "20px",
          transition: "transform 0.3s",
        }}
        // onMouseEnter={(e) => (e.target.style.transform = "scale(1.2)")}
        // onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
      >
        {i <= rating ? <FaStar /> : <FaRegStar />}
      </span>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {stars}
      <span style={{ marginLeft: 8, fontSize: "18px" }}>
        {getRatingIcon(rating)}
      </span>
    </div>
  );
};

export default ReviewStars;
