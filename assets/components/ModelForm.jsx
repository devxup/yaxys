import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import { withConstants } from "../services/Utils"
import { withStyles } from "@material-ui/core/styles"
import { TextField, Button } from "@material-ui/core"
import ModelChip from "./ModelChip.jsx"
import ModelPicker from "./ModelPicker.jsx"
import ModelCreator from "./ModelCreator.jsx"
import { withNamespaces } from "react-i18next"
import Ajv from "ajv"

const ajv = new Ajv({ allErrors: true, format: "full" })

@withStyles(theme => ({
  m1PropertyLabel: {
    minWidth: 80,
  },
}))
@withConstants
@withNamespaces()
export default class ModelForm extends Component {
  static propTypes = {
    schema: PropTypes.object.isRequired,
    constants: PropTypes.object,
    attributes: PropTypes.arrayOf(PropTypes.string),
    values: PropTypes.object,
    onEnter: PropTypes.func,
    onChange: PropTypes.func,
    autoFocus: PropTypes.bool,
    margin: PropTypes.oneOf(["normal", "dense", "none"]),
    forceValidation: PropTypes.bool,
    t: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.validator = ajv.compile(props.schema)
    this.state = this.getResetState(props)
  }

  componentDidUpdate(prevProps) {
    if (this.props.forceValidation && !prevProps.forceValidation) {
      this.validateAll()
      this.notify()
      return
    }
    if (prevProps.values !== this.props.values) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState(this.getResetState())
    }
  }

  getResetState(props) {
    return {
      values: (props || this.props).values || {},
      valuesMeta: {},
      valid: undefined,
      pickerOpen: false,
      pickerIdentity: null,
      pickerAttribute: null,
      creatorOpen: false,
      creatorIdentity: null,
      creatorAttribute: null,
    }
  }

  onPickerClose = event => {
    this.setState({ pickerOpen: false })
  }

  onPick = item => {
    this.state.pickerOpen = false
    this._setValue(this.state.pickerAttribute, item)
  }

  onCreatorClose = event => {
    this.setState({ creatorOpen: false })
  }

  onCreate = item => {
    this.state.creatorOpen = false
    this._setValue(this.state.creatorAttribute, item)
  }

  _setValue(key, value) {
    this.state.values[key] = value
    if (this.props.forceValidation) {
      this.validateAll()
    } else {
      if (this.state.valuesMeta[key] && this.state.valuesMeta[key].dirty) {
        this.validateAttribute(key)
      }
    }

    this.notify()
    this.forceUpdate()
  }

  onChange = event => {
    this._setValue(event.target.name, event.target.value === "" ? undefined : event.target.value)
  }

  ensureAttributeMeta(name) {
    if (!this.state.valuesMeta[name]) {
      this.state.valuesMeta[name] = {}
    }
  }

  validateAttribute(attribute) {
    const { t } = this.props
    if (this.props.forceValidation) {
      this.validateAll()
      return
    }
    this.state.valid = this.validator(this.state.values)

    this.ensureAttributeMeta(attribute)
    delete this.state.valuesMeta[attribute].error

    if (!this.state.valid) {
      for (let item of this.validator.errors) {
        const name =
          item.params && item.params.missingProperty
            ? item.params.missingProperty
            : item.dataPath.slice(1)
        if (name === attribute) {
          this.state.valuesMeta[name].error = t(`AJV.${item.keyword}`)
        }
      }
    }
  }

  validateAll() {
    const { attributes, schema } = this.props

    this.state.valid = this.validator(this.state.values)

    for (let attribute of attributes || schema.defaultProperties) {
      this.ensureAttributeMeta(attribute)
      delete this.state.valuesMeta[attribute].error
    }

    if (!this.state.valid) {
      for (let item of this.validator.errors) {
        const name =
          item.params && item.params.missingProperty
            ? item.params.missingProperty
            : item.dataPath.slice(1)

        if (name) {
          this.state.valuesMeta[name].error = item.message
        }
      }
    }
  }

  notify() {
    if (this.props.onChange) {
      this.props.onChange(this.state)
    }
  }

  onBlur = event => {
    this.ensureAttributeMeta(event.target.name)

    this.state.valuesMeta[event.target.name].dirty = true
    this.validateAttribute(event.target.name)

    this.notify()
    this.forceUpdate()
  }

  onKeyPress = event => {
    switch (event.charCode) {
      case 13:
        this.validateAll()
        this.notify()
        this.props.onEnter?.()
        break
    }
  }

  getInputType(property) {
    if (property.password) {
      return "password"
    }
    if (property.format === "email") {
      return "email"
    }
    return "text"
  }

  onPickerOpen = (pickerAttribute, pickerIdentity) => event => {
    this.setState({
      pickerOpen: true,
      pickerAttribute,
      pickerIdentity,
    })
  }

  onCreatorOpen = (creatorAttribute, creatorIdentity) => event => {
    this.setState({
      creatorOpen: true,
      creatorAttribute,
      creatorIdentity,
    })
  }

  onDelete = attribute => event => {
    this._setValue(attribute, null)
  }

  renderM1Connection(attribute, index) {
    const { schema, constants, classes, t } = this.props
    const property = schema.properties[attribute]
    const connection = property.connection
    if (connection.type !== "m:1") {
      return false
    }

    const value = this.state.values[attribute]
    const relatedSchema = constants.schemas[connection.relatedModel.toLowerCase()]

    const current = (
      <ModelChip
        id={ value }
        name={ value ? value.name || "" : t("MODEL_FORM.NOT_SELECTED") }
        onDelete={ value && this.onDelete(attribute) }
      />
    )

    return (
      <div key={index}>
        <label className={classes.m1PropertyLabel}>{property.title || attribute}: </label>
        {current}
        <Button variant="text" onClick={this.onPickerOpen(attribute, connection.relatedModel)}>
          { `${t("PICK_EXISTING")} ${t(relatedSchema.i18Key, { context: "ACCUSATIVE" })}` }
        </Button>
        <Button variant="text" onClick={this.onCreatorOpen(attribute, connection.relatedModel)}>
          { `${t("CREATE_NEW")} ${t(relatedSchema.i18Key, { context: "ACCUSATIVE" })}` }
        </Button>
      </div>
    )
  }

  renderAttribute = (attribute, index) => {
    const { schema, autoFocus, margin } = this.props
    const property = schema.properties[attribute]
    if (!property) {
      return false
    }

    if (property.connection) {
      return this.renderM1Connection(attribute, index)
    }

    const error = this.state.valuesMeta[attribute] && this.state.valuesMeta[attribute].error

    return (
      <TextField
        key={index}
        type={this.getInputType(property)}
        fullWidth
        autoFocus={autoFocus && index === 0}
        name={attribute}
        label={property.title || attribute}
        margin={margin || "normal"}
        error={!!error}
        helperText={error || " "}
        value={this.state.values[attribute] || ""}
        onBlur={this.onBlur}
        onChange={this.onChange}
        onKeyPress={this.onKeyPress}
      />
    )
  }

  render() {
    const { attributes, schema } = this.props
    return (
      <Fragment>
        { (attributes || schema.defaultProperties).map(this.renderAttribute)}
        {this.state.pickerOpen && (
          <ModelPicker
            onClose={this.onPickerClose}
            onPick={this.onPick}
            open={this.state.pickerOpen}
            identity={this.state.pickerIdentity}
          />
        )}
        {this.state.creatorOpen && (
          <ModelCreator
            onClose={this.onCreatorClose}
            onCreate={this.onCreate}
            open={this.state.creatorOpen}
            identity={this.state.creatorIdentity}
          />
        )}
      </Fragment>
    )
  }
}
