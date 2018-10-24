/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"

import YaxysClue, { queries } from "../services/YaxysClue.js"
import { withConstants } from "../services/Utils.js"

import ModelTable from "./ModelTable.jsx"
import Button from "@material-ui/core/Button/Button"

const modelClue = props => ({
  identity: props.identity,
  query: queries.FIND,
  options: props.queryOptions,
  sort: { id: 1 },
})
const modelSelector = YaxysClue.selectors.byClue(modelClue)

export default
@withConstants
@connect(
  (state, props) => ({
    models: modelSelector(state, props),
  }),
  {
    loadModels: YaxysClue.actions.byClue,
  }
)
class ModelPicker extends Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    identity: PropTypes.string.isRequired,
    queryOptions: PropTypes.object,
    onClose: PropTypes.func,
    onPick: PropTypes.func,
    columns: PropTypes.arrayOf(PropTypes.string),
  }

  componentDidMount() {
    this.props.loadModels(modelClue(this.props))
  }

  render() {
    const { open, identity, onClose, onPick, columns, constants, models } = this.props
    return (<Dialog open = {open} onClose = {onClose}>
      <DialogTitle>{constants.schemas[identity].title}</DialogTitle>
      <ModelTable
        schema={constants.schemas[identity]}
        data={models && models.data || []}
        columns={columns}
        onCellClick={onPick}
      />
      <DialogActions>
        <Button onClick={onClose} color="primary">
          { "Cancel" }
        </Button>
      </DialogActions>
    </Dialog>)
  }
}
