/* eslint-disable react/prop-types */
import React, { Component, Fragment } from "react"
import { connect } from "react-redux"

import YaxysClue, { queries } from "../services/YaxysClue"
import { pick, cloneDeep, pull } from "lodash"

import { withConstants } from "../services/Utils"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import Switch from "@material-ui/core/Switch"

import Wrapper from "../components/Wrapper.jsx"
import Loader from "../components/Loader.jsx"
import Update from "../components/Update.jsx"
import ModelForm from "../components/ModelForm.jsx"

const operatorClue = props => ({
  identity: "operator",
  query: queries.FIND_BY_ID,
  id: props.match.params.id,
})
const operatorSelector = YaxysClue.selectors.byClue(operatorClue)

export default
@withConstants
@connect(
  (state, props) => ({
    operator: operatorSelector(state, props),
  }),
  {
    loadOperator: YaxysClue.actions.byClue,
  }
)
class Operator extends Component {
  constructor(props) {
    super(props)
    this.state = {
      operator: this.props2OperatorState(props),
      forceValidation: false,
      schema: this.buildPseudoSchema(),
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

    return operator
  }

  onFormChange = data => {
    this.setState({
      operator: data.values,
      modifiedAt: new Date().getTime(),
    })
  }

  handleSingleChange = name => event => {
    this.state.operator[name] = event.target.checked
    this.state.modifiedAt = new Date().getTime()
    this.forceUpdate()
  }

  render() {
    const { operator, match } = this.props
    return (
      <Wrapper>
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
            { JSON.stringify(this.state.operator) }
            <br />checked: { JSON.stringify(this.state.operator.isAdministrator)}
            <br />
            <FormControlLabel
              control={
                <Switch
                  checked={ String(this.state.operator.isAdministrator) === "true" }
                  onChange={this.handleSingleChange("isAdministrator")}
                  color="primary"
                  value="isAdministrator"
                />
              }
              label="isAdministrator"
            />
            <Update
              clue={operatorClue(this.props)}
              current={this.state.operator}
              schema={this.state.schema}
              modifiedAt={this.state.modifiedAt}
            />
          </Fragment>
        </Loader>
      </Wrapper>
    )
  }
}
