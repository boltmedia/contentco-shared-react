import React from 'react';
import PropTypes from 'prop-types';
import Styles from './Input.module.scss';
import classNames from 'classnames';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import AsyncPaginate from 'react-select-async-paginate';
import CreatableSelect from 'react-select/creatable';
import { debounce } from 'lodash';

const SHRINK_THRESHOLD = 245;

class DualInputTypeSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // active: (props.locked && props.active) || false,
      active: props.active || false,
      inputValue: props.inputValue || '',
      selectValue: props.selectValue || '',
      error: props.error || '',
      inputLabel: props.inputLabel || 'Label',
      selectLabel: props.selectLabel || 'Label',
      hasValue: false,
      shouldShrink: false
    };
    this.debounceHandleResize = debounce(this.handleResize, 200);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.error !== state.error) {
      state.error = props.error || '';
      if (state.error) {
        state.hasValue = true;
      }
    }
    if (props.inputValue !== state.inputValue) {
      state.inputValue = props.inputValue || '';
    }

    if (props.selectValue !== state.selectValue) {
      state.selectValue = props.selectValue || '';
    }

    if (props.selectValue) {
      if (
        props.selectValue.length > 0 ||
        Object.keys(props.selectValue).length > 0
      ) {
        state.hasValue = true;
      }
    }

    return state;
  }

  handleInputChange = (event) => {
    this.setState({
      inputValue: event.target.inputValue,
      error: ''
    });
    // Pass any other change events from parent
    try {
      this.props.onInputChange(event);
    } catch (err) {
      return;
    }
  };

  handleSelectChange = (event, { action, name }) => {
    let optionLabel, optionValue;
    /*
      See documentation: https://react-select.com/props
    */
    if (action === 'select-option') {
      try {
        optionLabel = this.props.getOptionLabel(event);
        optionValue = this.props.getOptionValue(event);
      } catch (err) {
        // pass
      }

      if (event && event.value) {
        this.setState({
          hasValue: true,
          selectValue: event.value
        });
      } else if (optionLabel && optionValue) {
        this.setState({
          hasValue: true,
          selectValue: optionValue
        });
      } else {
        // Fallback
        this.setState({
          selectValue: null,
          hasValue: false,
          isClearable: true
        });
      }
    } else if (action === 'remove-value' || action === 'clear') {
      this.setState({
        selectValue: null,
        hasValue: false,
        isClearable: true
      });
    } else {
      // fallback, remove
      this.setState({
        hasValue: false,
        selectValue: null,
        isClearable: true
      });
    }

    // Pass any other change events from parent
    try {
      this.props.onSelectChange({ ...event, target: { name, value: event } });
    } catch (err) {
      console.error(err);
      // pass
    }
  };

  handleInputKeyPress = (event) => {
    try {
      this.props.onInputKeyPress(event);
    } catch (err) {
      return;
    }
  };

  handleKeyDown = (evt) => {
    if (this.props.type === 'number' && !this.validateNumericType(evt)) {
      evt.preventDefault();
      return false;
    }
    return true;
  };

  validateNumericType = (evt) => {
    const code = evt.which || event.keyCode;
    const isNumericKeys = (v) => (v >= 48 && v <= 57) || (v >= 96 && v <= 105); // 0-9 and numpad 0-9

    const isOtherValidKeys = (v, e) =>
      // backspace, delete, tab, escape, enter and .
      [46, 8, 9, 27, 13, 110, 190].includes(v) ||
      // Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Command+A
      ([65, 67, 86, 88].includes(v) &&
        (e.ctrlKey === true || e.metaKey === true)) ||
      // home, end, left, right, down, up
      (v >= 35 && v <= 40);

    return isNumericKeys(code) || isOtherValidKeys(code, evt);
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

  handleInputFocus = (event) => {
    try {
      this.props.onFocus(event);
    } catch (err) {
      return;
    }
  };

  handleFocus = (event) => {
    try {
      this.props.onFocus(event);
    } catch (err) {
      return;
    }
  };

  handleInputBlur = (event) => {
    try {
      this.props.onInputBlur(event);
    } catch (err) {
      return;
    }
  };

  handleBlur = (event) => {
    try {
      this.props.onBlur(event);
    } catch (err) {
      return;
    }
  };

  componentDidMount = () => {
    this.setState({
      shouldShrink: this.isSmall(this.container)
    });
    window.addEventListener('resize', this.debounceHandleResize);
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.debounceHandleResize);
  };

  handleResize = () => {
    this.setState({
      shouldShrink: this.isSmall(this.container)
    });
  };

  isSmall = (container) => {
    return container.offsetWidth <= SHRINK_THRESHOLD;
  };

  render() {
    const {
      active,
      inputValue,
      inputLabel,
      selectValue,
      selectLabel
    } = this.state;
    const {
      predicted,
      inputName,
      required,
      selectName,
      selectWidth
    } = this.props;

    const fieldClassName = classNames(
      this.props.className,
      Styles.container,
      Styles.dualContainer,
      Styles.active
    );

    const customStyles = {
      option: (provided, state) => ({
        ...provided
      }),
      input: (styles) => ({
        ...styles
      }),
      menu: (styles) => ({
        ...styles,
        margin: '2px 0'
      }),
      placeholder: (styles) => ({
        ...styles
      }),
      control: (styles) => ({
        ...styles,
        boxShadow: 'none',
        ':hover': {
          borderColor: '#a1aab3'
        }
      }),
      valueContainer: (styles) => ({
        ...styles,
        padding: '2px 15px',
        fontSize: '16px'
      }),
      singleValue: (styles) => ({
        ...styles,
        marginLeft: '0',
        fontSize: '16px'
      })
    };

    return (
      <div
        className={classNames(fieldClassName, {
          [Styles.shrink]: this.state.shouldShrink
        })}
        style={{ display: 'flex', width: '100%' }}
        ref={(el) => (this.container = el)}>
        <div className={classNames(Styles.dualInput)}>
          <input
            className={Styles.field}
            id={inputName}
            name={inputName}
            type={this.props.type}
            step={this.props.step}
            min="0"
            max={this.props.max}
            value={inputValue}
            placeholder="0"
            required={required}
            onChange={this.handleInputChange}
            onKeyPress={this.handleInputKeyPress}
            onFocus={this.handleInputFocus}
            onBlur={this.handleInputBlur}
            onKeyDown={this.handleKeyDown}
          />
        </div>
        <label
          htmlFor={inputName}
          className={classNames(
            Styles.label,
            this.state.error && Styles.error
          )}>
          {this.state.error || inputLabel}
        </label>
        <div
          className={classNames(Styles.dualSelect)}
          style={{ flexBasis: selectWidth }}>
          <Select
            className={classNames(Styles.select, Styles.field)}
            classNamePrefix="s-contact"
            name={selectName}
            menuPlacement={this.props.menuPlacement || `auto`}
            styles={customStyles}
            placeholder={selectLabel}
            selectValue={selectValue}
            defaultValue={selectValue}
            value={selectValue}
            required={required}
            isClearable={this.props.isClearable}
            getOptionLabel={this.props.getOptionLabel}
            getOptionValue={this.props.getOptionValue}
            valueRenderer={this.props.valueRenderer}
            options={this.props.selectOptions}
            loadOptions={this.props.loadOptions}
            onChange={this.handleSelectChange}
            additional={{ page: 1 }}
            SelectComponent={Select}
            onCreateOption={this.props.onCreateOption}
            createOptionPosition={'first'}
          />
        </div>
      </div>
    );
  }
}

DualInputTypeSelector.propTypes = {
  className: PropTypes.string,
  inputLabel: PropTypes.string,
  inputName: PropTypes.string.isRequired,
  active: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  predicted: PropTypes.bool,
  required: PropTypes.bool,
  inputValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  step: PropTypes.string,
  type: PropTypes.string,
  onChange: PropTypes.func,
  onKeyPress: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  onInputChange: PropTypes.func,
  onInputKeyPress: PropTypes.func,
  onInputBlur: PropTypes.func,
  onInputFocus: PropTypes.func,
  pattern: PropTypes.instanceOf(RegExp),
  selectName: PropTypes.string.isRequired,
  selectLabel: PropTypes.string,
  selectWidth: PropTypes.string,
  selectValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.object
  ]),
  getOptionLabel: PropTypes.func,
  getOptionValue: PropTypes.func,
  selectOptions: PropTypes.array,
  onSelectChange: PropTypes.func
};

DualInputTypeSelector.defaultProps = {
  type: 'text',
  step: null,
  max: null,
  selectWidth: '50%'
};

export default DualInputTypeSelector;
