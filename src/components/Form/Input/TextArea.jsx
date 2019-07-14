import React from 'react';
import PropTypes from 'prop-types';
import Styles from './Input.module.scss';
import classNames from 'classnames';
import TextareaAutosize from 'react-autosize-textarea';

class TextArea extends React.Component {
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
    // console.log(props);
    // console.log(state);
    if (props.error !== state.error) {
      state.error = props.error || '';
    }
    return state;
  }

  handleChange(event) {
    // console.log('handleChange');
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
  }

  handleKeyPress(event) {
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
  }

  handleFocus(event) {
    if (this.props.locked) {
      this.stateState({ active: true });
    }
    try {
      this.props.onFocus(event);
    } catch (err) {
      return;
    }
  }

  handleBlur(event) {
    if (this.props.locked) {
      this.stateState({ active: false });
    }
    try {
      this.props.onBlur(event);
    } catch (err) {
      return;
    }
  }

  render() {
    const { active, value, label } = this.state;
    const { predicted, locked, name, required } = this.props;

    const fieldClassName = classNames(
      Styles.container,
      Styles.containerArea,
      ((locked ? active : active || value) || this.state.error) &&
        Styles.active,
      locked && !active && Styles.locked
    );
    // console.log('error', this.state.error);
    return (
      <div className={fieldClassName}>
        {active && value && predicted && predicted.includes(value) && (
          <p className={Styles.predicted}>{predicted}</p>
        )}
        <TextareaAutosize
          className={classNames(Styles.field, Styles.textArea)}
          id={name}
          name={name}
          value={value}
          placeholder={this.props.placeholder || this.props.label}
          required={required}
          onChange={this.handleChange.bind(this)}
          onKeyPress={this.handleKeyPress.bind(this)}
          onFocus={this.handleFocus.bind(this)}
          onBlur={this.handleBlur.bind(this)}
        />
        <label
          htmlFor={name}
          className={classNames(
            Styles.label,
            this.state.error && Styles.error
          )}>
          {this.state.error || this.props.label}
        </label>
      </div>
    );
  }
}

TextArea.propTypes = {
  name: PropTypes.string.isRequired,
  locked: PropTypes.bool,
  active: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  predicted: PropTypes.bool,
  required: PropTypes.bool,
  value: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onKeyPress: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func
};

export default TextArea;
