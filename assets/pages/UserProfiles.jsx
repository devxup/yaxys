/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { connect } from "react-redux"

import { Paper, Button } from "@material-ui/core"

import YaxysClue, { queries } from "../services/YaxysClue"
import { withConstants } from "../services/Utils"

import Wrapper from "../components/Wrapper.jsx"
import Created from "../components/Created.jsx"
import ModelDialog from "../components/ModelDialog.jsx"
import ModelTableLoader from "../components/ModelTableLoader.jsx"

const CREATED_PROFILES_MARKER = "profiles-page"
const createdProfilesSelector = YaxysClue.selectors.byClue(
  props => ({ identity: "userprofile", query: queries.CREATE }),
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
export default class UserProfiles extends Component {
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
        identity: "userprofile",
        query: queries.CREATE,
        data: values,
      },
      { marker: CREATED_PROFILES_MARKER }
    )
  }

  render() {
    const { constants } = this.props
    return (
      <Wrapper breadcrumbs={["User profiles"]}>
        <h1 style={{ marginTop: 0 }}>User Profiles</h1>
        <Button
          variant="text"
          color="secondary"
          onClick={this.onAdd}
          title="Create new profile"
        >
          Add profile
        </Button>
        <Created
          items={this.props.createdProfiles}
          content={profile => profile.name}
          url={profile => `/user-profiles/${profile.id}`}
        />
        <Paper>
          <ModelTableLoader
            identity="userprofile"
            url={profile => `/user-profiles/${profile.id}`}
            columns={["id", "name"]}
          />
        </Paper>
        <br />
        <ModelDialog
          title="Create new user profile"
          open={this.state.addOpen}
          onClose={this.onAddClose}
          onReady={this.onAddReady}
          schema={constants.schemas.userprofile}
          attributes={["name"]}
          btnReady="Create"
        >
          Please provide name for the new user profile.
        </ModelDialog>
      </Wrapper>
    )
  }
}
