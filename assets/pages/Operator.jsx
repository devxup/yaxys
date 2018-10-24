/* eslint-disable react/prop-types */
import React, { Component, Fragment } from "react"
import { connect } from "react-redux"

import YaxysClue, { queries } from "../services/YaxysClue"
import { pick, cloneDeep, pull } from "lodash"

import { Paper, FormControlLabel, Switch } from "@material-ui/core"
import { withStyles } from "@material-ui/core/styles"

import { withConstants } from "../services/Utils"

import RightsEditor from "../components/RightsEditor.jsx"
import Wrapper from "../components/Wrapper.jsx"
import Loader from "../components/Loader.jsx"
import Update from "../components/Update.jsx"
import ModelForm from "../components/ModelForm.jsx"
import ModelPicker from "../components/ModelPicker.jsx"

const operatorClue = props => ({
  identity: "operator",
  query: queries.FIND_BY_ID,
  id: props.match.params.id,
})
const operatorSelector = YaxysClue.selectors.byClue(operatorClue)

const styles = {
  rights: {
    padding: "1px 30px 20px",
    margin: "0 0 30px 0",
  },
}

@withStyles(styles)
@withConstants
@connect(
  (state, props) => ({
    operator: operatorSelector(state, props),
  }),
  {
    loadOperator: YaxysClue.actions.byClue,
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
      props.operator && props.operator.success
        ? pick(props.operator.data, "id", "email", "isAdministrator", "rights")
        : {}

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

  onProfilePick = (data) => {
    alert(JSON.stringify(data.rowData))
  }

  render() {
    const { operator, match, classes } = this.props
    const update = (
      <Update
        clue={operatorClue(this.props)}
        current={this.state.operator}
        schema={this.state.schema}
        modifiedAt={this.state.modifiedAt}
      />
    )
    return (
      <Wrapper
        bottom={update}
        breadcrumbs={
          [
            { title: "Operators", url: "/operators" },
            `Operator #${match.params.id}`,
          ]
        }
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
                <Paper className={classes.rights}>
                  <h5>The operator&#39;s rights:</h5>
                  <RightsEditor
                    type="operator"
                    values={(this.state.operator && this.state.operator.rights) || {}}
                    onChange={this.onRightsChange}
                  />
                </Paper>
                <button className="btn btn-flat blue lighten-1 white-text"
                        onClick={this.onProfileOpen}
                >Add profile</button>
              </Fragment>
            )}
            <ModelPicker
              open={this.state.profileOpen}
              identity="operatorprofile"
              onClose={this.onProfileClose}
              onPick={this.onProfilePick}
              columns={["id", "title", "description"]}
            />
          </Fragment>
        </Loader>
      </Wrapper>
    )
  }
}
