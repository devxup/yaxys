/* eslint-disable react/prop-types */
import React, { Component, Fragment } from "react"
import { connect } from "react-redux"

import YaxysClue, { queries } from "../services/YaxysClue"
import { pick, cloneDeep } from "lodash"

import { Paper } from "@material-ui/core"
import { withStyles } from "@material-ui/core/styles"

import { commonClasses, withConstants } from "../services/Utils"

import RightsEditor from "../components/RightsEditor.jsx"
import Wrapper from "../components/Wrapper.jsx"
import Loader from "../components/Loader.jsx"
import Update from "../components/Update.jsx"
import ModelForm from "../components/ModelForm.jsx"
import { withNamespaces } from "react-i18next"

const operatorProfileClue = props => ({
  identity: "operatorprofile",
  query: queries.FIND_BY_ID,
  id: props.match.params.id,
})
const operatorProfileSelector = YaxysClue.selectors.byClue(operatorProfileClue)

@withStyles(theme => ({
  ...commonClasses(theme),
  rights: {
    padding: "1px 30px 20px",
    margin: "0 0 30px 0",
  },
}))
@withConstants
@withNamespaces()
@connect(
  (state, props) => ({
    operatorProfile: operatorProfileSelector(state, props),
  }),
  {
    loadOperatorProfile: YaxysClue.actions.byClue,
  }
)
export default class OperatorProfile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      operatorProfile: this.props2OperatorProfileState(props),
      forceValidation: false,
    }
  }

  componentDidMount() {
    this.props.loadOperatorProfile(operatorProfileClue(this.props))
  }

  componentDidUpdate(prevProps) {
    const isReady = this.props.operatorProfile && this.props.operatorProfile.success
    const wasReady = prevProps.operatorProfile && prevProps.operatorProfile.success
    if (isReady && !wasReady) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({ operatorProfile: this.props2OperatorProfileState(this.props) })
    }
  }

  props2OperatorProfileState(propsArg) {
    const props = propsArg || this.props
    const operatorProfile =
      props.operatorProfile && props.operatorProfile.success
        ? pick(props.operatorProfile.data, "id", "name", "description", "rights")
        : {}

    operatorProfile.rights = cloneDeep(operatorProfile.rights)

    return operatorProfile
  }

  onFormChange = data => {
    this.setState({
      operatorProfile: { ...this.state.operatorProfile, ...data.values },
      modifiedAt: new Date().getTime(),
    })
  }

  onRightsChange = rights => {
    this.setState({
      operatorProfile: { ...this.state.operatorProfile, rights: Object.assign({}, rights) },
      modifiedAt: new Date().getTime(),
    })
  }

  handleSingleChange = name => event => {
    this.state.operatorProfile[name] = event.target.checked
    this.state.modifiedAt = new Date().getTime()
    this.forceUpdate()
  }

  render() {
    const { operatorProfile, match, classes, constants, t } = this.props
    const entityInstance = t("ENTITY_INSTANCE", {
      entity: "$t(OPERATOR_PROFILE)",
      info: {
        id: match.params.id,
        item: operatorProfile,
      },
    })
    const update = (
      <Update
        clue={operatorProfileClue(this.props)}
        current={this.state.operatorProfile}
        schema={constants.schemas.operatorprofile}
        modifiedAt={this.state.modifiedAt}
      />
    )
    return (
      <Wrapper
        bottom={update}
        breadcrumbs={
          [
            { title: t("SETTINGS_PAGE.BREADCRUMB"), url: "/settings" },
            { title: t("OPERATOR_PROFILE_PLURAL"), url: "/settings/operator-profiles" },
            entityInstance,
          ]
        }
      >
        <h1 style={{ marginTop: 0 }}>{entityInstance}</h1>
        <Loader item={operatorProfile}>
          <Fragment>
            <Paper className={classes.block}>
              <ModelForm
                autoFocus={true}
                values={this.state.operatorProfile}
                onChange={this.onFormChange}
                forceValidation={this.state.forceValidation}
                schema={constants.schemas.operatorprofile}
                margin="dense"
                attributes={["name", "description"]}
              />
            </Paper>:
            <Paper className={classes.rights}>
              <h5>{t("OPERATOR_PROFILE_PAGE.RIGHTS_HEADER")}</h5>
              <RightsEditor
                type="profile"
                values={(this.state.operatorProfile && this.state.operatorProfile.rights) || {}}
                onChange={this.onRightsChange}
              />
            </Paper>
          </Fragment>
        </Loader>
      </Wrapper>
    )
  }
}
