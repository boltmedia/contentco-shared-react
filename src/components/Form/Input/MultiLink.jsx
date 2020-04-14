import React from 'react';
import PropTypes from 'prop-types';
import Styles from './Input.module.scss';
import classNames from 'classnames';
import { authRequest } from '../../../shared/helpers/apis';
import Button, {
  buttonStyles,
  ButtonType,
  ButtonSize
} from '../../Button/Button';
import Loader from '../../Loader/Loader';

class MultiLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // active: (props.locked && props.active) || false,
      // active: props.active || props.links.length ? true : false || false,
      active: props.active || false,
      loading: false,
      links: props.links || [],
      value: props.value || '',
      error: props.error || '',
      label: props.label || 'Label'
    };
  }

  ensureHttpPrefix = (value, prefix = 'http://') => {
    // Very crude method, taken from application
    // TODO(tim) add additional prefixes, move to an array for the prefixes, and update
    const httpPrefix = 'http://';
    const httpsPrefix = 'https://';
    const re = /^(https?):\/\//i;
    if (
      value &&
      !re.test(value) &&
      prefix.indexOf(value) !== 0 &&
      httpPrefix.indexOf(value) !== 0 &&
      httpsPrefix.indexOf(value) !== 0
    ) {
      return prefix + value;
    }

    return value;
  };

  handleChange = (event) => {
    event.target.value = this.ensureHttpPrefix(event.target.value);

    this.setState({
      value: event.target.value,
      error: ''
    });

    // Pass any other change events from parent
    try {
      this.props.onChange(event);
    } catch (err) {
      //pass
    }
  };

  handleUrlCreate = (event) => {
    this.setState({ loading: true });
    const url = `${this.props.server}/${this.props.name}/`;

    const payload = {
      [this.props.field]: this.state.value
    };

    const config = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };

    authRequest
      .post(url, payload, config)
      .then((response) => {
        const links = this.state.links;
        links.push(response.data);
        this.setState({ links: links, value: '', error: '' });
        if (this.props.onResponse) {
          this.props.onResponse(response.data);
        }
        this.setState({ loading: false });
      })
      .catch((error) => {
        try {
          this.setState({ error: error.response.data[this.props.field][0] });
        } catch (e) {
          console.error(error);
        }
        this.setState({ loading: false });
      });
  };

  handleDelete = (event, link) => {
    const url = `${this.props.server}/${this.props.name}/${link.id}/`;

    const config = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };

    authRequest
      .delete(url, config)
      .then((response) => {
        const links = this.state.links;
        const index = links.indexOf(link);
        links.splice(index, 1);

        this.setState({ links: links });

        // if (this.props.onResponse) {
        //   this.props.onResponse(response.data)
        // }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  handleKeyPress = (event) => {
    // For passing up keypresses + autoselect
    if (event.which === 13) {
      this.handleUrlCreate();
    }
    try {
      this.props.onKeyPress(event);
    } catch (err) {
      // pass;
    }
  };

  handleFocus = (event) => {
    if (this.props.locked) {
      this.stateState({ active: true });
    }
    try {
      this.props.onFocus(event);
    } catch (err) {
      // pass;
    }
  };

  handleBlur = (event) => {
    if (this.props.locked) {
      this.stateState({ active: false });
    }
    try {
      this.props.onBlur(event);
    } catch (err) {
      // pass;
    }
  };

  render() {
    const { active, value, label } = this.state;
    const { locked, name, required } = this.props;

    const fieldClassName = classNames(
      Styles.container,
      Styles.containerArea,
      Styles.containerMultiLink,
      ((locked ? active : active || value) || this.state.error) &&
        Styles.active,
      locked && !active && Styles.locked
    );
    // console.log('error', this.state.error);
    const linkList = this.state.links.map((link, index) => {
      return (
        <div className={Styles.link} key={index}>
          <a
            href={link[this.props.field]}
            target="_blank"
            rel="noopener noreferrer">
            {' '}
            {link.title || link[this.props.field]}{' '}
          </a>
          <div
            className={Styles.remove}
            onClick={(e) => {
              this.handleDelete(e, link);
            }}>{`Remove`}</div>
        </div>
      );
    });
    return (
      <div className={fieldClassName}>
        <input
          className={Styles.field}
          style={{ paddingRight: '95px' }}
          id={name}
          name={name}
          type="text"
          value={value}
          placeholder={this.props.activeLabel || label}
          required={required}
          onChange={this.handleChange}
          onKeyPress={this.handleKeyPress}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
        />
        <label
          htmlFor={name}
          className={classNames(
            Styles.label,
            this.state.error && Styles.error
          )}>
          {this.state.error || label}
        </label>
        <Button
          className={Styles.addButton}
          type={ButtonType.BLUE}
          onClick={this.handleUrlCreate}
          disabled={!value}>
          {(this.state.loading && (
            <Loader color={Loader.color.WHITE} size={Loader.size.SMALL} />
          )) ||
            `Add Link`}
        </Button>
        {this.state.links && this.state.links.length > 0 && (
          <div className={Styles.linkList}>{linkList}</div>
        )}
      </div>
    );
  }
}

MultiLink.propTypes = {
  name: PropTypes.string.isRequired,
  field: PropTypes.string,
  links: PropTypes.array,
  activeLabel: PropTypes.string,
  server: PropTypes.string,
  locked: PropTypes.bool,
  active: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  required: PropTypes.bool,
  value: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  onKeyPress: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func
};

export default MultiLink;
