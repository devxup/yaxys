/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { connect } from "react-redux"

import Paper from "@material-ui/core/Paper"
import AddIcon from "@material-ui/icons/Add"
import Button from "@material-ui/core/Button"

import YaxysClue, { queries } from "../services/YaxysClue"
import { withConstants } from "../services/Utils"

import Wrapper from "../components/Wrapper.jsx"
import Created from "../components/Created.jsx"
import ModelTableLoader from "../components/ModelTableLoader.jsx"
import ModelDialog from "../components/ModelDialog.jsx"

const CREATED_PROFILES_MARKER = "profiles-page"
const createdProfilesSelector = YaxysClue.selectors.byClue(
  props => ({ identity: "operatorprofile", query: queries.CREATE }),
  { marker: CREATED_PROFILES_MARKER }
)

@withConstants
@connect(
  (state, props) => ({
    createdProfiles: createdProfilesSelector(state, props),
  }),
  {
    createProfile: YaxysClue.actions.byClue,
  }
)
export default class OperatorProfiles extends Component {
  state = {
    addOpen: false,
  }

  onAdd = event => {
    this.setState({ addOpen: true })
  }

  onAddClose = () => {
    this.setState({ addOpen: false })
  }

  onAddReady = values => {
    this.setState({ addOpen: false })

    this.props.createProfile(
      {
        identity: "operatorprofile",
        query: queries.CREATE,
        data: values,
      },
      { marker: CREATED_PROFILES_MARKER }
    )
  }

  render() {
    const { constants } = this.props
    return (
      <Wrapper breadcrumbs={[{ title: "Settings", url: "/settings" }, "Operator profiles"]}>
        <Button
          variant="fab"
          color="secondary"
          onClick={this.onAdd}
          style={{ float: "right" }}
          title="Create new profile"
        >
          <AddIcon />
        </Button>
        <h1 style={{ marginTop: 0 }}>Operator Profiles</h1>
        <Created
          items={this.props.createdProfiles}
          content={profile => profile.title}
          url={profile => `/settings/operator-profiles/${profile.id}`}
        />
        <Paper>
          <ModelTableLoader
            identity="operatorprofile"
            url={profile => `/settings/operator-profiles/${profile.id}`}
            columns={["id", "title"]}
          />
        </Paper>
        <br />
        <ModelDialog
          title="Create new operator profile"
          open={this.state.addOpen}
          onClose={this.onAddClose}
          onReady={this.onAddReady}
          schema={constants.schemas.operatorprofile}
          attributes={["title"]}
          btnReady="Create"
        >
          Please provide title the new operator profile.
        </ModelDialog>
      </Wrapper>
    )
  }
}
