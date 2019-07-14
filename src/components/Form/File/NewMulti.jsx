import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Dropzone from 'react-dropzone';
// import convert from 'htmr';

import { request, checkStatus } from '../../../helpers/apis';

import classNames from 'classnames';
import Styles from './File.module.scss';
import TruncateString from 'react-truncate-string';

class NewMulti extends Component {
  constructor(props) {
    super(props);
    this.state = {
      label: props.label || '',
      error: props.error || '',
      files: props.files
    };
  }

  static getDerivedStateFromProps(props, state) {
    // This really shouldnt be used but I'm not aware of a better technique to update state from props
    if (props.error !== state.error) {
      state.error = props.error || '';
    }
    if (props.files !== state.files) {
      state.files = props.files;
    }
    return state;
  }

  handleDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      console.log('file', file);

      const formData = new FormData();
      if (file) {
        formData.append(this.props.field, file, file.fileName || file.name);
      }

      const config = {
        headers: { 'content-type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          var percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (percent >= 100) {
            this.setState({ percent: 100 });
          } else {
            this.setState({ percent });
          }
        }
      };

      const url = `${this.props.endpoint}/${this.props.name}/`;

      request
        .post(url, formData, config)
        .then((response) => {
          const files = this.state.files;
          this.setState({ files: files.push(response.data) });
          if (this.props.onResponse) {
            this.props.onResponse(response.data);
          }
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
          this.setState({ percent: 0 });
        });
    });
  };

  handleRemove = (event, file) => {
    const url = `${this.props.endpoint}/${this.props.name}/${file.id}/`;
    request
      .delete(url)
      .then((response) => {
        const files = this.state.files;
        const index = files.indexOf(file);
        console.log('index', index);
        this.setState({ files: files.slice(index) });

        if (this.props.onRemoveResponse) {
          this.props.onRemoveResponse(response.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });

    // fetch(`${this.props.endpoint}/${this.props.name}/${file.id}/`, {
    //   method: 'DELETE',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json'
    //   }
    // }).then(response => {
    //   if (response.ok) {
    //     if (this.props.onResponse) {
    //       this.props.onResponse(file)
    //     }
    //   } else {
    //     // error
    //   }
    // });
  };

  getName = (url) => {
    if (url) {
      return url.substring(url.lastIndexOf('/') + 1);
    }
  };

  render() {
    console.log('this.props.files', this.props.files);
    const fileList =
      this.props.files &&
      this.props.files.map((file, index) => {
        console.log('map', file[this.props.field]);
        return (
          <div key={index} className={classNames(Styles.file)}>
            <div className={Styles.fileName}>
              <TruncateString text={this.getName(file[this.props.field])} />
            </div>
            <div
              className={Styles.fileRemove}
              onClick={(e) => this.handleRemove(e, file)}>
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
        );
      });

    return (
      <div
        className={classNames(
          Styles.newContainer,
          Styles.multi,
          this.props.files && this.props.files.length > 0 && Styles.hasFile
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
                <div {...getRootProps()} style={{ outline: 'none' }}>
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
        <div className={Styles.fileList}>{fileList}</div>
      </div>
    );
  }
}

NewMulti.propTypes = {
  name: PropTypes.string.isRequired,
  field: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  files: PropTypes.array,
  label: PropTypes.string,
  idleLabel: PropTypes.string,
  required: PropTypes.bool,
  endpoint: PropTypes.string,
  onInit: PropTypes.func,
  onFileUpdate: PropTypes.func,
  onResponse: PropTypes.func,
  onRemoveResponse: PropTypes.func
};

export default NewMulti;