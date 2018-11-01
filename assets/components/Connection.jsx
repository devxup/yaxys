import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import YaxysClue, { queries } from "../services/YaxysClue"

import { withStyles } from "@material-ui/core/styles"
import { withConstants } from "../services/Utils"

import { Button } from "@material-ui/core"

import Loader from "./Loader.jsx"
import ModelTable from "./ModelTable.jsx"
import ModelPicker from "./ModelPicker.jsx"
import ModelCreator from "./ModelCreator.jsx"

import Request from "../components/Request.jsx"

const relatedClue = props => ({
  identity: props.relatedIdentity,
  query: queries.FIND,
  where: {
    [props.relatedProperty]: props.parentId,
  },
  ...props.additionalCluePropertiea,
})
const relatedSelector = YaxysClue.selectors.byClue(relatedClue)

@withStyles(theme => ({
  button: {
    margin: "0 10px 10px 0",
  },
}))
@withConstants
@connect(
  (state, props) => ({
    related: relatedSelector(state, props),
  }),
  {
    loadRelated: YaxysClue.actions.byClue,
    updateRelated: YaxysClue.actions.byClue,
  }
)
export default class Door extends Component {
  static propTypes = {
    // from HOCs
    constants: PropTypes.object,
    related: PropTypes.object,
    loadRelated: PropTypes.func,
    updateRelated: PropTypes.func,

    relatedIdentity: PropTypes.string,
    relatedProperty: PropTypes.string,
    parentId: PropTypes.oneOfType(PropTypes.number, PropTypes.string),
    additionalCluePropertiea: PropTypes.object,
    columns: PropTypes.array,
    url: PropTypes.func,

    canAddExisting: PropTypes.func,
    canCreateNew: PropTypes.func,
    canRemove: PropTypes.func,
  }
  
  constructor(props) {
    super(props)
    this.state = {
      pickerOpen: false,
      creatorOpen: false,
    }
  }

  componentDidMount() {
    this.props.loadRelated(relatedClue(this.props))
  }

  onPickerOpen = event => {
    const { canAddExisting, related } = this.props
    if (canAddExisting?.(related) === false) { return }

    this.setState({
      pickerOpen: true,
    })
  }

  onPickerClose = event => {
    this.setState({
      pickerOpen: false,
    })
  }

  onPick = item => {
    this.updateRelated(item, this.props.parentId)
    this.setState({
      pickerOpen: false,
    })
  }

  onCreatorOpen = event => {
    const { canCreateNew, related } = this.props
    if (canCreateNew?.(related) === false) { return }

    this.setState({
      creatorOpen: true,
    })
  }

  onCreatorClose = event => {
    this.setState({
      creatorClose: false,
    })
  }

  onCreate = item => {
    this.updateRelated(item, this.props.parentId)
    this.setState({
      creatorOpen: false,
    })
  }

  updateRelated(model, value) {
    const { relatedIdentity, relatedProperty } = this.props

    const clue = {
      identity: relatedIdentity,
      query: queries.UPDATE,
      id: model.id,
      data: {
        [relatedProperty]: value,
      },
    }
    const action = this.props.updateRelated(clue)
    this.setState({
      relatedUpdateSelector: YaxysClue.selectors.byRequestId(action.payload.requestId, { resultOnly: true }),
      relatedUpdateAttemptAt: new Date().getTime(),
    })
  }

  onRelatedUpdateRepeat = (requestId) => {
    this.setState({
      relatedUpdateSelector: YaxysClue.selectors.byRequestId(requestId, { resultOnly: true }),
      relatedUpdateAttemptAt: new Date().getTime(),
    })
  }

  onRelatedUpdated = () => {
    this.props.loadRelated(relatedClue(this.props), { force: true })
  }

  onTableCellClick = data => {
    const { constants, relatedIdentity } = this.props
    const relatedSchema = constants.schemas[relatedIdentity?.toLowerCase()]

    if (!confirm(`Are you sure you want to detach this ${relatedSchema.title}?`)) { return }
    this.updateRelated(data.rowData, null)
  }

  render() {
    const { constants, relatedIdentity, related, columns, url, classes } = this.props
    const relatedSchema = constants.schemas[relatedIdentity?.toLowerCase()]

    return (
      <Loader item={related}>
        <Button
          variant="text"
          color="secondary"
          onClick={this.onPickerOpen}
          className={classes.button}
        >
          Add existing
        </Button>
        <Button
          variant="text"
          color="secondary"
          onClick={this.onCreatorOpen}
          className={classes.button}
        >
          Create new
        </Button>
        <ModelTable
          schema={relatedSchema}
          data={related?.data || []}
          url={url}
          columns={columns}
          onCellClick={this.onTableCellClick}
      />
        {this.state.pickerOpen && (
          <ModelPicker
            onClose={this.onPickerClose}
            onPick={this.onPick}
            open={this.state.pickerOpen}
            identity={relatedIdentity}
          />
        )}
        {this.state.creatorOpen && (
          <ModelCreator
            onClose={this.onCreatorClose}
            onCreate={this.onCreate}
            open={this.state.creatorOpen}
            identity={relatedIdentity}
          />
        )}
        <Request
          selector={this.state.relatedUpdateSelector}
          message={`Updating ${relatedSchema.title && relatedIdentity}`}
          attemptAt={ this.state.relatedUpdateAttemptAt }
          onSuccess={ this.onRelatedUpdated }
          onRepeat={ this.onRelatedUpdateRepeat }
        />
      </Loader>
    )
  }
}
