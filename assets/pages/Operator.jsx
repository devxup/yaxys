/* eslint-disable react/prop-types */
import React, { Component, Fragment } from "react"
import { connect } from "react-redux"

import YaxysClue, { queries } from "../services/YaxysClue"
import { pick, cloneDeep, pull } from "lodash"

import { withStyles } from "@material-ui/core/styles"
import { Paper, FormControlLabel, Switch, Button } from "@material-ui/core"

import { withConstants } from "../services/Utils"

import RightsEditor from "../components/RightsEditor.jsx"
import Wrapper from "../components/Wrapper.jsx"
import Loader from "../components/Loader.jsx"
import Update from "../components/Update.jsx"
import Request from "../components/Request.jsx"
import ModelForm from "../components/ModelForm.jsx"
import ModelPicker from "../components/ModelPicker.jsx"
import Created from "../components/Created.jsx"
import ModelTable from "../components/ModelTable.jsx"

const operatorClue = props => ({
  identity: "operator",
  query: queries.FIND_BY_ID,
  id: props.match.params.id,
  populate: "profiles",
})
const operatorSelector = YaxysClue.selectors.byClue(operatorClue)

const CREATED_BINDINGS_MARKER = "operator-page"
const createdBindingsSelector = YaxysClue.selectors.byClue(
  props => ({ identity: "operatorprofilebinding", query: queries.CREATE }),
  { marker: CREATED_BINDINGS_MARKER }
)

const styles = {
  rights: {
    padding: "1px 30px 20px",
    margin: "0 0 30px 0",
  },
  profiles: {
    padding: "1px 30px 20px",
    margin: "0 0 30px 0",
  },
}

const EDIBLE_PROPERTIES = ["id", "email", "isAdministrator", "rights"]

@withStyles(styles)
@withConstants
@connect(
  (state, props) => ({
    operator: operatorSelector(state, props),
    createdBindings: createdBindingsSelector(state, props),
  }),
  {
    loadOperator: YaxysClue.actions.byClue,
    createBinding: YaxysClue.actions.byClue,
    deleteBinding: YaxysClue.actions.byClue,
  }
)
export default class Operator extends Component {
  constructor(props) {
    super(props)
    this.state = {
      operator: this.props2OperatorState(props),
      forceValidation: false,
      schema: this.buildPseudoSchema(),
      profileOpen: false,
      deletedBindingId: null,
      deletedHash: {},
      deleteAttemptAt: null,
    }
  }

  componentDidMount() {
    this.props.loadOperator(operatorClue(this.props))
  }

