/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { Link } from "react-router-dom"
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

const operatorsClue = props => ({ identity: "operator", query: queries.FIND, sort: { id: 1 } })
const operatorsSelector = YaxysClue.selectors.byClue(operatorsClue)

const CREATED_OPERATORS_MARKER = "operators-page"
const createdOperatorsSelector = YaxysClue.selectors.byClue(
  props => ({ identity: "operator", query: queries.CREATE }),
  { marker: CREATED_OPERATORS_MARKER }
)

@withConstants
@connect(
  (state, props) => ({
    operators: operatorsSelector(state, props),
    createdOperators: createdOperatorsSelector(state, props),
  }),
  {
    loadOperators: YaxysClue.actions.byClue,
    createOperator: YaxysClue.actions.byClue,
  }
)
export default class Operators extends Component {
  state = {
    addOpen: false,
  }

  componentDidMount() {
    this.props.loadOperators(operatorsClue(this.props))
  }

  onAdd = event => {
    this.setState({ addOpen: true })
  }

  onAddClose = () => {
    this.setState({ addOpen: false })
  }

  onAddReady = values => {
    this.setState({ addOpen: false })

    this.props.createOperator(
      {
        identity: "operator",
        query: queries.CREATE,
        data: values,
      },
      { marker: CREATED_OPERATORS_MARKER }
    )
  }

  render() {
    const { constants, operators } = this.props
    return (
      <Wrapper breadcrumbs={["Operators"]}>
        <Button
          variant="fab"
          color="secondary"
          onClick={this.onAdd}
          style={{ float: "right" }}
          title="Create operator"
        >
          <AddIcon />
        </Button>
        <h1 style={{ marginTop: 0 }}>Operators</h1>
        <p>
          Also, you can control operators&#39; rights by{" "}
          <Link to={"/settings/operator-profiles"}>managing their profiles</Link>
        </p>
        <Created
          items={this.props.createdOperators}
          content={operator => operator.email}
          url={operator => `/operators/${operator.id}`}
        />
        <Loader item={operators}>
          <Paper>
            <ModelTable
              schema={constants.schemas.operator}
              data={(operators && operators.data) || []}
              url={operator => `/operators/${operator.id}`}
              columns={["id", "email", "isAdministrator", "hasCustomRights"]}
            />
          </Paper>
        </Loader>
        <br />
        <ModelDialog
          title="Create new operator"
          open={this.state.addOpen}
          onClose={this.onAddClose}
          onReady={this.onAddReady}
          schema={constants.schemas.operator}
          attributes={["email", "passwordHash"]}
          btnReady="Create"
        >
          Please provide email address and password for the new operator.
        </ModelDialog>
      </Wrapper>
    )
  }
}
