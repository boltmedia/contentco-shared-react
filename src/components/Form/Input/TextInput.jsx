import React from 'react';
import PropTypes from 'prop-types';
import Styles from './Input.module.scss';
import classNames from 'classnames';

class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // active: (props.locked && props.active) || false,
      active: props.active || false,
      value: props.value || '',
      error: props.error || '',
      label: props.label || 'Label'
    };
  }

  static getDerivedStateFromProps(props, state) {
    // This really shouldnt be used but I'm not aware of a better technique to update state from props
    // console.log('getDerivedStateFromProps');
    // console.log(props);
    // console.log(state);
    if (props.error !== state.error) {
      state.error = props.error || '';
    }
    if (props.value !== state.value) {
      state.value = props.value || '';
    }

    return state;
  }

  handleChange = (event) => {
    this.setState({
      value: event.target.value,
      error: ''
    });

    // Pass any other change events from parent
    try {
      this.props.onChange(event);
    } catch (err) {
      return;
    }
  };

  handleKeyPress = (event) => {
    // For passing up keypresses + autoselect
    // console.log('handleKeyPress');
    if (event.which === 13) {
      this.setState({ value: this.props.predicted });
    }

    try {
      this.props.onKeyPress(event);
    } catch (err) {
      return;
    }
  };

  handleFocus = (event) => {
    if (this.props.locked) {
      this.stateState({ active: true });
    }
    try {
      this.props.onFocus(event);
    } catch (err) {
      return;
    }
  };

  handleBlur = (event) => {
    if (this.props.locked) {
      this.stateState({ active: false });
    }
    try {
      this.props.onBlur(event);
    } catch (err) {
      return;
    }
  };

  render() {
    const { active, value, label } = this.state;
    const { predicted, locked, name, required } = this.props;

    const fieldClassName = classNames(
      Styles.container,
      ((locked ? active : active || value) || this.state.error || locked) &&
        Styles.active,
      locked && !active && Styles.locked
    );
    // console.log('error', this.state.error);
    return (
      <div className={fieldClassName}>
        {active && value && predicted && predicted.includes(value) && (
          <p className={Styles.predicted}>{predicted}</p>
        )}
        <input
          className={Styles.field}
          id={name}
          name={name}
          type={this.props.type}
          step={this.props.step}
          max={this.props.max}
          value={value}
          placeholder={label}
          required={required}
          onChange={this.handleChange}
          onKeyPress={this.handleKeyPress}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
        />
        <label
          htmlFor={name}
          className={classNames(
            Styles.label,
            this.state.error && Styles.error
          )}>
          {this.state.error || label}
        </label>
      </div>
    );
  }
}

TextInput.propTypes = {
  name: PropTypes.string.isRequired,
  locked: PropTypes.bool,
  active: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  predicted: PropTypes.bool,
  required: PropTypes.bool,
  value: PropTypes.string,
  step: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  onKeyPress: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func
};

TextInput.defaultProps = {
  type: 'text',
  step: null,
  max: null
};

export default TextInput;
