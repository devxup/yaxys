/* eslint-disable react/prop-types */
import React, { Component, Fragment } from "react"
import { connect } from "react-redux"

import YaxysClue, { queries } from "../services/YaxysClue"
import { pick  } from "lodash"

import { withConstants } from "../services/Utils"

import Wrapper from "../components/Wrapper.jsx"
import Loader from "../components/Loader.jsx"
import Update from "../components/Update.jsx"
import ModelForm from "../components/ModelForm.jsx"

const doorClue = props => ({
  identity: "door",
  query: queries.FIND_BY_ID,
  id: props.match.params.id,
})
const doorSelector = YaxysClue.selectors.byClue(doorClue)

@withConstants
@connect(
  (state, props) => ({
    door: doorSelector(state, props),
  }),
  {
    loadDoor: YaxysClue.actions.byClue,
  }
)
export default class Door extends Component {
  constructor(props) {
    super(props)
    this.state = {
      door: this.props2DoorState(props),
      forceValidation: false,
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
    const door =
      props.door && props.door.success
        ? pick(props.door.data, "id", "title", "description")
        : {}

    return door
  }

  onFormChange = data => {
    this.setState({
      door: { ...this.state.door, ...data.values },
      modifiedAt: new Date().getTime(),
    })
  }

  onRightsChange = rights => {
    this.setState({
      door: { ...this.state.door, rights: Object.assign({}, rights) },
      modifiedAt: new Date().getTime(),
    })
  }

  handleSingleChange = name => event => {
    this.state.door[name] = event.target.checked
    this.state.modifiedAt = new Date().getTime()
    this.forceUpdate()
  }

  render() {
    const { constants, door, match } = this.props
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
        breadcrumbs={[
          { title: "Doors", url: "/doors" },
          `Door #${match.params.id}`,
        ]}
      >
        <h1 style={{ marginTop: 0 }}>Door #{match.params.id}</h1>
        <Loader item={door}>
          <Fragment>
            <ModelForm
              autoFocus={true}
              values={this.state.door}
              onChange={this.onFormChange}
              forceValidation={this.state.forceValidation}
              schema={constants.schemas.door}
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
