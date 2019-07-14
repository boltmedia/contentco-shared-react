import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Import React FilePond
import { FilePond, registerPlugin } from 'react-filepond';
import Button, { ButtonType } from '../../Button/Button';

// Import FilePond styles
import 'filepond/dist/filepond.min.css';

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
// `npm i filepond-plugin-image-preview filepond-plugin-image-exif-orientation --save`
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { checkStatus } from '../../../helpers/apis';

import classNames from 'classnames';
import Styles from './File.module.scss';

import Cookies from 'universal-cookie';

const cookies = new Cookies();
const token = cookies.get('token');

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateSize
);

class SingleUpload extends Component {
  // Note that this requires the object containing the file to be loaded prior to render
  constructor(props) {
    super(props);
    this.state = {
      label: props.label || '',
      error: props.error || ''
    };
    if (props.value) {
      this.state.files = [{
        source: props.value,
        options: {
          type: 'local'
        }
      }];
    }
  }

  static getDerivedStateFromProps(props, state) {
    // This really shouldnt be used but I'm not aware of a better technique
    // to update state from props
    if (props.error !== state.error) {
      state.error = props.error || '';
    }
    // if (props[name] !== state[name]) {
    //   state[name] = props[name] || "";
    // }
    return state;
  }

  handleInit = () => {
    // Passes init to parent component
    try {
      this.props.onInit(this.pond);
    } catch (err) {
      // pass
    }
  };

  render() {
    const { name, method } = this.props;

    const serverConfig = {
      url: this.props.server,
      process: {
        url: '/',
        method: method || 'PUT',
        withCredentials: false,
        headers: {
          Authorization: `Token ${token}`
        },
        onload: (data) => {
          const response = JSON.parse(data);
          if (this.props.onResponse) {
            // this.props.onFileUpdate(response[name])
            this.props.onResponse(response);
          }
          return data;
        }
      },
      revert: (uniqueFileId, load, error) => {
        fetch(`${this.props.server}/`, {
            method: 'PUT',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Token ${token}`
            },
            body: JSON.stringify({
              [name]: null
            })
          })
          .then((res) => {
            return checkStatus(res);
          })
          .then(
            (response) => {
              if (this.props.onResponse) {
                this.props.onResponse(response);
              }
              load();
            },
            (error) => {
              // pass
            }
          );
      },
      remove: (source, load, error) => {
        fetch(`${this.props.server}/`, {
            method: 'PUT',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Token ${token}`
            },
            body: JSON.stringify({
              [name]: null
            })
          })
          .then((res) => {
            return checkStatus(res);
          })
          .then(
            (response) => {
              if (this.props.onResponse) {
                this.props.onResponse(response);
              }
              load();
            },
            (error) => {
              // pass
            }
          );
      },
      load: (source, load, error, progress, abort, headers) => {
        const request = new XMLHttpRequest();
        request.open('GET', source, true);
        request.responseType = 'blob';
        request.onload = () => {
          const reader = new FileReader();
          reader.readAsDataURL(request.response);
          reader.onload = (e) => {
            load(request.response);
          };
        };
        request.send();
      }
    };

    return (
      <div className={classNames(Styles.container, Styles.single)}>
        <label
          htmlFor={name}
          className={classNames(
            Styles.label,
            this.state.error && Styles.error
          )}>
          {this.state.error || this.state.label}
        </label>
        <FilePond
          name={name}
          allowPaste={false}
          maxFileSize="25MB"
          ref={(ref) => (this.pond = ref)}
          imagePreviewMaxHeight={100}
          className={Styles.file}
          allowMultiple={false}
          files={this.state.files}
          server={serverConfig}
          oninit={() => this.handleInit()}
          labelIdle={this.props.idleLabel}
          onupdatefiles={(fileItems) => {
            this.setState({
              files: fileItems.map((fileItem) => fileItem.file)
            });
          }}
        />
        {(!this.state.files || this.state.files.length == 0) && (
          <Button
            className={Styles.addButton}
            type={ButtonType.BLUE}
            onClick={(e) => {
              this.pond.browse();
            }}>{`Browse`}</Button>
        )}
      </div>
    );
  }
}

SingleUpload.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  label: PropTypes.string,
  idleLabel: PropTypes.string,
  server: PropTypes.string,
  onInit: PropTypes.func,
  onResponse: PropTypes.func
};

export default SingleUpload;