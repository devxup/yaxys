/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { connect } from "react-redux"

import YaxysClue, { queries } from "../services/YaxysClue"
import { pick } from "lodash"

import { withStyles } from "@material-ui/core/styles"
import { commonClasses, withConstants } from "../services/Utils"

import { Paper } from "@material-ui/core"

import Wrapper from "../components/Wrapper.jsx"
import Loader from "../components/Loader.jsx"
import Update from "../components/Update.jsx"
import ModelForm from "../components/ModelForm.jsx"
import Connection from "../components/Connection.jsx"
import { withNamespaces } from "react-i18next"

const doorClue = props => ({
  identity: "door",
  query: queries.FIND_BY_ID,
  id: props.match.params.id,
})
const doorSelector = YaxysClue.selectors.byClue(doorClue)

@withStyles(theme => commonClasses(theme))
@withConstants
@withNamespaces()
@connect(
  (state, props) => ({
    door: doorSelector(state, props),
  }),
  {
    loadDoor: YaxysClue.actions.byClue,
    updateAccessPoint: YaxysClue.actions.byClue,
  }
)
export default class Door extends Component {
  constructor(props) {
    super(props)
    this.state = {
      door: this.props2DoorState(props),
      forceValidation: false,
      pickerOpen: false,
      pickerIdentity: null,
      creatorOpen: false,
      creatorIdentity: null,
      accessPointUpdateSelector: null,
      accessPointUpdateAttemptAt: null,
    }
  }

  componentDidMount() {
    this.props.loadDoor(doorClue(this.props))
  }

  componentDidUpdate(prevProps) {
    const isReady = this.props.door && this.props.door.success
    const wasReady = prevProps.door && prevProps.door.success
    if (isReady && !wasReady) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({ door: this.props2DoorState(this.props) })
    }
  }

  props2DoorState(propsArg) {
    const props = propsArg || this.props
    return props.door && props.door.success ? pick(props.door.data, "id", "title", "description") : {}
  }

  onFormChange = data => {
    this.setState({
      door: { ...this.state.door, ...data.values },
      modifiedAt: new Date().getTime(),
    })
  }

  handleSingleChange = name => event => {
    this.state.door[name] = event.target.checked
    this.state.modifiedAt = new Date().getTime()
    this.forceUpdate()
  }

  canAddAccessPoint = accessPoints => {
    if (accessPoints?.data?.length >= 2) {
      alert(this.props.t("Door_TOO_MUCH_APS"))
      return false
    }
  }

  render() {
    const { constants, door, match, classes, t } = this.props
    const update = (
      <Update
        clue={doorClue(this.props)}
        current={this.state.door}
        schema={constants.schemas.door}
        modifiedAt={this.state.modifiedAt}
      />
    )
    return (
      <Wrapper
        bottom={update}
        breadcrumbs={[{ title: t("DOORS"), url: "/doors" }, t("DOOR_#", { door: match.params.id })]}
      >
        <h1 style={{ marginTop: 0 }}>{t("DOOR_#", { door: match.params.id })}</h1>
        <Loader item={door}>
          <Paper className={classes.block}>
            <h5>{t("PROPERTIES")}</h5>
            <ModelForm
              autoFocus={true}
              values={this.state.door}
              onChange={this.onFormChange}
              forceValidation={this.state.forceValidation}
              schema={constants.schemas.door}
              margin="dense"
              attributes={["title", "description"]}
            />
          </Paper>
        </Loader>
        <Paper className={classes.block}>
          <h5>{t("AP")}</h5>
          <Connection
            relatedIdentity="accesspoint"
            relatedProperty="door"
            parentId={match.params.id}
            additionalCluePropertiea={{ populate: "zoneTo" }}
            columns={["id", "title", "description", "zoneTo"]}
            canAddExisting={this.canAddAccessPoint}
            canCreateNew={this.canAddAccessPoint}
            url={accessPoint => `/access-points/${accessPoint.id}`}
          />
        </Paper>
      </Wrapper>
    )
  }
}
