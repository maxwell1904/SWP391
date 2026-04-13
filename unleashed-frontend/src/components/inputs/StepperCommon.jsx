import * as React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";
import { MdOutlinePendingActions } from "react-icons/md";
import { BiLoaderCircle } from "react-icons/bi";
import { FaBox, FaTruck } from "react-icons/fa";
import { TbShoppingCartCheck, TbShoppingCartX, TbShoppingCartCancel } from "react-icons/tb";
import { GiReturnArrow } from "react-icons/gi";
import { AiOutlineFileSearch } from "react-icons/ai";

const ColorlibConnector = styled(StepConnector)(({ theme, status }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}, &.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
          status === 4 || status === 6
              ? "linear-gradient(95deg, rgba(255,0,0,1) 0%, rgba(255,127,127,1) 100%)"
              : status === 7 || status === 8
                  ? "linear-gradient(95deg, rgb(255, 165, 0) 0%, rgb(255, 215, 100) 100%)"
                  : status === 5
                      ? "linear-gradient(95deg, rgba(128,128,128,1) 0%, rgba(192,192,192,1) 100%)"
                      : status === 3
                          ? "linear-gradient(95deg, rgba(0,128,0,1) 0%, rgba(50,205,50,1) 100%)"
                          : "linear-gradient(95deg, rgba(23,124,216,1) 0%, rgba(41,127,253,1) 44%, rgba(126,204,250,1) 100%)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: "#eaeaf0",
    borderRadius: 1,
    ...theme.applyStyles("dark", {
      backgroundColor: theme.palette.grey[800],
    }),
  },
}));


const ColorlibStepIconRoot = styled("div")(({ status, ownerState, activeStep, stepIndex }) => ({
  backgroundColor: "#ccc",
  zIndex: 1,
  color: "#fff",
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  backgroundImage: activeStep >= stepIndex
      ? (status === 4 || status === 6
          ? "linear-gradient(136deg, rgba(255,0,0,1) 0%, rgba(255,127,127,1) 100%)"
          : status === 7 || status === 8
              ? "linear-gradient(136deg, rgb(255, 165, 0) 0%, rgb(255, 215, 100) 100%)"
              : status === 5
                  ? "linear-gradient(136deg, rgba(128,128,128,1) 0%, rgba(192,192,192,1) 100%)"
                  : status === 3
                      ? "linear-gradient(136deg, rgba(0,128,0,1) 0%, rgba(50,205,50,1) 100%)"
                      : "linear-gradient(136deg, rgba(23,124,216,1) 0%, rgba(41,127,253,1) 44%, rgba(126,204,250,1) 100%)")
      : "#ccc",
}));


function ColorlibStepIcon(props) {
  const { active, completed, icon, status, activeStep } = props;

  const iconsByStatus = {
    1: MdOutlinePendingActions, // Pending
    2: BiLoaderCircle,         // Processing
    3: FaTruck,                // Shipping/Packaged
    4: TbShoppingCartCheck,     // Completed/Delivered
    5: TbShoppingCartX,         // Returned (X icon)
    6: TbShoppingCartCancel,    // Cancelled/Denied
    7: GiReturnArrow,         // Returning (Arrow icon)
    8: AiOutlineFileSearch, // Inspect
    9: FaBox, //Box
  };


  let stepIcons = [1, 2, 3, 4]; // Default: Pending, Processing, Shipping, Completed
  if (status === 4) { // Cancelled
    stepIcons = [1, 2, 6]; // Pending, Processing, Cancelled
  } else if (status === 6) { // Denied
    stepIcons = [1, 6];  // Pending, Denied
  } else if (status === 5) {  //Returned
    stepIcons = [7, 9, 8, 5]; // Pending, Processing, Shipping, Returned
  } else if (status === 7) { // Returning
    stepIcons = [1, 2, 3, 7]; // Pending, Processing, Shipping, Returning
  } else if (status === 8) { // Inspection
    stepIcons = [7, 3, 9, 8]; // Returning, On the Way, Received , Inspecting
  }

  const IconComponent = iconsByStatus[stepIcons[icon - 1]] || MdOutlinePendingActions;

  return (
      <ColorlibStepIconRoot ownerState={{ completed, active }} status={status} activeStep={activeStep} stepIndex={icon - 1}>
        <IconComponent size={24} />
      </ColorlibStepIconRoot>
  );
}

ColorlibStepIcon.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
  icon: PropTypes.number,
  status: PropTypes.number,
  activeStep: PropTypes.number,
};

export default function CustomizedSteppers({ status }) {
  let steps = ["Waiting for Confirmation", "Being Prepared", "On the Way", "Delivered"]; // Default steps

  if (status === 4) {  // Cancelled
    steps = ["Waiting for Confirmation", "Being Prepared", "Cancelled"];
  } else if (status === 6) {  // Denied
    steps = ["Waiting for Confirmation", "Denied"];
  } else if (status === 5) { // Returned
    steps = ["Returning", "Received", "Inspecting", "Returned"];
  } else if (status === 7) { // Returning
    steps = ["Waiting for Confirmation", "Being Prepared", "On the Way", "Returning"]; // Changed to "Returning"
  } else if (status === 8) {
    steps = ["Returning", "On the Way", "Received", "Inspecting"];
  }

  return (
      <Stepper alternativeLabel activeStep={Math.min(status, steps.length - 1)} connector={<ColorlibConnector status={status} activeStep={status} />} >
        {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel StepIconComponent={(props) => <ColorlibStepIcon {...props} status={status} icon={index + 1} activeStep={status} />}>
                {label}
              </StepLabel>
            </Step>
        ))}
      </Stepper>
  );
}