import React from 'react';
import PropTypes from 'prop-types';
import Styles from './Input.module.scss';
import QuillStyles from './Quill.module.scss';
import classNames from 'classnames';
import ReactQuill from 'react-quill';
// import ReactQuill, { Quill, Mixin, Toolbar } from 'react-quill'; // ES6
// import 'react-quill/dist/quill.snow.css'; // ES6
import 'react-quill/dist/quill.bubble.css'; // ES6
// import 'react-quill/dist/quill.core.css'; // ES6

const QuillEditor = (props) => {
  const fieldClassName = classNames(
    Styles.htmlContainer,
    props.className,
    ((props.locked ? props.active : props.active || props.value) ||
      props.error) &&
      Styles.active,
    props.locked && !props.active && Styles.locked
  );

  const handleChange = (content, delta, source, editor) => {
    let updateContent;
    if (content === '<p><br></p>') {
      updateContent = '';
    } else {
      updateContent = content;
    }
    // this.setState({ value: updateContent });
    try {
      props.onChange({
        target: { name: props.name, value: updateContent }
      });
    } catch (err) {
      return;
    }
  };
  return (
    <div className={fieldClassName} style={props.style}>
      <ReactQuill
        className={classNames(Styles.htmlTextArea, QuillStyles.editor)}
        id={props.name}
        name={props.name}
        value={props.value}
        theme="bubble"
        placeholder={props.placeholder}
        scrollingContainer="#scrollContainer"
        onChange={handleChange}
      />
      <label
        htmlFor={props.name}
        className={classNames(Styles.label, props.error && Styles.error)}>
        {props.error || props.label}
      </label>
    </div>
  );
};

QuillEditor.props = {
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
  onFocus: PropTypes.func,
  className: PropTypes.string
};

// class QuillEditor extends React.Component {
//   static propTypes = {
//     name: PropTypes.string.isRequired,
//     locked: PropTypes.bool,
//     active: PropTypes.bool,
//     error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
//     predicted: PropTypes.bool,
//     required: PropTypes.bool,
//     value: PropTypes.string,
//     label: PropTypes.string,
//     placeholder: PropTypes.string,
//     onChange: PropTypes.func,
//     onKeyPress: PropTypes.func,
//     onBlur: PropTypes.func,
//     onFocus: PropTypes.func,
//     className: PropTypes.string,
//     style: PropTypes.object
//   };

//   constructor(props) {
//     super(props);
//     this.state = {
//       active: props.active || false,
//       value: props.value || '',
//       error: props.error || '',
//       label: props.label || 'Label'
//     };
//   }

//   handleChange = (content, delta, source, editor) => {
//     let updateContent;
//     if (content === '<p><br></p>') {
//       updateContent = '';
//     } else {
//       updateContent = content;
//     }
//     this.setState({ value: updateContent });
//     try {
//       this.props.onChange({
//         target: { name: this.props.name, value: updateContent }
//       });
//     } catch (err) {
//       return;
//     }
//   };

//   render() {
//     const { locked, active, value, error } = this.state;
//     const fieldClassName = classNames(
//       Styles.htmlContainer,
//       this.props.className,
//       ((locked ? active : active || value) || error) && Styles.active,
//       locked && !active && Styles.locked
//     );
//     return (
//       <div className={fieldClassName} style={this.props.style}>
//         <ReactQuill
//           className={classNames(Styles.htmlTextArea, QuillStyles.editor)}
//           id={this.props.name}
//           name={this.props.name}
//           value={value}
//           theme="bubble"
//           placeholder={this.props.placeholder}
//           onChange={this.handleChange}
//         />
//         <label
//           htmlFor={this.props.name}
//           className={classNames(
//             Styles.label,
//             this.state.error && Styles.error
//           )}>
//           {this.state.error || this.props.label}
//         </label>
//       </div>
//     );
//   }
// }

export default QuillEditor;
