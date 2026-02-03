import React from 'react';

const Card = ({
  children,
  className = '',
  header,
  footer,
  hover = false,
  padding = 'normal',
  ...props
}) => {
  const baseClasses = 'card';
  const hoverClasses = hover ? 'hover:shadow-medium transition-shadow duration-200' : '';
  const paddingClasses = {
    none: '',
    small: 'p-4',
    normal: '',
    large: 'p-8',
  };
  
  const classes = [
    baseClasses,
    hoverClasses,
    paddingClasses[padding] || paddingClasses.normal,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {header && (
        <div className="card-header">
          {header}
        </div>
      )}
      
      <div className="card-body">
        {children}
      </div>
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
