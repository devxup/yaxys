/* eslint-disable react/prop-types */
import React, { Component, Fragment } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import { without } from "lodash"

import YaxysClue, { queries } from "../services/YaxysClue.js"
import { withConstants } from "../services/Utils.js"

import Request from "./Request.jsx"
import ModelDialog from "./ModelDialog.jsx"

@withConstants
@connect(
  (state, props) => {},
  {
    create: YaxysClue.actions.byClue,
  }
)
export default class ModelCreator extends Component {
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

  componentDidUpdate(prevProps) {
    if (!this.props.open && !prevProps.open) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({
        open: true,
        marker: `ModelCreateDialog.${Math.random()}`,
      })
    }
  }

  onBlankReady = data => {
    const { identity, create } = this.props

    const clue = { identity, query: queries.CREATE, data }
    const options = { marker: this.state.marker }
    create(clue, options)

    this.setState({
      open: false,
      createSelector: YaxysClue.selectors.byClue(props => clue, options),
      createAttemptAt: new Date().getTime(),
    })
  }

  onCreated = (item) => {
    this.props.onCreate?.(item.data)
  }

  render() {
    const { title, constants, identity, attributes, onClose } = this.props
    const { open } = this.state
    const schema = constants.schemas[identity?.toLowerCase?.()]
    return (
      <Fragment>
        <ModelDialog
          title={ title || `Create new ${schema.title || identity}`}
          open={open}
          onClose={onClose}
          onReady={this.onBlankReady}
          schema={schema}
          attributes={attributes || without(schema.defaultProperties, "id")}
          btnReady="Create"
        >
          { this.props.children }
        </ModelDialog>
        <Request
          selector={this.state.createSelector}
          message={`Creating new ${schema.title || identity}`}
          attemptAt={ this.state.createAttemptAt }
          onSuccess={ this.onCreated }
        />
      </Fragment>
    )
  }
}
