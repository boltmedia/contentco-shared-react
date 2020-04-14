import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Styles from '../Input.module.scss';
import classNames from 'classnames';
import Select, { components } from 'react-select';
import AsyncSelect from 'react-select/async';
import AsyncPaginate from 'react-select-async-paginate';
import CreatableSelect from 'react-select/creatable';
import { set } from 'lodash';

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import OrderableMultiValue from './components/OrderableMultiValue';
import { orderDragged } from './helpers';

class SortableSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // active: (props.locked && props.active) || false,
      active: props.active || false,
      value: props.value.map((o, i) => set(o, 'index', i)) || '',
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
      this.props.onChange({ ...event, target: { name, value: event } });
    } catch (err) {
      console.error(err);
      // pass
    }
  };

  handleKeyPress = (event) => {
    // For passing up keypresses + autoSortableSelect
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

  moveDraggedOption = (dragIndex, hoverIndex) => {
    const initialList = this.state.value;
    if (hoverIndex >= initialList.length) {
      let k = hoverIndex - initialList.length + 1;
      while (k--) {
        initialList.push(undefined);
      }
    }
    initialList.splice(hoverIndex, 0, initialList.splice(dragIndex, 1)[0]);
    // initialList.map((o, i) => set(o, 'index', i))
    this.setState((state) => ((state.value = initialList), state));
  };

  render() {
    const { active, value, label } = this.state;
    const { predicted, locked, name, required } = this.props;

    const fieldClassName = classNames(
      Styles.container,
      ((locked ? active : active || value.length) || this.state.error) &&
        Styles.active,
      locked && !active && Styles.locked,
      this.props.isMulti ? Styles.multiContainer : ''
    );

    const customStyles = {
      menu: (styles) => ({
        ...styles,
        margin: '2px 0'
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
      }),
      multiValue: (styles, { isDragging }) => ({
        ...styles,
        margin: '0',
        opacity: isDragging ? 0.5 : null
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
            this.props.isMulti ? Styles.multi : ''
          )}
          classNamePrefix="s-contact"
          name={name}
          menuPlacement={this.props.menuPlacement || `auto`}
          styles={customStyles}
          placeholder={label}
          selectValue={value}
          defaultValue={value}
          value={value && value.map((o, i) => set(o, 'index', i))}
          required={required}
          isClearable={this.props.isClearable}
          getOptionLabel={this.props.getOptionLabel}
          getOptionValue={this.props.getOptionValue}
          options={this.props.options}
          onChange={this.handleChange}
          isMulti={this.props.isMulti}
          loadOptions={this.props.loadOptions}
          onInputChange={this.props.onInputChange}
          additional={{ page: 1 }}
          SelectComponent={SelectComponent}
          onCreateOption={this.props.onCreateOption}
          createOptionPosition={'first'}
          components={{ MultiValue: OrderableMultiValue }}
          moveDraggedOption={this.moveDraggedOption}
        />
        <label
          htmlFor={name}
          className={classNames(
            Styles.label,
            this.state.error && Styles.error,
            this.state.hasValue && Styles.hasValue
          )}>
          {this.state.error || label}
        </label>
      </div>
    );
  }
}

SortableSelect.propTypes = {
  name: PropTypes.string.isRequired,
  menuPlacement: PropTypes.string,
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
    PropTypes.object
  ]),
  label: PropTypes.string,
  onChange: PropTypes.func,
  onKeyPress: PropTypes.func,
  onBlur: PropTypes.func,
  getOptionLabel: PropTypes.func,
  getOptionValue: PropTypes.func,
  onFocus: PropTypes.func,
  isAsync: PropTypes.bool,
  isPaginated: PropTypes.bool,
  isCreatable: PropTypes.bool,
  loadOptions: PropTypes.func,
  onInputChange: PropTypes.func
};

SortableSelect.defaultProps = {
  isAsync: false,
  isPaginated: false,
  isCreatable: false
};
export default DragDropContext(HTML5Backend)(SortableSelect);