  componentDidUpdate(prevProps) {
    const isReady = this.props.operator && this.props.operator.success
    const wasReady = prevProps.operator && prevProps.operator.success
    if (isReady && !wasReady) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({ operator: this.props2OperatorState(this.props) })
    }
  }

  buildPseudoSchema() {
    const schema = cloneDeep(this.props.constants.schemas.operator)
    pull(schema.required, "passwordHash")
    return schema
  }

  props2OperatorState(propsArg) {
    const props = propsArg || this.props
    const operator =
      props.operator && props.operator.success ? pick(props.operator.data, EDIBLE_PROPERTIES) : {}

    operator.passwordHash = ""
    operator.rights = cloneDeep(operator.rights)

    return operator
  }

  onFormChange = data => {
    this.setState({
      operator: { ...this.state.operator, ...data.values },
      modifiedAt: new Date().getTime(),
    })
  }

  onRightsChange = rights => {
    this.setState({
      operator: { ...this.state.operator, rights: Object.assign({}, rights) },
      modifiedAt: new Date().getTime(),
    })
  }

  handleSingleChange = name => event => {
    this.state.operator[name] = event.target.checked
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
    const { operator } = this.props
    this.props.createBinding(
      {
        identity: "operatorprofilebinding",
        query: queries.CREATE,
        data: {
          operator: operator.data.id,
          operatorProfile: profile.id,
        },
        populate: "operatorProfile",
      },
      { marker: CREATED_BINDINGS_MARKER }
    )
    this.setState({
      profileOpen: false,
    })
  }

  _deleteProfile(id) {
    this.props.deleteBinding({
      identity: "operatorprofilebinding",
      query: queries.DELETE,
      id,
    })

    this.setState({
      deletedSelector: YaxysClue.selectors.byClue(
        props => ({ identity: "operatorprofilebinding", query: queries.DELETE, id })
      ),
      deletedBindingId: id,
      deleteAttemptAt: new Date().getTime(),
    })
  }

  onDeleteProfile(profile) {
    if (this.state.deletedHash[profile._binding_id]) {
      return
    }
    if (!confirm(`Are you sure to detach profile #${profile.id} from the operator?`)) {
      return
    }
    this._deleteProfile(profile._binding_id)
  }

  onProfileDeleted = (item) => {
    this.state.deletedHash[item?.meta?.clue?.id] = true
    this.forceUpdate()
  }

  onProfileDeleteRepeat = () => {
    if (this.state.deletedBindingId) {
      this._deleteProfile(this.state.deletedBindingId)
    }
  }

  onTableCellClick = data => {
    this.onDeleteProfile(data.rowData)
  }

  render() {
    const { operator, match, classes, constants } = this.props
    const update = (
      <Update
        clue={operatorClue(this.props)}
        current={this.state.operator}
        schema={this.state.schema}
        modifiedAt={this.state.modifiedAt}
        watchProperties={EDIBLE_PROPERTIES}
      />
    )
    return (
      <Wrapper
        bottom={update}
        breadcrumbs={[{ title: "Operators", url: "/operators" }, `Operator #${match.params.id}`]}
      >
        <h1 style={{ marginTop: 0 }}>Operator #{match.params.id}</h1>
        <Loader item={operator}>
          <Fragment>
            <ModelForm
              autoFocus={true}
              values={this.state.operator}
              onChange={this.onFormChange}
              forceValidation={this.state.forceValidation}
              schema={this.state.schema}
              margin="dense"
              attributes={["email", "passwordHash"]}
            />
            <br />
            <FormControlLabel
              control={
                <Switch
                  checked={!!this.state.operator.isAdministrator}
                  onChange={this.handleSingleChange("isAdministrator")}
                  color="primary"
                  value="isAdministrator"
                />
              }
              label="isAdministrator"
            />

            {!this.state.operator.isAdministrator && (
              <Fragment>
                <Paper className={classes.profiles}>
                  <h5>The operator profiles</h5>
                  {!operator?.data?.profiles?.length && (
                    <p>Here you can manage profiles of the operator</p>
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
                      binding.operatorProfile.title
                        ? `Profile #${binding.operatorProfile.id} "${
                            binding.operatorProfile.title
                          }"`
                        : `Profile #${binding.operatorProfile}`
                    }
                    url={binding => `/settings/operator-profiles/${binding.operatorProfile.id}`}
                  />
                  {!!operator?.data?.profiles?.length && (
                    <ModelTable
                      schema={constants.schemas.operatorprofile}
                      data={operator?.data?.profiles}
                      // url={profile => `/settings/operator-profiles/${profile.id}`}
                      onCellClick={this.onTableCellClick}
                      columns={ ["id", "title"] }
                      deletedHash={ this.state.deletedHash }
                      deletedKey="_binding_id"
                    />
                  )}
                </Paper>
                <Paper className={classes.rights}>
                  <h5>Custom operator&#39;s rights:</h5>
                  <RightsEditor
                    type="operator"
                    values={(this.state.operator && this.state.operator.rights) || {}}
                    onChange={this.onRightsChange}
                  />
                </Paper>
              </Fragment>
            )}
            <ModelPicker
              open={this.state.profileOpen}
              identity="operatorprofile"
              onClose={this.onProfileClose}
              onPick={this.onProfilePick}
              columns={["id", "title", "description"]}
            />
            <Request
              selector={this.state.deletedSelector}
              message={"Detaching profile"}
              attemptAt={ this.state.deleteAttemptAt }
              onSuccess={ this.onProfileDeleted }
            />
          </Fragment>
        </Loader>
      </Wrapper>
    )
  }
}
