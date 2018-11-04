/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { connect } from "react-redux"

import Paper from "@material-ui/core/Paper"
import AddIcon from "@material-ui/icons/Add"
import Button from "@material-ui/core/Button"

import YaxysClue, { queries } from "../services/YaxysClue"
import { withConstants } from "../services/Utils"

import Loader from "../components/Loader.jsx"
import Wrapper from "../components/Wrapper.jsx"
import Created from "../components/Created.jsx"
import ModelTable from "../components/ModelTable.jsx"
import ModelDialog from "../components/ModelDialog.jsx"

const profilesClue = props => ({
  identity: "userprofile",
  query: queries.FIND,
  sort: { id: 1 },
})
const profilesSelector = YaxysClue.selectors.byClue(profilesClue)

const CREATED_PROFILES_MARKER = "profiles-page"
const createdProfilesSelector = YaxysClue.selectors.byClue(
  props => ({ identity: "userprofile", query: queries.CREATE }),
  { marker: CREATED_PROFILES_MARKER }
)

@withConstants
@connect(
  (state, props) => ({
    profiles: profilesSelector(state, props),
    createdProfiles: createdProfilesSelector(state, props),
  }),
  {
    loadProfiles: YaxysClue.actions.byClue,
    createProfile: YaxysClue.actions.byClue,
  }
)
export default class UserProfiles extends Component {
  state = {
    addOpen: false,
  }

  componentDidMount() {
    this.props.loadProfiles(profilesClue(this.props))
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
    const { constants, profiles } = this.props
    return (
      <Wrapper breadcrumbs={[{ title: "Settings", url: "/settings" }, "User profiles"]}>
        <Button
          variant="fab"
          color="secondary"
          onClick={this.onAdd}
          style={{ float: "right" }}
          title="Create new profile"
        >
          <AddIcon />
        </Button>
        <h1 style={{ marginTop: 0 }}>User Profiles</h1>
        <Created
          items={this.props.createdProfiles}
          content={profile => profile.title}
          url={profile => `/settings/user-profiles/${profile.id}`}
        />
        <Loader item={profiles}>
          <Paper>
            <ModelTable
              schema={constants.schemas.userprofile}
              data={(profiles && profiles.data) || []}
              url={profile => `/settings/user-profiles/${profile.id}`}
              columns={["id", "title"]}
            />
          </Paper>
        </Loader>
        <br />
        <ModelDialog
          title="Create new user profile"
          open={this.state.addOpen}
          onClose={this.onAddClose}
          onReady={this.onAddReady}
          schema={constants.schemas.userprofile}
          attributes={["title"]}
          btnReady="Create"
        >
          Please provide title the new user profile.
        </ModelDialog>
      </Wrapper>
    )
  }
}
