/* eslint-disable react/prop-types */
import React, { Component, Fragment } from "react"
import { connect } from "react-redux"

import YaxysClue, { queries } from "../services/YaxysClue"
import { pick, cloneDeep } from "lodash"

import { Paper } from "@material-ui/core"
import { withStyles } from "@material-ui/core/styles"

import { withConstants } from "../services/Utils"

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

const styles = {
  rights: {
    padding: "1px 30px 20px",
    margin: "0 0 30px 0",
  },
}

@withStyles(styles)
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
        ? pick(props.operatorProfile.data, "id", "title", "description", "rights")
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
            { title: t("SETTINGS"), url: "/settings" },
            { title: t("OPERATOR_PROFILES"), url: "/settings/operator-profiles" },
            operatorProfile && operatorProfile.success
              ? `#${match.params.id} ${operatorProfile.data.title}`
              : t("OPERATOR_PROFILE_#", { number: match.params.id }),
          ]
        }
      >
        <h1 style={{ marginTop: 0 }}>{t("OPERATOR_PROFILE_#", { number: match.params.id })}</h1>
        <Loader item={operatorProfile}>
          <Fragment>
            <ModelForm
              autoFocus={true}
              values={this.state.operatorProfile}
              onChange={this.onFormChange}
              forceValidation={this.state.forceValidation}
              schema={constants.schemas.operatorprofile}
              margin="dense"
              attributes={["title", "description"]}
            />
            <br />
            <Paper className={classes.rights}>
              <h5>{t("OperatorProfile_RIGHTS")}</h5>
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
