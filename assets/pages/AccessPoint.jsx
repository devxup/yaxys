/* eslint-disable react/prop-types */
import React, { Component, Fragment } from "react"
import { connect } from "react-redux"

import YaxysClue, { queries } from "../services/YaxysClue"
import { pick } from "lodash"

import { withStyles } from "@material-ui/core/styles"
import { withConstants, commonClasses } from "../services/Utils"

import { Paper } from "@material-ui/core"

import Wrapper from "../components/Wrapper.jsx"
import Loader from "../components/Loader.jsx"
import Update from "../components/Update.jsx"
import ModelForm from "../components/ModelForm.jsx"

const accessPointClue = props => ({
  identity: "accesspoint",
  query: queries.FIND_BY_ID,
  id: props.match.params.id,
  populate: "door,zoneTo",
})
const accessPointSelector = YaxysClue.selectors.byClue(accessPointClue)

const PROPS_2_WATCH = ["id", "title", "description", "door", "zoneTo"]

@withStyles(theme => ({
  ...commonClasses(theme),
}))
@withConstants
@connect(
  (state, props) => ({
    accessPoint: accessPointSelector(state, props),
  }),
  {
    loadAccessPoint: YaxysClue.actions.byClue,
  }
)
export default class AccessPoint extends Component {
  constructor(props) {
    super(props)
    this.state = {
      accessPoint: this.props2AccessPointState(props),
      forceValidation: false,
    }
  }

  componentDidMount() {
    this.props.loadAccessPoint(accessPointClue(this.props))
  }

  componentDidUpdate(prevProps) {
    const isReady = this.props.accessPoint && this.props.accessPoint.success
    const wasReady = prevProps.accessPoint && prevProps.accessPoint.success
    if (isReady && !wasReady) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({ accessPoint: this.props2AccessPointState(this.props) })
    }
  }

  props2AccessPointState(propsArg) {
    const props = propsArg || this.props
    const accessPoint =
      props.accessPoint && props.accessPoint.success
        ? pick(props.accessPoint.data, PROPS_2_WATCH)
        : {}

    return accessPoint
  }

  onFormChange = data => {
    this.setState({
      accessPoint: { ...this.state.accessPoint, ...data.values },
      modifiedAt: new Date().getTime(),
    })
  }

  onRightsChange = rights => {
    this.setState({
      accessPoint: { ...this.state.accessPoint, rights: Object.assign({}, rights) },
      modifiedAt: new Date().getTime(),
    })
  }

  handleSingleChange = name => event => {
    this.state.accessPoint[name] = event.target.checked
    this.state.modifiedAt = new Date().getTime()
    this.forceUpdate()
  }

  render() {
    const { constants, accessPoint, match, classes } = this.props
    const update = (
      <Update
        clue={accessPointClue(this.props)}
        current={this.state.accessPoint}
        schema={constants.schemas.accesspoint}
        modifiedAt={this.state.modifiedAt}
        watchProperties={PROPS_2_WATCH}
      />
    )
    return (
      <Wrapper
        bottom={update}
        breadcrumbs={[
          { title: "Access points", url: "/access-points" },
          `Access point #${match.params.id}`,
        ]}
      >
        <h1 style={{ marginTop: 0 }}>Access point #{match.params.id}</h1>
        <Loader item={accessPoint}>
          <Fragment>
            <Paper className={classes.block}>
              <h5>Properties</h5>
              <ModelForm
                autoFocus={true}
                values={this.state.accessPoint}
                onChange={this.onFormChange}
                forceValidation={this.state.forceValidation}
                schema={constants.schemas.accesspoint}
                margin="dense"
                attributes={["title", "description"]}
              />
            </Paper>
            <Paper className={classes.block}>
              <h5>Door and Zone</h5>
              <ModelForm
                autoFocus={true}
                values={this.state.accessPoint}
                onChange={this.onFormChange}
                forceValidation={this.state.forceValidation}
                schema={constants.schemas.accesspoint}
                margin="dense"
                attributes={["door", "zoneTo"]}
              />
            </Paper>
          </Fragment>
        </Loader>
      </Wrapper>
    )
  }
}
