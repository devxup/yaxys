import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import YaxysClue, { queries } from "../services/YaxysClue"

import { withStyles } from "@material-ui/core/styles"
import { withConstants } from "../services/Utils"

import { Button } from "@material-ui/core"

import Loader from "./Loader.jsx"
import ModelTable from "./ModelTable.jsx"
import ModelPicker from "./ModelPicker.jsx"
import Created from "./Created.jsx"
import Request from "./Request.jsx"

const CREATED_ACCESS_RIGHT_MARKER = "user-or-profile"
const createdAccessRightSelector = YaxysClue.selectors.byClue(
  props => ({ identity: "accessright", query: queries.CREATE }),
  { marker: CREATED_ACCESS_RIGHT_MARKER }
)

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
    createdAccessRights: createdAccessRightSelector(state, props),
    accessRights: accessRightsSelector(state, props),
  }),
  {
    loadAccessRights: YaxysClue.actions.byClue,
    createAccessRight: YaxysClue.actions.byClue,
    deleteAccessRight: YaxysClue.actions.byClue,
  }
)
export default class AccessRights extends Component {
  static propTypes = {
    // from HOCs
    constants: PropTypes.object,
    classes: PropTypes.object,
    createdAccessRights: PropTypes.func,
    accessRights: PropTypes.func,
    loadAccessRights: PropTypes.func,
    createAccessRight: PropTypes.func,
    deleteAccessRight: PropTypes.func,

    userProperty: PropTypes.string,
    userPropertyValue: PropTypes.string,
  }

  static accessRightToURL(accessRight) {
    if (accessRight.accessPoint) { return `/access-points/${accessRight.accessPoint}` }
    if (accessRight.door) { return `/doors/${accessRight.door}` }
    if (accessRight.zoneTo) { return `/zones/${accessRight.zoneTo}` }

    return ""
  }

  static accessRightToText(accessRight) {
    if (accessRight.accessPoint) { return `Granted access to Access Point #${accessRight.accessPoint}` }
    if (accessRight.door) { return `Granted access to Door #${accessRight.door}` }
    if (accessRight.zoneTo) { return `Granted access to Zone #${accessRight.zoneTo}` }

    return `#${accessRight.id}`
  }

  constructor(props) {
    super(props)
    this.state = {
      pickerProperty: null,
      pickerOpen: false,
      pickerProps: null,

      deletedAccessRightId: null,
      deletedHash: {},
      deleteAttemptAt: null,
    }
  }

  componentDidMount() {
    this.props.loadAccessRights(accessRightsClue(this.props))
  }

  onAdd = property => event => {
    const { constants } = this.props
    const pickerIdentity = constants.schemas.accessright.properties[
      property
    ].connection.relatedModel.toLowerCase()
    this.setState({
      pickerOpen: true,
      pickerIdentity,
      pickerProperty: property,
    })
  }

  onPickerClose = event => {
    this.setState({
      pickerOpen: false,
    })
  }

  onPick = item => {
    const { userProperty, userPropertyValue, createAccessRight } = this.props

    createAccessRight(
      {
        query: queries.CREATE,
        identity: "accessright",
        data: {
          [this.state.pickerProperty]: item.id,
          [userProperty]: userPropertyValue,
        },
      },
      { marker: CREATED_ACCESS_RIGHT_MARKER }
    )

    this.setState({
      pickerOpen: false,
    })
  }

  _deleteAccessRight(id) {
    this.props.deleteAccessRight({
      identity: "accessright",
      query: queries.DELETE,
      id,
    })

    this.setState({
      deletedSelector: YaxysClue.selectors.byClue(
        props => ({ identity: "accessright", query: queries.DELETE, id })
      ),
      deletedAccessRightId: id,
      deleteAttemptAt: new Date().getTime(),
    })
  }

  onDeleteAccessRight(accessRight) {
    if (this.state.deletedHash[accessRight.id]) {
      return
    }
    if (!confirm(`Are you sure to delete the Access Right #${accessRight.id}`)) {
      return
    }
    this._deleteAccessRight(accessRight.id)
  }

  onAccessRightDeleted = (item) => {
    this.state.deletedHash[item?.meta?.clue?.id] = true
    this.forceUpdate()
  }

  onTableCellClick = data => {
    this.onDeleteAccessRight(data.rowData)
  }

  render() {
    const { constants, accessRights, createdAccessRights, classes } = this.props
    const schema = constants.schemas.accessright

    return (
      <Fragment>
        <Created
          items={createdAccessRights}
          content={AccessRights.accessRightToText}
          url={AccessRights.accessRightToURL}
        />
        <Loader item={accessRights}>
          <Button
            variant="text"
            color="secondary"
            onClick={this.onAdd("accessPoint")}
            className={classes.button}
          >
            Add access point
          </Button>
          <Button
            variant="text"
            color="secondary"
            onClick={this.onAdd("door")}
            className={classes.button}
          >
            Add door
          </Button>
          <Button
            variant="text"
            color="secondary"
            onClick={this.onAdd("zoneTo")}
            className={classes.button}
          >
            Add zone
          </Button>
          <ModelTable
            schema={schema}
            data={accessRights?.data || []}
            columns={["accessPoint", "door", "zoneTo"]}
            onCellClick={this.onTableCellClick}
            deletedHash={ this.state.deletedHash }
            deletedKey="id"
          />
        </Loader>
        {this.state.pickerOpen && (
          <ModelPicker
            onClose={this.onPickerClose}
            onPick={this.onPick}
            open={this.state.pickerOpen}
            identity={this.state.pickerIdentity}
          />
        )}
        <Request
          selector={this.state.deletedSelector}
          message={"Deleting Access Right"}
          attemptAt={ this.state.deleteAttemptAt }
          onSuccess={ this.onAccessRightDeleted }
        />
      </Fragment>
    )
  }
}
