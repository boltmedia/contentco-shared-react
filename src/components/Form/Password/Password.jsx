import React from 'react';
import zxcvbn from 'zxcvbn';
import PropTypes from 'prop-types';
import Styles from './Password.module.scss';
import classNames from 'classnames';

export default class Password extends React.Component {
  // This is a copied and updated version of PasswordStrength
  constructor(props) {
    super(props);

    this.state = {
      active: props.active || false,
      error: props.error || null,
      score: 0,
      isValid: null,
      value: props.value || '',
      togglePassword: false
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.error !== state.error) {
      state.error = props.error || null;
      state.isValid = !props.error;
    }
    return state;
  }

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

  isTooShort(password) {
    return password.length < this.props.minLength;
  }

  handleToggle = () => {
    if (this.state.togglePassword) {
      this.setState({ togglePassword: false });
    } else {
      this.setState({ togglePassword: true });
    }
  };

  handleChange = (e) => {
    const { onChange, minScore } = this.props;
    let score = 0;
    let error = null;
    let result = null;

    // always sets a zero score when min length requirement is not met
    // which avoids unnecessary zxcvbn computations (they require quite lots of CPU)
    if (
      this.props.showStrength &&
      e.target.value &&
      !this.isTooShort(e.target.value)
    ) {
      result = zxcvbn(e.target.value);
      score = result.score;
      try {
        error = result.feedback.suggestions.slice(-1)[0];
      } catch (err) {
        error = null;
      }
    }

    if (this.props.showStrength) {
      this.setState(
        {
          error: error,
          value: e.target.value,
          isValid: score >= minScore,
          score
        },
        () => {
          if (onChange !== null) {
            // Send back to parent for additional handlers
            onChange(this.state, result);
          }
        }
      );
    } else {
      e.persist();
      // Need to persist it to keep it in async callbacks
      this.setState(
        {
          error: this.props.error,
          value: e.target.value,
          isValid: !this.state.error
        },
        () => {
          if (onChange !== null) {
            // Send back to parent for additional handlers, with the event
            onChange(e);
          }
        }
      );
    }
  };

  handleKeyPress = (e) => {
    if (this.props.onKeyPress) {
      this.props.onKeyPress(e);
    }
  };

  render() {
    const { score, value, active, isValid } = this.state;

    const strengthClasses = [
      Styles.isStrength0,
      Styles.isStrength1,
      Styles.isStrength2,
      Styles.isStrength3,
      Styles.isStrength4
    ];

    const fieldClassName = classNames(
      Styles.container,
      (active || value || isValid === false) && Styles.active,
      {
        [strengthClasses[score]]: value.length > 0
      }
    );

    // const inputClass = classNames(
    //   Styles.field, {
    //     [Styles.isPasswordInvalid]: !isValid
    //   },
    //   this.props.className, // classNames method will handle this if this is undefined or empty
    // );

    const toogleText = this.state.togglePassword ? 'hide' : 'show';
    const passwordType = this.state.togglePassword ? 'text' : 'password';
    return (
      <div className={fieldClassName}>
        <input
          className={Styles.field}
          name={this.props.name}
          id="password"
          type={passwordType}
          value={this.state.value}
          autoComplete="off"
          placeholder={this.props.placeholder}
          autoFocus={this.props.autoFocus}
          onChange={this.handleChange.bind(this)}
          onFocus={this.handleFocus.bind(this)}
          onBlur={this.handleBlur.bind(this)}
          onKeyPress={this.handleKeyPress.bind(this)}
        />
        <label
          htmlFor="password"
          className={classNames(
            Styles.label,
            isValid === false && Styles.error
          )}>
          {(isValid === false && this.state.error) || this.props.placeholder}
        </label>
        <span className={Styles.button} onClick={this.handleToggle}>
          {toogleText}
        </span>
        {this.props.showStrength && (
          <div
            className={classNames(
              Styles.strength,
              value && Styles['score' + score]
            )}
          />
        )}
      </div>
    );
  }
}

Password.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  onKeyPress: PropTypes.func,
  onChange: PropTypes.func,
  autoFocus: PropTypes.bool,
  minLength: PropTypes.number,
  minScore: PropTypes.number,
  placeholder: PropTypes.string,
  style: PropTypes.object,
  showStrength: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
};

Password.defaultProps = {
  showStrength: false,
  name: 'password',
  error: null,
  onChange: null,
  className: '',
  minLength: 5,
  autoFocus: true,
  placeholder: 'Password',
  minScore: 2
};
