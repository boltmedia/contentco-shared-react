import React from 'react';
import PropTypes from 'prop-types';
import InputMask from 'react-input-mask';
import Styles from './Input.module.scss';
import classNames from 'classnames';

class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: props.active || false,
      value: props.value || '',
      error: props.error || '',
      label: props.label || 'Label'
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.error !== state.error) {
      state.error = props.error || '';
    }
    if (props.value !== state.value) {
      state.value = props.value || '';
    }

    return state;
  }

  invalidate = (event) => {
    if (this.props.type === 'number') {
      const nValue = parseFloat(event.target.value);
      if (!!this.props.max && nValue > parseFloat(this.props.max)) {
        const oValue = parseFloat(this.state.value);
        this.setState({ value: oValue });
        event.target.value = oValue;
      }

      if (
        !!this.props.maxLength &&
        (nValue || '').toString().length > parseFloat(this.props.maxLength)
      ) {
        const oValue = parseFloat(this.state.value);
        this.setState({ value: oValue });
        event.target.value = oValue;
      }
    }
    return event;
  };

  handleChange = (event) => {
    // THIS IS NOT WORKING YET..!

    let valid = true;
    const { invalidate } = this;
    event = invalidate(event);

    // if (this.props.pattern && event.target.value) {
    //   const reg = new RegExp(this.props.pattern, "gi");
    //   valid = reg.test(String(event.target.value));
    // }

    if (valid) {
      this.setState({
        value: event.target.value,
        error: ''
      });
    } else {
      this.setState({
        value: event.target.value,
        error: 'Not a valid URL'
      });
    }
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
    const { predicted, locked, name, required, id, placeholder } = this.props;

    const fieldClassName = classNames(
      this.props.className,
      Styles.container,
      placeholder && Styles.active,
      ((locked ? active : active || value) || this.state.error || locked) && Styles.active,
      locked && !active && Styles.locked
    );
    // console.log('error', this.state.error);
    return (
      <div className={fieldClassName}>
        {active && value && predicted && predicted.includes(value) && (
          <p className={Styles.predicted}>{predicted}</p>
        )}

        {!this.props.mask && (
          <input
            className={Styles.field}
            id={id}
            name={name}
            type={this.props.type}
            step={this.props.step}
            max={this.props.max}
            value={value}
            placeholder={placeholder || label}
            required={required}
            onChange={this.handleChange}
            onKeyPress={this.handleKeyPress}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
          />
        )}

        {this.props.mask && (
          <InputMask
            className={Styles.field}
            id={id}
            name={name}
            mask={this.props.mask}
            maskChar={this.props.maskChar}
            type={this.props.type}
            step={this.props.step}
            max={this.props.max}
            value={value}
            placeholder={placeholder || label}
            required={required}
            onChange={this.handleChange}
            onKeyPress={this.handleKeyPress}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
          />
        )}

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
  className: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  locked: PropTypes.bool,
  active: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  predicted: PropTypes.bool,
  required: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  mask: PropTypes.string,
  maskChar: PropTypes.string,
  step: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  onKeyPress: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  pattern: PropTypes.instanceOf(RegExp),
  maxLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

TextInput.defaultProps = {
  type: 'text',
  step: null,
  max: null,
  maxLength: null
};

export default TextInput;