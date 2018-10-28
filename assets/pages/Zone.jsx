/* eslint-disable react/prop-types */
import React, { Component, Fragment } from "react"
import { connect } from "react-redux"

import YaxysClue, { queries } from "../services/YaxysClue"
import { pick } from "lodash"

import { withConstants } from "../services/Utils"

import Wrapper from "../components/Wrapper.jsx"
import Loader from "../components/Loader.jsx"
import Update from "../components/Update.jsx"
import ModelForm from "../components/ModelForm.jsx"

const zoneClue = props => ({
  identity: "zone",
  query: queries.FIND_BY_ID,
  id: props.match.params.id,
})
const zoneSelector = YaxysClue.selectors.byClue(zoneClue)

@withConstants
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
        ? pick(props.zone.data, "id", "title", "description")
        : {}

    return zone
  }

  onFormChange = data => {
    this.setState({
      zone: { ...this.state.zone, ...data.values },
      modifiedAt: new Date().getTime(),
    })
  }

  onRightsChange = rights => {
    this.setState({
      zone: { ...this.state.zone, rights: Object.assign({}, rights) },
      modifiedAt: new Date().getTime(),
    })
  }

  handleSingleChange = name => event => {
    this.state.zone[name] = event.target.checked
    this.state.modifiedAt = new Date().getTime()
    this.forceUpdate()
  }

  render() {
    const { constants, zone, match } = this.props
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
          { title: "Zones", url: "/zones" },
          `Zone #${match.params.id}`,
        ]}
      >
        <h1 style={{ marginTop: 0 }}>Zone #{match.params.id}</h1>
        <Loader item={zone}>
          <Fragment>
            <ModelForm
              autoFocus={true}
              values={this.state.zone}
              onChange={this.onFormChange}
              forceValidation={this.state.forceValidation}
              schema={constants.schemas.zone}
              margin="dense"
              attributes={["title", "description"]}
            />
            <br />
          </Fragment>
        </Loader>
      </Wrapper>
    )
  }
}
