import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { omit, each } from "lodash";
import TextField from "@material-ui/core/TextField";

const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });

export default class ModelForm extends Component {
  constructor(props) {
    super(props);
    this.validator = ajv.compile(props.schema);
    this.state = this.getResetState(props);
  }

  getResetState(props) {
    return {
      values: (props || this.props).values || {},
      valuesMeta: {},
      valid: undefined
    }
  }

  onChange = (event) => {
    this.state.values[event.target.name] = event.target.value === ""
      ? undefined
      : event.target.value;

    if (this.props.forceValidation) {
      this.validateAll();
    } else {
      if (this.state.valuesMeta[event.target.name] && this.state.valuesMeta[event.target.name].dirty) {
        this.validateAttribute(event.target.name);
      }
    }

    this.notify();
    this.forceUpdate();
  };

  ensureAttributeMeta(name) {
    if (!this.state.valuesMeta[name]) {
      this.state.valuesMeta[name] = {};
    }
  }

  validateAttribute(attribute) {
    if (this.props.forceValidation) {
      this.validateAll();
      return;
    }
    this.state.valid = this.validator(this.state.values);

    this.ensureAttributeMeta(attribute);
    delete this.state.valuesMeta[attribute].error;

    if (!this.state.valid) {
      for (let item of this.validator.errors) {
        const name = item.params && item.params.missingProperty
          ? item.params.missingProperty
          : item.dataPath.slice(1);
        if (name === attribute) {
          this.state.valuesMeta[name].error = item.message;
        }
      }
    }
  }

  validateAll() {
    this.state.valid = this.validator(this.state.values);

    for (let attribute of this.props.attributes) {
      this.ensureAttributeMeta(attribute);
      delete this.state.valuesMeta[attribute].error;
    }

    if (!this.state.valid) {
      for (let item of this.validator.errors) {
        const name = item.params && item.params.missingProperty
          ? item.params.missingProperty
          : item.dataPath.slice(1);

        if (name) {
          this.state.valuesMeta[name].error = item.message;
        }
      }
    }
  }

  notify() {
    if (this.props.onChange) {
      this.props.onChange(this.state);
    }
  }

  onBlur = (event) => {
    this.ensureAttributeMeta(event.target.name);

    this.state.valuesMeta[event.target.name].dirty = true;
    this.validateAttribute(event.target.name);

    this.notify();
    this.forceUpdate();
  };

  onKeyPress = (event) => {
    switch(event.charCode) {
      case 13:
        if (this.props.onEnter) {
          this.props.onEnter()
        }
    }
  };

  getInputType(property) {
    if (property.password) {
      return "password";
    }
    if (property.format === "email") {
      return "email";
    }
    return "text";
  }

  renderAttribute = (attribute, index) => {
    const { schema, autoFocus, margin } = this.props;
    const property = schema.properties[attribute];
    if (!property) { return false; }

    const error = this.state.valuesMeta[attribute] && this.state.valuesMeta[attribute].error;

    return <TextField
      key={ index }
      type={ this.getInputType(property) }
      fullWidth
      autoFocus={ autoFocus && index === 0 }
      name={ attribute }
      label={ property.title || attribute }
      margin={ margin || "normal" }
      error={ !!error }
      helperText={ error || " " }
      value={ this.state.values[attribute] || "" }
      onBlur={ this.onBlur }
      onChange={ this.onChange }
      onKeyPress={ this.onKeyPress }
    />;
  };

  componentDidUpdate(prevProps) {
    if (this.props.forceValidation && !prevProps.forceValidation) {
      this.validateAll();
      this.notify();
      return;
    }
    if (prevProps.values !== this.props.values) {
      this.setState(this.getResetState());
    }
  }

  render() {
    return <Fragment>
      { this.props.attributes.map(this.renderAttribute) }
    </Fragment>
  }
};

ModelForm.propTypes = {
  schema: PropTypes.object.isRequired,
  attributes: PropTypes.arrayOf(PropTypes.string),
  values: PropTypes.object,
  onEnter: PropTypes.func,
  onChangeState: PropTypes.func,
  onChangeValues: PropTypes.func,
  autoFocus: PropTypes.bool,
  margin: PropTypes.oneOf(["normal", "dense", "none"]),
  forceValidation: PropTypes.bool
};
