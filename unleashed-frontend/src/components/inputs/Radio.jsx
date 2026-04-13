import { Card, CardContent, FormControlLabel, Radio, Typography } from "@mui/material";

export const RadioCommon = ({ value, current, handleChecked, context, id }) => {
  return (
    <div className="selection">
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="radio"
          name={id}
          id={value}
          className="hidden peer"
          checked={current === value}
          value={value}
          onChange={handleChecked} 
        />
        <span className="h-5 w-5 rounded-full border-2 border-gray-500 peer-checked:border-red-600 peer-checked:bg-red-600 transition-colors duration-300 ease-in-out transform peer-checked:scale-110"></span>
        <span className="ml-3 text-sm text-inherit">{context}</span>
      </label>
    </div>
  );
};

export const CommonRadioCard = ({ value, label, checked, onChange, description }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        border: checked ? '2px solid #1976d2' : '1px solid #ccc',
        borderRadius: '8px',
        transition: 'all 0.3s ease-in-out', // Smooth transition for all properties
        '&:hover': {
          border: '2px solid #1976d2',
          transform: 'scale(1.05)', // Slight scaling on hover
        },
      }}
    >
      <FormControlLabel
        control={
          <Radio
            checked={checked}
            onChange={onChange}
            value={value}
            sx={{
              display: 'none', // Hide default radio button
              transition: 'transform 0.3s ease-in-out', // Smooth transition for scaling
              '&.Mui-checked': {
                transform: 'scale(1.2)', // Scale up the radio button when checked
              },
            }}
          />
        }
        label={
          <CardContent>
            <Typography variant="h6" component="div">
              {label}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </CardContent>
        }
      />
    </Card>
  );
};



