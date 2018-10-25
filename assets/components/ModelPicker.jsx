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
    queryOptions: PropTypes.object,
    onClose: PropTypes.func,
    onPick: PropTypes.func,
    columns: PropTypes.arrayOf(PropTypes.string),
  }

  componentDidMount() {
    if (this.props.open) {
      this.props.loadModels(modelClue(this.props), { force: true })
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.open && !prevProps.open) {
      this.props.loadModels(modelClue(this.props), { force: true })
    }
  }

  onCellClick = data => {
    this.props.onPick && this.props.onPick(data.rowData)
  }

  render() {
    const { open, identity, onClose, columns, title, constants, models } = this.props
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{title || `Select ${constants.schemas[identity].title}`}</DialogTitle>
        <ModelTable
          schema={constants.schemas[identity]}
          data={(models && models.data) || []}
          columns={columns}
          onCellClick={this.onCellClick}
        />
        <DialogActions>
          <Button onClick={onClose} color="primary">
            {"Cancel"}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
