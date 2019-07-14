import React from 'react';
import PropTypes from 'prop-types';

import styles from './Button.module.scss';
import classNames from 'classnames';

// maybe refactored in the future? since these are the same on the ButtonLink
export const ButtonType = {
  BLUE: 'blue',
  DARKBLUE: 'darkblue',
  GRAY: 'gray',
  WHITE: 'white',
  WHITE_BLUE_OUTLINE: 'white-blue-outline',
  BLUE_OUTLINE: 'blue-outline'
};

export const ButtonSize = {
  FULLWIDTH: 'fullwidth',
  FULLWIDTH_LARGE: 'fullwidth-large',
  LARGE: 'large'
};

export const buttonStyles = styles;

const Button = (props) => {
  const {
    type,
    size,
    className,
    children,
    content,
    disabled,
    ...restProps
  } = props;

  const buttonClassType = {
    blue: styles.blue,
    gray: styles.gray,
    darkblue: styles.darkblue,
    white: styles.white,
    'white-blue-outline': styles.whiteBlueoutline,
    'blue-outline': styles.blueOutline
  };

  const buttonSizeClasses = {
    fullwidth: styles.fullwidth,
    large: styles.large,
    'fullwidth-large': styles.fullwidthLarge
  };

  const componentClasses = classNames(
    styles.btn,
    className,
    buttonClassType[type],
    buttonSizeClasses[size]
  );

  return (
    <button
      type="button"
      className={componentClasses}
      disabled={disabled}
      {...restProps}>
      {content || children}
    </button>
  );
};

Button.propTypes = {
  type: PropTypes.string,
  size: PropTypes.string,
  children: PropTypes.node,
  content: PropTypes.string,
  className: PropTypes.string,
  restProps: PropTypes.object,
  disabled: PropTypes.bool
};

export default Button;
