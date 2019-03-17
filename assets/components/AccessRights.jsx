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
import { withNamespaces } from "react-i18next"

const CREATED_ACCESS_RIGHT_MARKER = "user-or-profile"
const createdAccessRightSelector = YaxysClue.selectors.byClue(
  props => ({ identity: "accessright", query: queries.CREATE }),
  { marker: CREATED_ACCESS_RIGHT_MARKER }
)

const accessRightsClue = props => ({
  identity: "accessright",
  query: queries.FIND,
  where:
    props.mode === "user"
      ? {
          [props.userProperty]: props.userPropertyValue,
        }
      : {
          [props.hardwareProperty]: props.hardwarePropertyValue,
        },
  populate: props.mode === "user" ? "accessPoint,door,zoneTo" : "user,userProfile",
})
const accessRightsSelector = YaxysClue.selectors.byClue(accessRightsClue)

@withStyles(theme => ({
  button: {
    margin: "0 10px 10px 0",
  },
}))
@withConstants
@withNamespaces()
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
    mode: PropTypes.oneOf("hardware", "user"),
    userProperty: PropTypes.string,
    userPropertyValue: PropTypes.string,
    hardwareProperty: PropTypes.string,
    hardwarePropertyValue: PropTypes.string,

    // from HOCs
    constants: PropTypes.object,
    classes: PropTypes.object,
    createdAccessRights: PropTypes.object,
    accessRights: PropTypes.object,
    loadAccessRights: PropTypes.func,
    createAccessRight: PropTypes.func,
    deleteAccessRight: PropTypes.func,
    t: PropTypes.func,
  }

  static accessRightToURL(accessRight) {
    const { accessPoint, door, zoneTo } = accessRight
    if (accessPoint) {
      return `/access-points/${accessPoint.id || accessPoint}`
    }
    if (door) {
      return `/doors/${door.id || door}`
    }
    if (zoneTo) {
      return `/zones/${zoneTo.id || zoneTo}`
    }

    return ""
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

      constructedAt: new Date().getTime(),
    }
  }

  componentDidMount() {
    this.props.loadAccessRights(accessRightsClue(this.props), { force: true })
  }

  accessRightToURL = accessRight => {
    const { mode } = this.props
    const { accessPoint, door, zoneTo, user, userProfile } = accessRight

    switch (mode) {
      case "hardware":
        if (user) {
          return `/users/${user.id || user}`
        }
        if (userProfile) {
          return `/user-profiles/${userProfile.id || userProfile}`
        }
        break
      case "user":
        if (accessPoint) {
          return `/access-points/${accessPoint.id || accessPoint}`
        }
        if (door) {
          return `/doors/${door.id || door}`
        }
        if (zoneTo) {
          return `/zones/${zoneTo.id || zoneTo}`
        }
        break
    }

    return ""
  }

  _titleIdAndName(accessRight, property) {
    const { constants } = this.props
    const propertySchema = constants.schemas.accessright.properties[property]
    const schema = constants.schemas[propertySchema.connection.relatedModel.toLowerCase()]
    return `${schema.title} #${accessRight[property].id} ${accessRight[property].name}`
  }

  accessRightToText = accessRight => {
    const { mode, t } = this.props

    const possibleProperties =
      mode === "hardware" ? ["user", "userProfile"] : ["accessPoint", "door", "zoneTo"]

    const property = possibleProperties.find(candidate => !!accessRight[candidate])

    return property
      ? t("ACCESS_RIGHTS_COMPONENT.GRANTED_RIGHT", {
          target: this._titleIdAndName(accessRight, property),
        })
      : `#${accessRight.id}`
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
    const {
      mode,
      userProperty,
      userPropertyValue,
      createAccessRight,
      hardwareProperty,
      hardwarePropertyValue,
    } = this.props

    createAccessRight(
      {
        query: queries.CREATE,
        identity: "accessright",
        data: {
          [this.state.pickerProperty]: item.id,
          ...(mode === "hardware"
            ? { [hardwareProperty]: hardwarePropertyValue }
            : { [userProperty]: userPropertyValue }),
        },
        populate: mode === "hardware" ? "user,userProfile" : "accessPoint,door,zoneTo",
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
      deletedSelector: YaxysClue.selectors.byClue(props => ({
        identity: "accessright",
        query: queries.DELETE,
        id,
      })),
      deletedAccessRightId: id,
      deleteAttemptAt: new Date().getTime(),
    })
  }

  onDeleteAccessRight = accessRight => {
    const { t } = this.props
    if (this.state.deletedHash[accessRight.id]) {
      return
    }
    if (
      !confirm(
        `${t("ARE_YOU_SURE_TO")} ${t("DELETE").toLowerCase()} ${t("DEFINITE_ARTICLE")} ${t("AR", {
          context: "ACCUSATIVE",
        })}?`
      )
    ) {
      return
    }
    this._deleteAccessRight(accessRight.id)
  }

  onAccessRightDeleted = item => {
    this.state.deletedHash[(item?.meta?.clue?.id)] = true
    this.forceUpdate()
  }

  render() {
    const { constants, mode, accessRights, createdAccessRights, classes, t } = this.props
    const schema = constants.schemas.accessright

    return (
      <Fragment>
        <Created
          items={createdAccessRights}
          content={this.accessRightToText}
          url={this.accessRightToURL}
          laterThan={this.state.constructedAt}
        />
        <Loader item={accessRights}>
          {mode === "hardware" ? (
            <Fragment>
              <Button
                variant="text"
                color="secondary"
                onClick={this.onAdd("user")}
                className={classes.button}
              >
                {`${t("ADD")} ${t("USER", { context: "ACCUSATIVE" })}`}
              </Button>
              <Button
                variant="text"
                color="secondary"
                onClick={this.onAdd("userProfile")}
                className={classes.button}
              >
                {`${t("ADD")} ${t("USER_PROFILE", { context: "ACCUSATIVE" })}`}
              </Button>
            </Fragment>
          ) : (
            <Fragment>
              <Button
                variant="text"
                color="secondary"
                onClick={this.onAdd("accessPoint")}
                className={classes.button}
              >
                {`${t("ADD")} ${t("AP", { context: "ACCUSATIVE" })}`}
              </Button>
              <Button
                variant="text"
                color="secondary"
                onClick={this.onAdd("door")}
                className={classes.button}
              >
                {`${t("ADD")} ${t("DOOR", { context: "ACCUSATIVE" })}`}
              </Button>
              <Button
                variant="text"
                color="secondary"
                onClick={this.onAdd("zoneTo")}
                className={classes.button}
              >
                {`${t("ADD")} ${t("ZONE", { context: "ACCUSATIVE" })}`}
              </Button>
            </Fragment>
          )}
          <ModelTable
            schema={schema}
            data={accessRights?.data || []}
            columns={
              mode === "hardware" ? ["user", "userProfile"] : ["accessPoint", "door", "zoneTo"]
            }
            url={this.accessRightToURL}
            onDelete={this.onDeleteAccessRight}
            deletedHash={this.state.deletedHash}
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
          message={`${t("DELETE_PROCESS")} ${t("DEFINITE_ARTICLE")} ${t("AR", {
            context: "GENITIVE",
          })}`}
          attemptAt={this.state.deleteAttemptAt}
          onSuccess={this.onAccessRightDeleted}
        />
      </Fragment>
    )
  }
}
