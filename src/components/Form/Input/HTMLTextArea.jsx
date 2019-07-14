import React from 'react';
import PropTypes from 'prop-types';
import Styles from './Input.module.scss';
import classNames from 'classnames';
import TextareaAutosize from 'react-autosize-textarea';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

class HTMLTextArea extends React.Component {
  static propTypes = {
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

  constructor(props) {
    super(props);
    const html = props.value || '';
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      const editorState = EditorState.createWithContent(contentState);
      this.state = {
        editorState,
        active: props.active || false,
        value: props.value || '',
        error: props.error || '',
        label: props.label || 'Label',
        name: props.name || 'No Name Provided'
      };
    }
  }

  handleEditorStateChange = (editorState) => {
    this.setState({
      editorState
    });

    this.setState({
      value: draftToHtml(convertToRaw(editorState.getCurrentContent())),
      error: ''
    });
    try {
      const event = {
        target: { name: this.state.name, value: this.state.value }
      };
      this.props.onChange(event);
    } catch (err) {
      return;
    }
  };

  render() {
    const { editorState, locked, active, value, error } = this.state;

    const fieldClassName = classNames(
      Styles.htmlContainer,
      ((locked ? active : active || (value.length > 8)) || error) &&
      Styles.active,
      locked && !active && Styles.locked
    );
    return (
      <div className={fieldClassName}>
        <Editor
          id={this.props.name}
          name={this.props.name}
          toolbarHidden
          placeholder={this.props.placeholder}
          editorClassName={Styles.htmlEditor}
          editorState={editorState}
          wrapperClassName={classNames(Styles.htmlTextArea)}
          onEditorStateChange={this.handleEditorStateChange}
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

export default HTMLTextArea;