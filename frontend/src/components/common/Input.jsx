import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseClasses = 'form-input';
  const iconClasses = Icon ? 'pl-10' : '';
  const classes = [baseClasses, iconClasses, className].filter(Boolean).join(' ');

  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-secondary-400" />
          </div>
        )}
        
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={classes}
          {...props}
        />
      </div>
      
      {error && (
        <p className="form-error">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-secondary-500 mt-1">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
