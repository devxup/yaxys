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
import Created from "../components/Created.jsx"

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

    userProperty: PropTypes.string,
    userPropertyValue: PropTypes.string,
  }

  constructor(props) {
    super(props)
    this.state = {
      pickerProperty: null,
      pickerOpen: false,
      pickerProps: null,
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

  render() {
    const { constants, accessRights, createdAccessRights, classes } = this.props
    const schema = constants.schemas.accessright

    return (
      <Fragment>
        <Created
          items={createdAccessRights}
          content={accessRight => JSON.stringify(accessRight)}
          url={accessRight => `/access-points/${accessRight.id}`}
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
      </Fragment>
    )
  }
}
