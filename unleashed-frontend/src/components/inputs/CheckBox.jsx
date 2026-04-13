import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { styled } from '@mui/system';
import { keyframes } from '@emotion/react';

const scaleAnimation = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const CustomCheckbox = styled(Checkbox)({
  color: '#858585',
  '&.Mui-checked': {
    color: '#297FFD',
    animation: `${scaleAnimation} 0.3s ease-in-out`,
  },
  '&:hover': {
    backgroundColor: 'rgba(7, 137, 212, 0.1)',
  },
});

const CustomLabel = styled(FormControlLabel)({
  fontFamily: '"Poppins", sans-serif',
  fontSize: '16px',
  color: '#333',
});

const AnimatedCheckbox = ({ rememberMe, handleRememberMeChange }) => {
  return (
    <CustomLabel
      control={
        <CustomCheckbox
          checked={rememberMe}
          onChange={handleRememberMeChange}
          name="remember"
        />
      }
      label="Remember me"
    />
  );
};

export default AnimatedCheckbox;
