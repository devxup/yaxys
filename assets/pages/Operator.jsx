/* eslint-disable react/prop-types */
import React, { Component, Fragment } from "react"
import { connect } from "react-redux"

import YaxysClue, { queries } from "../services/YaxysClue"
import { pick, cloneDeep, pull } from "lodash"

import { withStyles } from "@material-ui/core/styles"
import { Paper, FormControlLabel, Switch, Button } from "@material-ui/core"

import { commonClasses, withConstants } from "../services/Utils"

import RightsEditor from "../components/RightsEditor.jsx"
import Wrapper from "../components/Wrapper.jsx"
import Loader from "../components/Loader.jsx"
import Update from "../components/Update.jsx"
import Request from "../components/Request.jsx"
import ModelForm from "../components/ModelForm.jsx"
import ModelPicker from "../components/ModelPicker.jsx"
import Created from "../components/Created.jsx"
import ModelTable from "../components/ModelTable.jsx"
import { withNamespaces } from "react-i18next"

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

const EDIBLE_PROPERTIES = ["id", "name", "login", "email", "isAdministrator", "rights"]

@withStyles(theme => ({
  ...commonClasses(theme),
  rights: {
    padding: "1px 30px 20px",
    margin: "0 0 30px 0",
  },
  profiles: {
    padding: "1px 30px 20px",
    margin: "0 0 30px 0",
  },
}))
@withConstants
@withNamespaces()
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
      constructedAt: new Date().getTime(),
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
    if (!confirm(this.props.t("Operator_DETACH", { profile : profile.id }))) {
      return
    }
    this._deleteProfile(profile._binding_id)
  }

  onProfileDeleted = (item) => {
    this.state.deletedHash[item?.meta?.clue?.id] = true
    this.forceUpdate()
  }

  onTrashClick = data => {
    this.onDeleteProfile(data)
  }

  render() {
    const { operator, match, classes, constants, t } = this.props
    const entityInstance = t("ENTITY_INSTANCE", {
      entity: "$t(OPERATOR)",
      info: {
        id: match.params.id,
        item: operator,
      },
    })
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
        breadcrumbs={[
          { title: t("OPERATOR_PLURAL"), url: "/operators" },
          entityInstance,
        ]}
      >
        <h1 style={{ marginTop: 0 }}>{entityInstance}</h1>
        <Loader item={operator}>
          <Fragment>
            <Paper className={classes.block}>
              <ModelForm
                autoFocus={true}
                values={this.state.operator}
                onChange={this.onFormChange}
                forceValidation={this.state.forceValidation}
                schema={this.state.schema}
                margin="dense"
                attributes={["name", "login", "email", "passwordHash"]}
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
                label={ constants.schemas.operator.properties.isAdministrator.title }
              />
            </Paper>

            {!this.state.operator.isAdministrator && (
              <Paper className={classes.profiles}>
                <h5>{t("OPERATOR_PAGE.PROFILES_HEADER")}</h5>
                {!operator?.data?.profiles?.length && (
                  <p>{t("OPERATOR_PAGE.PROFILES_DESC")}</p>
                )}
                <Button
                  variant="text"
                  color="secondary"
                  onClick={this.onProfileOpen}
                  style={{ marginBottom: 10 }}
                >
                  { `${t("ADD")} ${t("OPERATOR_PROFILE", { "context": "ACCUSATIVE" })}`}
                </Button>
                <Created
                  items={this.props.createdBindings}
                  content={
                    binding => t("ENTITY_INSTANCE", {
                      entity: "$t(OPERATOR_PROFILE)",
                      info: {
                        id: binding.userProfile.id,
                        data: binding.userProfile,
                      },
                    })
                  }
                  url={binding => `/settings/operator-profiles/${binding.operatorProfile.id}`}
                  laterThan={ this.state.constructedAt }
                />
                {!!operator?.data?.profiles?.length && (
                  <ModelTable
                    schema={constants.schemas.operatorprofile}
                    data={operator?.data?.profiles}
                    url={profile => `/settings/operator-profiles/${profile.id}`}
                    columns={ ["id", "name"] }
                    deletedHash={ this.state.deletedHash }
                    deletedKey="_binding_id"
                    onDelete={this.onTrashClick}
                  />
                )}
              </Paper>
            )}
            <Paper className={classes.rights}>
              <h5>{t("OPERATOR_PAGE.CUSTOM_RIGHTS_HEADER")}</h5>
              {
                this.state.operator.isAdministrator
                  ? (
                    <p>
                      {t("OPERATOR_PAGE.CUSTOM_RIGHTS_IS_ADMIN_DESC")}
                    </p>
                  ) : (
                    <RightsEditor
                      type="operator"
                      values={(this.state.operator && this.state.operator.rights) || {}}
                      onChange={this.onRightsChange}
                    />
                  )
              }
            </Paper>
            <ModelPicker
              open={this.state.profileOpen}
              identity="operatorprofile"
              onClose={this.onProfileClose}
              onPick={this.onProfilePick}
              columns={["id", "name", "description"]}
            />
            <Request
              selector={this.state.deletedSelector}
              message={`${t("DETACH_PROCESS")} ${t("DEFINITE_ARTICLE")} ${t("OPERATOR_PROFILE", { context: "GENITIVE" })}`}
              attemptAt={ this.state.deleteAttemptAt }
              onSuccess={ this.onProfileDeleted }
            />
          </Fragment>
        </Loader>
      </Wrapper>
    )
  }
}
