import React from 'react';
import InputMask from 'react-input-mask';
import PropTypes from 'prop-types';
import Styles from './Input.module.scss';
import classNames from 'classnames';
import Datetime from 'react-datetime';
import moment from 'moment';
import 'react-datetime/css/react-datetime.css'; // for ES6 modules
import MaskedInput from 'react-text-mask';

class DateInput extends React.Component {
  constructor(props) {
    super(props);
    // serialize
    this.state = {
      // active: (props.locked && props.active) || false,
      active: props.active || false,
      month: props.month || '',
      year: props.year || '',
      value: this.serialize(props.month, props.year),
      error: props.error || '',
      validError: null,
      required: props.required || false,
      label: props.label || 'Label'
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.error !== state.error) {
      state.error = props.error || '';
    }
    // if (props.value !== state.value) {
    //   state.value = props.value || '';
    // }
    return state;
  }

  serialize = (month, year) => {
    // from month/yr to js date (not moment..)
    if (!month) return null;
    if (!year) return null;
    // From any inputs
    // return new Date(year, month + 1, 0, 0, 0, 0, 0);
    // Month stored is actual month # (1-12)
    return moment()
      .year(year)
      .month(month - 1);
  };

  deserialize = (date) => {
    if (!date) return { month: null, year: null };
    // from moment date to month/yr
    const month = date.month() + 1;
    // Month computed is 0-11
    const year = date.year();
    return { month, year };
  };

  handleChange = (momentDate) => {
    if (!momentDate) {
      this.setState({ value: null, month: null, year: null }, () => {
        try {
          this.props.onChange(null, { month: null, year: null });
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
    const { month, year } = this.deserialize(value);
    this.setState({ value, month, year }, () => {
      try {
        this.props.onChange(value, { month, year });
      } catch (err) {
        console.error(err);
        return;
      }
    });

    // const stringVal = String(event.target.value);
    // const month = parseInt(stringVal.substring(0, 2), 10);
    // const year = parseInt(stringVal.substring(4, 9), 10);
    // this.setState({ month, year }, () => {
    //   try {
    //     this.props.onChange(event, { month, year });
    //   } catch (err) {
    //     return;
    //   }
    // });
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
          month: this.state.month,
          year: this.state.year,
          valid: !this.state.validError
        });
      } catch (err) {
        return;
      }
      return;
    };

    // Doing this validation here just because I think this is the only case we use this component
    if (
      this.state.required &&
      (isNaN(this.state.month) || isNaN(this.state.year))
    ) {
      this.setState({ validError: 'Enter a date' }, callback);
    } else if (this.state.year < 1900 || this.state.year > 2030) {
      this.setState({ validError: 'Enter a valid year' }, callback);
    } else if (this.state.month > 12) {
      this.setState({ validError: 'Enter a valid month' }, callback);
    } else {
      this.setState({ validError: null }, callback);
    }
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
    const { active, month, year, label } = this.state;
    const { locked, name, required } = this.props;

    const fieldClassName = classNames(
      Styles.container,
      ((locked ? active : active || month || year) ||
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
          dateFormat="MM/YYYY"
          inputProps={{
            className: Styles.field,
            placeholder: label
          }}
          strictParsing
          value={this.state.value}
          onChange={this.handleChange}
          timeFormat={false}
          renderInput={(props, openCalendar, closeCalendar) => {
            return (
              <React.Fragment>
                <MaskedInput
                  mask={[/[0-1]/, /\d/, '/', /[1-2]/, /\d/, /\d/, /\d/]}
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

        {/*<InputMask
          className={Styles.field}
          id={name}
          name={name}
          mask="99 / 9999"
          maskChar={'_'}
          type={this.props.type}
          step={this.props.step}
          max={this.props.max}
          placeholder={label}
          value={
            (this.state.month || this.state.year) &&
            `${this.state.month} / ${this.state.year}`
          }
          required={required}
          onChange={this.handleChange}
          onKeyPress={this.handleKeyPress}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          beforeMaskedValueChange={this.beforeMaskedValueChange}
        />*/}
      </div>
    );
  }
}

DateInput.propTypes = {
  name: PropTypes.string.isRequired,
  locked: PropTypes.bool,
  active: PropTypes.bool,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.func
  ]),
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

DateInput.defaultProps = {
  type: 'text',
  step: null,
  max: null
};

export default DateInput;
