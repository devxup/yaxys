import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import YaxysClue, { queries } from "../services/YaxysClue"

import { withStyles } from "@material-ui/core/styles"
import { withConstants } from "../services/Utils"

import { Button } from "@material-ui/core"

import Loader from "./Loader.jsx"
import ModelTable from "./ModelTable.jsx"

const accessRightsClue = props => ({
  identity: "accessright",
  query: queries.FIND,
  where: {
    [props.userProperty]: props.userPropertyValue,
  },
  populate: "accessPoint,door,zoneTo",
})
const accessRightsSelector = YaxysClue.selectors.byClue(accessRightsClue)

@withStyles(theme => ({
  button: {
    margin: "0 10px 10px 0",
  },
}))
@withConstants
@connect(
  (state, props) => ({
    accessRights: accessRightsSelector(state, props),
  }),
  {
    loadAccessRights: YaxysClue.actions.byClue,
  }
)
export default class AccessRights extends Component {
  static propTypes = {
    // from HOCs
    constants: PropTypes.object,
    classes: PropTypes.object,
    accessRights: PropTypes.func,
    loadAccessRights: PropTypes.func,

    userProperty: PropTypes.string,
    userPropertyValue: PropTypes.string,
  }

  constructor(props) {
    super(props)
    this.state = {
      pickerOpen: false,
      creatorOpen: false,
    }
  }

  componentDidMount() {
    this.props.loadAccessRights(accessRightsClue(this.props))
  }
  //
  // onPickerOpen = event => {
  //   const { canAddExisting, related } = this.props
  //   if (canAddExisting?.(related) === false) { return }
  //
  //   this.setState({
  //     pickerOpen: true,
  //   })
  // }
  //
  // onPickerClose = event => {
  //   this.setState({
  //     pickerOpen: false,
  //   })
  // }
  //
  // onPick = item => {
  //   this.updateRelated(item, this.props.parentId)
  //   this.setState({
  //     pickerOpen: false,
  //   })
  // }
  //
  // onCreatorOpen = event => {
  //   const { canCreateNew, related } = this.props
  //   if (canCreateNew?.(related) === false) { return }
  //
  //   this.setState({
  //     creatorOpen: true,
  //   })
  // }
  //
  // onCreatorClose = event => {
  //   this.setState({
  //     creatorOpen: false,
  //   })
  // }
  //
  // onCreate = item => {
  //   this.updateRelated(item, this.props.parentId)
  //   this.setState({
  //     creatorOpen: false,
  //   })
  // }
  //
  // updateRelated(model, value) {
  //   const { relatedIdentity, relatedProperty } = this.props
  //
  //   const clue = {
  //     identity: relatedIdentity,
  //     query: queries.UPDATE,
  //     id: model.id,
  //     data: {
  //       [relatedProperty]: value,
  //     },
  //   }
  //   const action = this.props.updateRelated(clue)
  //   this.setState({
  //     relatedUpdateSelector: YaxysClue.selectors.byRequestId(action.payload.requestId, { resultOnly: true }),
  //     relatedUpdateAttemptAt: new Date().getTime(),
  //   })
  // }
  //
  // onRelatedUpdateRepeat = (requestId) => {
  //   this.setState({
  //     relatedUpdateSelector: YaxysClue.selectors.byRequestId(requestId, { resultOnly: true }),
  //     relatedUpdateAttemptAt: new Date().getTime(),
  //   })
  // }
  //
  // onRelatedUpdated = () => {
  //   this.props.loadRelated(relatedClue(this.props), { force: true })
  // }
  //
  // onTableCellClick = data => {
  //   const { constants, relatedIdentity } = this.props
  //   const relatedSchema = constants.schemas[relatedIdentity?.toLowerCase()]
  //
  //   if (!confirm(`Are you sure you want to detach this ${relatedSchema.title}?`)) { return }
  //   this.updateRelated(data.rowData, null)
  // }

  render() {
    const { constants, accessRights, classes } = this.props
    const schema = constants.schemas.accessright

    return (
      <Loader item={accessRights}>
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
          schema={schema}
          data={accessRights?.data || []}
          columns={["accessPoint", "door", "zoneTo"]}
          onCellClick={this.onTableCellClick}
        />
      </Loader>
    )
  }
}
