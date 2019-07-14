import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import TextInput from './Input/TextInput';
import DateInput from './Input/DateInput';
import TextArea from './Input/TextArea';
import HTMLTextArea from './Input/HTMLTextArea';

import SelectInput from './Input/Select';
import SingleUpload from './File/Single';
import MultiUpload from './File/Multi';
import MultiLink from './Input/MultiLink';
import Password from './Password/Password';
import NewSingle from './File/NewSingle';
import NewMulti from './File/NewMulti';

const Form = (props) => {
  return <form />;
};

Form.TextInput = TextInput;
Form.DateInput = DateInput;
Form.TextArea = TextArea;
Form.Select = SelectInput;
Form.FileUpload = SingleUpload;
Form.MultiFileUpload = MultiUpload;
Form.SingleUpload = NewSingle;
Form.MultiUpload = NewMulti;
Form.MultiLink = MultiLink;
Form.Password = Password;
Form.HTMLTextArea = HTMLTextArea;

Form.propTypes = { className: PropTypes.string };
export default Form;
