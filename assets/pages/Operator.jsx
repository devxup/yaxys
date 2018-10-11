import React, { Component, Fragment } from "react";
import Wrapper from "../components/Wrapper.jsx";
import Loader from "../components/Loader.jsx";
import { connect } from "react-redux";

import YaxysClue, { queries } from "../services/YaxysClue";
const operatorClue = props => ({ identity: "operator", query: queries.FIND_BY_ID, id: props.match.params.id });
const operatorSelector = YaxysClue.selectors.byClue(operatorClue);

@connect(
  (state, props) => ({
    operator: operatorSelector(state, props)
  }),
  {
    loadOperator: YaxysClue.actions.byClue
  }
)
export default class Operators extends Component {
  componentDidMount() {
    this.props.loadOperator(operatorClue(this.props));
  }

  render() {
    return <Wrapper>
      <h1 style={{ marginTop: 0 }}>Operator #{ this.props.match.params.id }</h1>
      <Loader item={ this.props.operator }>
        {
          this.props.operator &&
          this.props.operator.data &&
          <Fragment>
            Name: { this.props.operator.name || this.props.operator.data.email.replace(/^[^\@]*@/, "") }
            <br />
            E-mail: { this.props.operator.data.email }
          </Fragment>
        }
      </Loader>
    </Wrapper>
  }
}
