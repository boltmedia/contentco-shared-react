import React from 'react';
import PropTypes from 'prop-types';
import Styles from './Input.module.scss';
import classNames from 'classnames';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import AsyncPaginate from 'react-select-async-paginate';
import CreatableSelect from 'react-select/creatable';

class SelectInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // active: (props.locked && props.active) || false,
      active: props.active || false,
      value: props.value || '',
      error: props.error || '',
      label: props.label || 'Label',
      hasValue: false
    };
  }

  static getDerivedStateFromProps(props, state) {
    // This really shouldnt be used but I'm not aware of a better technique to update state from props
    if (props.error !== state.error) {
      state.error = props.error || '';
      if (state.error) {
        state.hasValue = true;
      }
    }

    if (props.value !== state.value) {
      state.value = props.value || '';
    }

    if (props.value) {
      if (props.value.length > 0 || Object.keys(props.value).length > 0) {
        state.hasValue = true;
      }
    } else {
      state.hasValue = false;
    }

    return state;
  }

  handleChange = (event, { action, name }) => {
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
      this.props.onChange({ ...event, target: { name, value: event }, action });
    } catch (err) {
      console.error(err);
      // pass
    }
  };

  handleKeyPress = (event) => {
    // For passing up keypresses + autoselectInput
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
    const { predicted, locked, name, required, className } = this.props;

    const fieldClassName = classNames(
      Styles.container,
      className,
      ((locked ? active : active || value.length) || this.state.error) &&
        Styles.active,
      locked && !active && Styles.locked,
      this.props.isMulti ? Styles.multiContainer : '',
      this.props.noLabel ? Styles.noLabelContainer : ''
    );

    const customStyles = {
      option: (provided, state) => ({
        ...provided
        // borderColor: 'blue',
        // color: state.isSelected ? 'white' : 'black'
      }),
      input: (styles) => ({
        ...styles
        // borderColor: 'red',
      }),
      menu: (styles) => ({
        ...styles,
        // fontSize: '14px',
        // color: '#a1aab3',
        margin: '2px 0'
        // borderColor: 'green',
      }),
      placeholder: (styles) => ({
        ...styles
        // fontSize: '14px',
        // color: '#a1aab3',
        // marginLeft: '0'
        // borderColor: 'green',
      }),
      control: (styles) => ({
        ...styles,
        // borderRadius: '3px',
        // minHeight: '42px',
        // borderColor: '#a1aab3',
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

    let CustomSelect;
    if (this.props.isPaginated) {
      CustomSelect = AsyncPaginate;
    } else if (this.props.isAsync) {
      CustomSelect = AsyncSelect;
    } else {
      CustomSelect = Select;
    }

    let SelectComponent;
    if (this.props.isCreatable) {
      SelectComponent = CreatableSelect;
    } else {
      SelectComponent = Select;
    }

    return (
      <div className={fieldClassName}>
        {active && value && predicted && predicted.includes(value) && (
          <p className={Styles.predicted}>{predicted}</p>
        )}

        <CustomSelect
          className={classNames(
            Styles.select,
            Styles.field,
            this.props.isMulti ? Styles.multi : '',
            this.props.noLabel ? Styles.noLabel : ''
          )}
          classNamePrefix="s-contact"
          name={name}
          menuPlacement={this.props.menuPlacement || `auto`}
          styles={customStyles}
          placeholder={label}
          selectValue={value}
          defaultValue={value}
          value={value}
          required={required}
          isClearable={this.props.isClearable}
          getOptionLabel={this.props.getOptionLabel}
          getOptionValue={this.props.getOptionValue}
          valueRenderer={this.props.valueRenderer}
          options={this.props.options}
          onChange={this.handleChange}
          isMulti={this.props.isMulti}
          loadOptions={this.props.loadOptions}
          onInputChange={this.props.onInputChange}
          additional={{ page: 1 }}
          SelectComponent={SelectComponent}
          onCreateOption={this.props.onCreateOption}
          loadingMessage={this.props.loadingMessage}
          noOptionsMessage={this.props.noOptionsMessage}
          filterOption={this.props.filterOption}
          createOptionPosition={'first'}
        />

        <label
          htmlFor={name}
          className={classNames(
            Styles.label,
            this.state.error && Styles.error,
            this.state.hasValue && Styles.hasValue,
            this.props.noLabel && Styles.hideLabel
          )}>
          {this.state.error || label}
        </label>
      </div>
    );
  }
}

SelectInput.propTypes = {
  name: PropTypes.string.isRequired,
  menuPlacement: PropTypes.string,
  className: PropTypes.string,
  options: PropTypes.array,
  locked: PropTypes.bool,
  active: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  isClearable: PropTypes.bool,
  predicted: PropTypes.bool,
  required: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.object,
    PropTypes.number
  ]),
  label: PropTypes.string,
  onChange: PropTypes.func,
  onKeyPress: PropTypes.func,
  onBlur: PropTypes.func,
  getOptionLabel: PropTypes.func,
  getOptionValue: PropTypes.func,
  valueRenderer: PropTypes.func,
  onFocus: PropTypes.func,
  isAsync: PropTypes.bool,
  isPaginated: PropTypes.bool,
  loadOptions: PropTypes.func,
  onInputChange: PropTypes.func,
  noLabel: PropTypes.bool,
  loadingMessage: PropTypes.func,
  noOptionsMessage: PropTypes.func,
  filterOption: PropTypes.func
};

SelectInput.defaultProps = {
  isAsync: false,
  isPaginated: false,
  noLabel: false
};

export default SelectInput;
