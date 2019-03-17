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
import AccessRights from "../components/AccessRights.jsx"

const zoneClue = props => ({
  identity: "zone",
  query: queries.FIND_BY_ID,
  id: props.match.params.id,
})
const zoneSelector = YaxysClue.selectors.byClue(zoneClue)

@withStyles(theme => commonClasses(theme))
@withConstants
@withNamespaces()
@connect(
  (state, props) => ({
    zone: zoneSelector(state, props),
  }),
  {
    loadZone: YaxysClue.actions.byClue,
  }
)
export default class Zone extends Component {
  constructor(props) {
    super(props)
    this.state = {
      zone: this.props2ZoneState(props),
      forceValidation: false,
    }
  }

  componentDidMount() {
    this.props.loadZone(zoneClue(this.props))
  }

  componentDidUpdate(prevProps) {
    const isReady = this.props.zone && this.props.zone.success
    const wasReady = prevProps.zone && prevProps.zone.success
    if (isReady && !wasReady) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({ zone: this.props2ZoneState(this.props) })
    }
  }

  props2ZoneState(propsArg) {
    const props = propsArg || this.props
    const zone =
      props.zone && props.zone.success
        ? pick(props.zone.data, "id", "name", "description")
        : {}

    return zone
  }

  onFormChange = data => {
    this.setState({
      zone: { ...this.state.zone, ...data.values },
      modifiedAt: new Date().getTime(),
    })
  }

  render() {
    const { constants, zone, match, classes, t } = this.props
    const entityInstance = t("ENTITY_INSTANCE", {
      entity: "$t(ZONE)",
      info: {
        id: match.params.id,
        item: zone,
      },
    })
    const update = (
      <Update
        clue={zoneClue(this.props)}
        current={this.state.zone}
        schema={constants.schemas.zone}
        modifiedAt={this.state.modifiedAt}
      />
    )
    return (
      <Wrapper
        bottom={update}
        breadcrumbs={[
          { title: t("ZONE_PLURAL"), url: "/zones" },
          entityInstance,
        ]}
      >
        <h1 style={{ marginTop: 0 }}>{entityInstance}</h1>
        <Loader item={zone}>
          <Paper className={classes.block}>
            <ModelForm
              autoFocus={true}
              values={this.state.zone}
              onChange={this.onFormChange}
              forceValidation={this.state.forceValidation}
              schema={constants.schemas.zone}
              margin="dense"
              attributes={["name", "description"]}
            />
            <br />
          </Paper>
        </Loader>
        <Paper className={classes.block}>
          <h5>{t("AP_PLURAL")}</h5>
          <Connection
            relatedIdentity="accesspoint"
            relatedProperty="zoneTo"
            parentId={match.params.id}
            additionalCluePropertiea={{ populate: "door" }}
            columns={["id", "name", "description", "door"]}
            canAddExisting={this.canAddAccessPoint}
            canCreateNew={this.canAddAccessPoint}
            url={accessPoint => `/access-points/${accessPoint.id}`}
          />
        </Paper>
        <Paper className={classes.block}>
          <h5>{t("ZONE_PAGE.USERS_AND_PROFILES_HEADER")}</h5>
          <AccessRights
            mode={"hardware"}
            hardwareProperty={"zoneTo"}
            hardwarePropertyValue={ match.params.id }
          />
        </Paper>
      </Wrapper>
    )
  }
}
