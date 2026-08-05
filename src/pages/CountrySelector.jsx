import React, { useState, useMemo } from 'react';
import Select, { components } from 'react-select';
import countryList from 'react-select-country-list';
import Flag from 'react-world-flags';

// 1. Custom component to render the flag and text inside the dropdown list
const CustomOption = (props) => {
  return (
    <components.Option {...props}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Flag code={props.data.value} style={{ width: '20px', height: '15px', objectFit: 'cover' }} />
        <span>{props.data.label}</span>
      </div>
    </components.Option>
  );
};

// 2. Custom component to render the flag and text for the currently selected item
const CustomSingleValue = (props) => {
  return (
    <components.SingleValue {...props}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Flag code={props.data.value} style={{ width: '20px', height: '15px', objectFit: 'cover' }} />
        <span>{props.data.label}</span>
      </div>
    </components.SingleValue>
  );
};

function CountrySelector() {
  const [value, setValue] = useState(null);
  const options = useMemo(() => countryList().getData(), []);

  return (
    <div style={{ width: '300px', margin: '20px auto' }}>
      <label style={{ display: 'block', marginBottom: '8px' }}>Select a Country:</label>
      <Select 
        options={options} 
        value={value} 
        onChange={setValue} 
        components={{ 
          Option: CustomOption, 
          SingleValue: CustomSingleValue 
        }}
      />
    </div>
  );
}

export default CountrySelector;
