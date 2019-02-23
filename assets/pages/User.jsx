/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { connect } from "react-redux"

import YaxysClue, { queries } from "../services/YaxysClue"
import { pick } from "lodash"

import { withStyles } from "@material-ui/core/styles"
import { Paper, Button } from "@material-ui/core"

import { commonClasses, withConstants } from "../services/Utils"

import Wrapper from "../components/Wrapper.jsx"
import Loader from "../components/Loader.jsx"
import Update from "../components/Update.jsx"
import Request from "../components/Request.jsx"
import ModelForm from "../components/ModelForm.jsx"
import ModelPicker from "../components/ModelPicker.jsx"
import Created from "../components/Created.jsx"
import ModelTable from "../components/ModelTable.jsx"
import AccessRights from "../components/AccessRights.jsx"
import Connection from "../components/Connection.jsx"

const userClue = props => ({
  identity: "user",
  query: queries.FIND_BY_ID,
  id: props.match.params.id,
  populate: "profiles",
})
const userSelector = YaxysClue.selectors.byClue(userClue)

const CREATED_BINDINGS_MARKER = "user-page"
const createdBindingsSelector = YaxysClue.selectors.byClue(
  props => ({ identity: "userprofilebinding", query: queries.CREATE }),
  { marker: CREATED_BINDINGS_MARKER }
)

const EDIBLE_PROPERTIES = ["id", "name"]

@withStyles(theme => commonClasses(theme))
@withConstants
@connect(
  (state, props) => ({
    user: userSelector(state, props),
    createdBindings: createdBindingsSelector(state, props),
  }),
  {
    loadUser: YaxysClue.actions.byClue,
    createBinding: YaxysClue.actions.byClue,
    deleteBinding: YaxysClue.actions.byClue,
  }
)
export default class User extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: this.props2UserState(props),
      forceValidation: false,
      profileOpen: false,
      deletedHash: {},
      deleteAttemptAt: null,
      constructedAt: new Date().getTime(),
    }
  }

  componentDidMount() {
    this.props.loadUser(userClue(this.props))
  }

  componentDidUpdate(prevProps) {
    const isReady = this.props.user && this.props.user.success
    const wasReady = prevProps.user && prevProps.user.success
    if (isReady && !wasReady) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({ user: this.props2UserState(this.props) })
    }
  }

  props2UserState(propsArg) {
    const props = propsArg || this.props
    const user =
      props.user && props.user.success ? pick(props.user.data, EDIBLE_PROPERTIES) : {}


    return user
  }

  onFormChange = data => {
    this.setState({
      user: { ...this.state.user, ...data.values },
      modifiedAt: new Date().getTime(),
    })
  }

  handleSingleChange = name => event => {
    this.state.user[name] = event.target.checked
    this.state.modifiedAt = new Date().getTime()
    this.forceUpdate()
  }

  onProfileOpen = () => {
    this.setState({
      profileOpen: true,
    })
  }

  onProfileClose = () => {
    this.setState({
      profileOpen: false,
    })
  }

  onProfilePick = profile => {
    const { user } = this.props
    this.props.createBinding(
      {
        identity: "userprofilebinding",
        query: queries.CREATE,
        data: {
          user: user.data.id,
          userProfile: profile.id,
        },
        populate: "userProfile",
      },
      { marker: CREATED_BINDINGS_MARKER }
    )
    this.setState({
      profileOpen: false,
    })
  }

  _deleteProfile(id) {
    this.props.deleteBinding({
      identity: "userprofilebinding",
      query: queries.DELETE,
      id,
    })

    this.setState({
      deletedSelector: YaxysClue.selectors.byClue(
        props => ({ identity: "userprofilebinding", query: queries.DELETE, id })
      ),
      deleteAttemptAt: new Date().getTime(),
    })
  }

  onDeleteProfile = (profile) => {
    if (this.state.deletedHash[profile._binding_id]) {
      return
    }
    if (!confirm(`Are you sure to detach profile #${profile.id} from the user?`)) {
      return
    }
    this._deleteProfile(profile._binding_id)
  }

  onProfileDeleted = (item) => {
    this.state.deletedHash[item?.meta?.clue?.id] = true
    this.forceUpdate()
  }

  render() {
    const { user, match, classes, constants } = this.props
    const idAndName = `#${match.params.id}${ user?.success ? ` ${user.data.name}` : "" }`
    const schema = constants.schemas.user
    const update = (
      <Update
        clue={userClue(this.props)}
        current={this.state.user}
        schema={schema}
        modifiedAt={this.state.modifiedAt}
        watchProperties={EDIBLE_PROPERTIES}
      />
    )
    return (
      <Wrapper
        bottom={update}
        breadcrumbs={[{ title: "Users", url: "/users" }, `User ${idAndName}`]}
      >
        <h1 style={{ marginTop: 0 }}>User {idAndName}</h1>
        <Loader item={user}>
          <Paper className={classes.block}>
            <ModelForm
              autoFocus={true}
              values={this.state.user}
              onChange={this.onFormChange}
              forceValidation={this.state.forceValidation}
              schema={schema}
              margin="dense"
              attributes={["name"]}
            />
          </Paper>
        </Loader>
        <Paper className={classes.block}>
          <h5>The user profiles</h5>
          {!user?.data?.profiles?.length && (
            <p>Here you can manage profiles of the user</p>
          )}
          <Button
            variant="text"
            color="secondary"
            onClick={this.onProfileOpen}
            style={{ marginBottom: 10 }}
          >
            Add profile
          </Button>
          <Created
            items={this.props.createdBindings}
            content={binding =>
              binding.userProfile.name
                ? `Profile #${binding.userProfile.id} "${
                    binding.userProfile.name
                  }"`
                : `Profile #${binding.userProfile}`
            }
            url={binding => `/user-profiles/${binding.userProfile.id}`}
            laterThan={ this.state.constructedAt }
          />
          {!!user?.data?.profiles?.length && (
            <ModelTable
              schema={constants.schemas.userprofile}
              data={user?.data?.profiles}
              url={profile => `/user-profiles/${profile.id}`}
              onDelete={this.onDeleteProfile}
              columns={ ["id", "name"] }
              deletedHash={ this.state.deletedHash }
              deletedKey="_binding_id"
            />
          )}
        </Paper>
        <Paper className={classes.block}>
          <h5>Custom access rights of the user</h5>
          <AccessRights
            mode={"user"}
            userProperty={"user"}
            userPropertyValue={ match.params.id }
          />
        </Paper>
        <Paper className={classes.block}>
          <h5>Credentials</h5>
          <Connection
            relatedIdentity="credential"
            relatedProperty="user"
            parentId={match.params.id}
            columns={["id", "code", "note"]}
            url={credential => `/users/${match.params.id}/credentials/${credential.id}`}
          />
        </Paper>
        <ModelPicker
          open={this.state.profileOpen}
          identity="userprofile"
          onClose={this.onProfileClose}
          onPick={this.onProfilePick}
          columns={["id", "name", "description"]}
        />
        <Request
          selector={this.state.deletedSelector}
          message={"Detaching profile"}
          attemptAt={ this.state.deleteAttemptAt }
          onSuccess={ this.onProfileDeleted }
        />
      </Wrapper>
    )
  }
}
