import React, { Component } from "react"
import PropTypes from "prop-types"
import Button from "@material-ui/core/Button"
import { isNil, findIndex } from "lodash"

export default class Switcher extends Component {
  static propTypes = {
    classes: PropTypes.string,
    emptyAllow: PropTypes.bool,
    emptyLabel: PropTypes.string,
    emptyClasses: PropTypes.string,
    emptyProps: PropTypes.string,
    value: PropTypes.string,
    choices: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {
      valueObject: this.getValueObject(props),
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({ valueObject: this.getValueObject() })
    }
  }

  _getEmptyValueObject(propsArg) {
    const props = propsArg || this.props
    return {
      index: -1,
      value: null,
      label: props.emptyLabel,
      classes: props.emptyClasses,
      props: props.emptyProps,
    }
  }

  getValueObject(propsArg) {
    const props = propsArg || this.props
    const value = props.value
    if (isNil(value)) {
      if (props.emptyAllow) {
        return this._getEmptyValueObject(propsArg)
      }
      return props.choices[0]
    }
    const index = findIndex(props.choices, choice => choice.value === value) || 0

    return { ...props.choices[index], index }
  }

  onClick = event => {
    const { choices, emptyAllow, onChange } = this.props
    const index = this.state.valueObject && this.state.valueObject.index
    let nextIndex = index + 1

    let valueObject = null
    if (nextIndex > choices.length - 1) {
      if (emptyAllow) {
        valueObject = this._getEmptyValueObject()
      } else {
        nextIndex = 0
      }
    }
    if (!valueObject) {
      valueObject = { ...choices[nextIndex], index: nextIndex }
    }
    this.setState({
      valueObject,
    })
    if (valueObject && onChange) {
      onChange(valueObject.value)
    }
  }

  render() {
    return (
      <Button
        onClick={this.onClick}
        classes={Object.assign(
          {},
          this.props.classes,
          this.state.valueObject && this.state.valueObject.classes
        )}
        {...this.state.valueObject && this.state.valueObject.props}
      >
        {(this.state.valueObject && this.state.valueObject.label) || "Unknown value"}
      </Button>
    )
  }
}
