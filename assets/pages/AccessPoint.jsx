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
import AccessRights from "../components/AccessRights.jsx"
import { withNamespaces } from "react-i18next"

const accessPointClue = props => ({
  identity: "accesspoint",
  query: queries.FIND_BY_ID,
  id: props.match.params.id,
  populate: "door,zoneTo",
})
const accessPointSelector = YaxysClue.selectors.byClue(accessPointClue)

const PROPS_2_WATCH = ["id", "name", "description", "door", "zoneTo"]

@withStyles(theme => ({
  ...commonClasses(theme),
}))
@withConstants
@withNamespaces()
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

  render() {
    const { constants, accessPoint, match, classes, t } = this.props
    const { settings, schemas } = constants
    const entityInstance = t("ENTITY_INSTANCE", {
      entity: "$t(AP)",
      info: {
        id: match.params.id,
        item: accessPoint,
      },
    })
    const update = (
      <Update
        clue={accessPointClue(this.props)}
        current={this.state.accessPoint}
        schema={schemas.accesspoint}
        modifiedAt={this.state.modifiedAt}
        watchProperties={PROPS_2_WATCH}
      />
    )

    return (
      <Wrapper
        bottom={update}
        breadcrumbs={[
          { title: t("AP_PLURAL"), url: "/access-points" },
          entityInstance,
        ]}
      >
        <h1 style={{ marginTop: 0 }}>{ entityInstance }</h1>
        <Loader item={accessPoint}>
          <Fragment>
            <Paper className={classes.block}>
              <ModelForm
                autoFocus={true}
                values={this.state.accessPoint}
                onChange={this.onFormChange}
                forceValidation={this.state.forceValidation}
                schema={schemas.accesspoint}
                margin="dense"
                attributes={["name", "description"]}
              />
            </Paper>
            {
              (!settings.hideDoors || !settings.hideZones) && (
                <Paper className={classes.block}>
                  <h5>
                    {
                      t(
                        settings.hideDoors
                          ? "AP_PAGE.ZONE_HEADER"
                          : settings.hideZones
                            ? "AP_PAGE.DOOR_HEADER"
                            : "AP_PAGE.DOOR_AND_ZONE_HEADER"

                      )
                    }
                  </h5>
                  <ModelForm
                    autoFocus={true}
                    values={this.state.accessPoint}
                    onChange={this.onFormChange}
                    forceValidation={this.state.forceValidation}
                    schema={schemas.accesspoint}
                    margin="dense"
                    attributes={[
                      ...(settings.hideDoors ? [] : ["door"]),
                      ...(settings.hideZones ? [] : ["zoneTo"]),
                    ]}
                  />
                </Paper>
              )
            }
            <Paper className={classes.block}>
              <h5>{t("AP_PAGE.USERS_AND_PROFILES_HEADER")}</h5>
              <AccessRights
                mode={"hardware"}
                hardwareProperty={"accessPoint"}
                hardwarePropertyValue={ match.params.id }
              />
            </Paper>
          </Fragment>
        </Loader>
      </Wrapper>
    )
  }
}
