/* eslint-disable react/prop-types */
import React, { Component, Fragment } from "react"
import { connect } from "react-redux"

import YaxysClue, { queries } from "../services/YaxysClue"
import { pick } from "lodash"

import { withStyles } from "@material-ui/core/styles"
import { withConstants, commonClasses } from "../services/Utils"

import { Paper } from "@material-ui/core"

import Wrapper from "../components/Wrapper.jsx"
import Loader from "../components/Loader.jsx"
import Update from "../components/Update.jsx"
import ModelForm from "../components/ModelForm.jsx"
import { withNamespaces } from "react-i18next"

const credentialClue = props => ({
  identity: "credential",
  query: queries.FIND_BY_ID,
  id: props.match.params.id,
  populate: "user",
})
const credentialSelector = YaxysClue.selectors.byClue(credentialClue)

const PROPS_2_WATCH = ["id", "user", "code", "note"]

@withStyles(theme => ({
  ...commonClasses(theme),
}))
@withConstants
@withNamespaces()
@connect(
  (state, props) => ({
    credential: credentialSelector(state, props),
  }),
  {
    loadCredential: YaxysClue.actions.byClue,
  }
)
export default class Credential extends Component {
  constructor(props) {
    super(props)
    this.state = {
      credential: this.props2CredentialState(props),
    }
  }

  componentDidMount() {
    this.props.loadCredential(credentialClue(this.props))
  }

  componentDidUpdate(prevProps) {
    const isReady = this.props.credential && this.props.credential.success
    const wasReady = prevProps.credential && prevProps.credential.success
    if (isReady && !wasReady) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({ credential: this.props2CredentialState(this.props) })
    }
  }

  props2CredentialState(propsArg) {
    const props = propsArg || this.props
    const credential =
      props.credential && props.credential.success
        ? pick(props.credential.data, PROPS_2_WATCH)
        : {}

    return credential
  }

  onFormChange = data => {
    this.setState({
      invalid: !data.valid,
      credential: { ...this.state.credential, ...data.values },
      modifiedAt: new Date().getTime(),
    })
  }

  onRightsChange = rights => {
    this.setState({
      credential: { ...this.state.credential, rights: Object.assign({}, rights) },
      modifiedAt: new Date().getTime(),
    })
  }

  handleSingleChange = name => event => {
    this.state.credential[name] = event.target.checked
    this.state.modifiedAt = new Date().getTime()
    this.forceUpdate()
  }

  render() {
    const { constants, credential, match, classes, t } = this.props
    const entityInstance = t("ENTITY_INSTANCE", {
      entity: "$t(CREDENTIAL)",
      info: {
        id: match.params.id,
      },
    })
    const userInstance = t("ENTITY_INSTANCE", {
      entity: "$t(USER)",
      info: {
        id: match.params.user,
      },
    })
    const update = (
      <Update
        invalid={!!this.state.invalid}
        clue={credentialClue(this.props)}
        current={this.state.credential}
        schema={constants.schemas.credential}
        modifiedAt={this.state.modifiedAt}
        watchProperties={PROPS_2_WATCH}
      />
    )
    return (
      <Wrapper
        bottom={update}
        breadcrumbs={[
          { title: t("USER_PLURAL"), url: "/users" },
          { title: userInstance, url: `/users/${match.params.user}` },
          entityInstance,
        ]}
      >
        <h1 style={{ marginTop: 0 }}>{entityInstance}</h1>
        <Loader item={credential}>
          <Fragment>
            <Paper className={classes.block}>
              <ModelForm
                autoFocus={true}
                values={this.state.credential}
                onChange={this.onFormChange}
                forceValidation={true}
                schema={constants.schemas.credential}
                margin="dense"
                attributes={["code", "note", "user"]}
              />
            </Paper>
          </Fragment>
        </Loader>
      </Wrapper>
    )
  }
}
