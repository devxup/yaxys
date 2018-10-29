/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import YaxysClue, { queries } from "../services/YaxysClue.js"
import { withConstants } from "../services/Utils.js"

import ModelDialog from "./ModelDialog.jsx"

const modelClue = props => ({
  identity: props.identity.toLowerCase(),
  query: queries.FIND,
  sort: { id: 1 },
  ...props.queryOptions,
})
const modelSelector = YaxysClue.selectors.byClue(modelClue)

@withConstants
@connect(
  (state, props) => ({
    models: modelSelector(state, props),
  }),
  {
    loadModels: YaxysClue.actions.byClue,
  }
)
export default class ModelPicker extends Component {
  static propTypes = {
    title: PropTypes.string,
    open: PropTypes.bool.isRequired,
    identity: PropTypes.string.isRequired,
    onClose: PropTypes.func,
    onCreate: PropTypes.func,
    attributes: PropTypes.arrayOf(PropTypes.string),
  }

  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
      marker: `ModelCreateDialog.${Math.random()}`,
    }
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {
    if (!this.props.open && !prevProps.open) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({ open: true })
    }
  }

  onBlankReady = data => {
    //this.props.onPick && this.props.onPick(data.rowData)
  }

  render() {
    const { title, constants, identity, attributes, onClose } = this.props
    const { open } = this.state
    const schema = constants.schemas[identity]?.toLowerCase?.()
    return (
      <ModelDialog
        title={ title || `Create new ${schema.title || identity}`}
        open={open}
        onClose={onClose}
        onReady={this.onBlankReady}
        schema={schema}
        attributes={attributes}
        btnReady="Create"
      >
        { this.props.children }
      </ModelDialog>
    )
  }
}
