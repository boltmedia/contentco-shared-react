import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Styles from './Loader.module.scss';
import classNames from 'classnames';

const LoaderColor = {
  WHITE: Styles.white,
  BLUE: Styles.blue
};

const LoaderSize = {
  LARGE: Styles.large,
  SMALL: Styles.small
};

const LoaderType = {
  INLINE: Styles.inline,
  FULL: Styles.full
};

const Loader = (props) => {
  // const [isCompleted] = useState(props.isCompleted);

  // useEffect(() => {
  //   console.log('props', props.isCompleted)
  //   console.log('use effect', isCompleted);
  // }, [props.isCompleted]);

  // console.log('isCompleted', props.isCompleted)
  return (
    <div
      className={classNames(
        Styles.loader,
        props.className,
        props.size,
        props.color,
        props.type
      )}>
      {!props.isError && !props.isCompleted && (
        <div className={Styles.spinner} />
      )}
      {props.isCompleted && <div className={classNames(Styles.checkmark)} />}
      {props.isError && <div className={classNames(Styles.error)} />}
    </div>
  );
};

Loader.propTypes = {
  className: PropTypes.string,
  size: PropTypes.string,
  color: PropTypes.string,
  type: PropTypes.string,
  isCompleted: PropTypes.bool,
  isError: PropTypes.bool
};

Loader.defaultProps = {
  isCompleted: false
};

Loader.size = LoaderSize;
Loader.color = LoaderColor;
Loader.type = LoaderType;

export default Loader;
