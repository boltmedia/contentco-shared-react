import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Import React FilePond
import { FilePond, registerPlugin } from 'react-filepond';

// Import FilePond styles
import 'filepond/dist/filepond.min.css';

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
// `npm i filepond-plugin-image-preview filepond-plugin-image-exif-orientation --save`
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

import Button, {
  buttonStyles,
  ButtonType,
  ButtonSize
} from '../../Button/Button';

import classNames from 'classnames';
import Styles from './File.module.scss';

// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateSize
);

// Component
class MultiUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      label: props.label || ''
    };
    if (props.files) {
      this.state.files = props.files.map((file, index) => {
        return {
          source: file[props.field],
          options: {
            type: 'local',
            metadata: {
              id: file.id,
              url: file[props.field]
            }
          }
        };
      });
    }
  }

  handleInit = () => {
    try {
      this.props.onInit(this.pond);
    } catch (err) {
      // pass
    }
  };

  render() {
    const { name } = this.props;
    const serverConfig = {
      url: this.props.server,
      // process: {
      //   url: '/',
      //   method: 'PUT',
      //   withCredentials: false,
      // },
      process: (fieldName, file, metadata, load, error, progress, abort) => {
        console.log('process', metadata);
        // fieldName is the name of the input field
        // file is the actual file object to send
        const formData = new FormData();
        formData.append(this.props.field, file, file.name);

        const request = new XMLHttpRequest();
        request.open('POST', `${this.props.server}/${this.props.name}/`);

        // Should call the progress method to update the progress to 100% before calling load
        // Setting computable to false switches the loading indicator to infinite mode
        request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total);
        };

        // Should call the load method when done and pass the returned server file id
        // this server file id is then used later on when reverting or restoring a file
        // so your server knows which file to return without exposing that info to the client
        request.onload = function() {
          if (request.status >= 200 && request.status < 300) {
            // the load method accepts either a string (id) or an object
            load(request.responseText);
          } else {
            // Can call the error method if something is wrong, should exit after
            error('oh no');
          }
        };

        request.send(formData);

        // Should expose an abort method so the request can be cancelled
        return {
          abort: () => {
            // This function is entered if the user has tapped the cancel button
            request.abort();

            // Let FilePond know the request has been cancelled
            abort();
          }
        };
      },
      remove: (source, load, error) => {
        // Will work for existing files
        const file = this.pond.getFiles().find((file) => {
          return file.getMetadata().url === source;
        });

        const attachmentId = file.getMetadata().id;

        fetch(`${this.props.server}/attachments/${attachmentId}`, {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }).then(load());
      },
      revert: (uniqueFileId, load, error) => {
        // Will work with new files
        const attachmentId = JSON.parse(uniqueFileId).id;
        fetch(`${this.props.server}/attachments/${attachmentId}`, {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }).then(load());
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
      <div className={Styles.container}>
        <label htmlFor={name} className={classNames(Styles.label)}>
          {this.state.label}
        </label>
        <FilePond
          name={name}
          allowPaste={false}
          imagePreviewMaxHeight={100}
          maxFileSize="25MB"
          allowMultiple
          ref={(ref) => (this.pond = ref)}
          className={Styles.file}
          files={this.state.files}
          server={serverConfig}
          oninit={this.handleInit}
          labelIdle={this.props.idleLabel}
          onupdatefiles={(fileItems) => {
            // Set current file objects to this.state
            this.setState({
              files: fileItems.map((fileItem) => fileItem.file)
            });
          }}
        />
        <Button
          className={Styles.addButton}
          type={ButtonType.BLUE}
          onClick={(e) => {
            this.pond.browse();
          }}>{`Browse`}</Button>
      </div>
    );
  }
}

MultiUpload.propTypes = {
  name: PropTypes.string.isRequired,
  field: PropTypes.string,
  label: PropTypes.string,
  idleLabel: PropTypes.string,
  required: PropTypes.bool,
  server: PropTypes.string,
  onInit: PropTypes.func,
  onResponse: PropTypes.func,
  files: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
};

export default MultiUpload;