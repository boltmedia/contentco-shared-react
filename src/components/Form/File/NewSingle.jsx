import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Dropzone from 'react-dropzone';

import { authRequest } from '../../../helpers/apis';
import classNames from 'classnames';
import Styles from './File.module.scss';
import TruncateString from 'react-truncate-string';

class NewSingle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      label: props.label || '',
      error: props.error || ''
    };
  }


  handleDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {

      const formData = new FormData();
      if (file) {
        formData.append(this.props.name, file, file.fileName || file.name);
      }
      authRequest.put(this.props.server, data).then(
        (response) => {
          if (this.props.onResponse) {
            this.props.onResponse(response);
          }
        },
        (error) => {
          // pass
        }
      );
    });
  };

  handleRemove = (event) => {
    const data = JSON.stringify({
      [this.props.name]: null
    });
    console.log('handle remove', this.props.server);

    authRequest.put(`${this.props.server}reset-picture/`, data).then(
      (response) => {
        if (this.props.onResponse) {
          this.props.onResponse(response);
        }
      },
      (error) => {
        // pass
      }
    );
  };

  getName = (url) => {
    if (url) {
      return url.substring(url.lastIndexOf('/') + 1);
    }
  };

  render() {
    return (
      <div
        className={classNames(
          Styles.newContainer,
          this.props.value && Styles.hasFile
        )}>
        <label
          htmlFor={name}
          className={classNames(
            Styles.label,
            this.state.error && Styles.error
          )}>
          {this.state.error || this.state.label}
        </label>
        <div className={classNames(Styles.drop)}>
          <Dropzone onDrop={this.handleDrop}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <div className={Styles.placeholder}>
                    <span>{this.state.label}</span>
                    <div className={Styles.browse}>Browse</div>
                  </div>
                </div>
              </section>
            )}
          </Dropzone>
        </div>
        <div className={classNames(Styles.file)}>
          <div className={Styles.fileName}>
            <TruncateString text={this.getName(this.props.value)} />
          </div>
          <div className={Styles.fileRemove} onClick={this.handleRemove}>
            <div className={Styles.removeCross}>
              <svg
                width="26"
                height="26"
                viewBox="0 0 26 26"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11.586 13l-2.293 2.293a1 1 0 0 0 1.414 1.414L13 14.414l2.293 2.293a1 1 0 0 0 1.414-1.414L14.414 13l2.293-2.293a1 1 0 0 0-1.414-1.414L13 11.586l-2.293-2.293a1 1 0 0 0-1.414 1.414L11.586 13z"
                  fill="currentColor"
                  fillRule="nonzero"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

NewSingle.propTypes = {
  name: PropTypes.string.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  label: PropTypes.string,
  idleLabel: PropTypes.string,
  required: PropTypes.bool,
  server: PropTypes.string,
  onInit: PropTypes.func,
  onFileUpdate: PropTypes.func,
  onResponse: PropTypes.func
};

export default NewSingle;