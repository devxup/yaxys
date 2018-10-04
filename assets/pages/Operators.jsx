import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import Wrapper from "../components/Wrapper.jsx";
import Loader from "../components/Loader.jsx";
import { connect } from "react-redux";

import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';

import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import YaxysClue, { queries } from "../services/YaxysClue";
const operatorsClue = props => ({ identity: "operator", query: queries.FIND });
const operatorsSelector = YaxysClue.selectors.byClue(operatorsClue);

@connect(
  (state, props) => ({
    operators: operatorsSelector(state, props)
  }),
  {
    loadOperators: YaxysClue.actions.byClue
  }
)
export default class Operators extends Component {
  state = {
    addOpen: false
  };

  componentDidMount() {
    this.props.loadOperators(operatorsClue(this.props));
  }

  onAdd = (event) => {
    this.setState({ addOpen: true })
  };

  onAddClose = (event) => {
    this.setState({ addOpen: false })
  };

  render() {
    return <Wrapper>
      <h1 style={{ marginTop: 0 }}>Operators</h1>
      <Loader item={ this.props.operators }>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>E-Mail</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                this.props.operators &&
                this.props.operators.data &&
                this.props.operators.data.map((operator, index) => <TableRow key={ index }>
                  <TableCell numeric><Link to={ `/operators/${operator.id}` }>{ operator.id }</Link></TableCell>
                  <TableCell><Link to={ `/operators/${operator.id}` }>{ operator.name || operator.email.replace(/^[^\@]*@/, "") }</Link></TableCell>
                  <TableCell><Link to={ `/operators/${operator.id}` }>{ operator.email }</Link></TableCell>
                </TableRow>)
              }
            </TableBody>
          </Table>
        </Paper>
      </Loader>
      <br />
      <Button variant="fab" color="secondary" onClick={ this.onAdd }>
        <AddIcon />
      </Button>
      <Dialog
        open={this.state.addOpen}
        onClose={this.onAddClose}
      >
        <DialogTitle>Add operator</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide email address and password for new operator.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
          />
          <TextField
            margin="dense"
            id="password"
            label="Password"
            type="password"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.onAddClose} color="primary">
            Cancel
          </Button>
          <Button onClick={this.onAddDon} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Wrapper>
  }
}
