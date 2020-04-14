import React from 'react';
import InputMask from 'react-input-mask';
import PropTypes from 'prop-types';
import Styles from './Input.module.scss';
import classNames from 'classnames';
import Datetime from 'react-datetime';
import moment from 'moment';
import 'react-datetime/css/react-datetime.css'; // for ES6 modules
import MaskedInput from 'react-text-mask';

class DateSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // active: (props.locked && props.active) || false,
      active: props.active || false,
      value: moment(props.value) || '',
      error: props.error || '',
      validError: null,
      required: props.required || false,
      label: props.label || 'Label',
      min: null
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.error !== state.error) {
      state.error = props.error || '';
    }

    if (props.value !== state.value) {
      state.value = moment(props.value) || '';
    }

    return state;
  }

  handleChange = (momentDate) => {
    if (!momentDate) {
      this.setState({ value: null }, () => {
        try {
          this.props.onChange(null);
        } catch (err) {
          console.error(err);
          return;
        }
      });
    } else if (momentDate instanceof moment === false) {
      console.log('not valid');
      return;
    }
    // Set value, deserialize and send back
    const value = momentDate;
    this.setState({ value }, () => {
      try {
        this.props.onChange(value);
      } catch (err) {
        console.error(err);
        return;
      }
    });
  };

  handleKeyPress = (event) => {
    this.setState({ error: '', validError: null });
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

    const callback = () => {
      // Note that I'm using the onchange callback on blur as well
      try {
        this.props.onChange(event, {
          valid: !this.state.validError
        });
      } catch (err) {
        return;
      }
      return;
    };
  };

  beforeMaskedValueChange = (newState, oldState, userInput) => {
    const { value } = newState;
    const selection = newState.selection;

    return {
      value,
      selection
    };
  };

  render() {
    const { active, label, value } = this.state;
    const { locked, name, required, placeholder } = this.props;

    const fieldClassName = classNames(
      Styles.container,
      placeholder && Styles.active,
      ((locked ? active : active || value) ||
        this.state.error ||
        this.state.validError ||
        locked) &&
      Styles.active,
      locked && !active && Styles.locked
    );
    // console.log('error', this.state.error);
    return (
      <div className={fieldClassName}>
        <Datetime
          dateFormat="DD/MM/YYYY"
          inputProps={{
            className: Styles.field,
            placeholder: placeholder || label
          }}
          closeOnSelect={true}
          strictParsing
          value={this.state.value}
          onChange={this.handleChange}
          timeFormat={this.props.showTime}
          isValidDate={this.props.isValidDate}
          renderInput={(props, openCalendar, closeCalendar) => {
            return (
              <React.Fragment>
                <MaskedInput
                  mask={[
                    /[0-9]/,
                    /\d/,
                    '/',
                    /\d/,
                    /\d/,
                    '/',
                    /\d/,
                    /\d/,
                    /\d/,
                    /\d/
                  ]}
                  keepCharPositions
                  {...props}
                />
                <label
                  htmlFor={name}
                  className={classNames(
                    Styles.label,
                    (this.state.error || this.state.validError) && Styles.error
                  )}>
                  {this.state.error || this.state.validError || label}
                </label>
              </React.Fragment>
            );
          }}
        />
      </div>
    );
  }
}

DateSelector.propTypes = {
  name: PropTypes.string.isRequired,
  locked: PropTypes.bool,
  active: PropTypes.bool,
  placeholder: PropTypes.string,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.func
  ]),
  required: PropTypes.bool,
  showTime: PropTypes.bool,
  value: PropTypes.string,
  step: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  onKeyPress: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  min: PropTypes.number,
  isValidDate: PropTypes.func
};

DateSelector.defaultProps = {
  type: 'text',
  step: null,
  max: null,
  showTime: false
};

export default DateSelector;