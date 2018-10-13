import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { omit, each } from "lodash";

import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import { meSelector, meRefresh } from "../services/Me";
import YaxysClue, { queries } from "../services/YaxysClue";


const loginClue = props => ({ identity: "auth", query: queries.CREATE });

const FORM_SCHEMA = {
  properties: {
    email: {
      title: "E-mail",
    },
    password: {
      title: "Password",
      password: true
    },
  }
};

@withStyles(theme => ({
  button: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  logoutButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.secondary.contrastText
  }
}))
@connect(
  (state, props) => ({
    me: meSelector(state)
  }),
  {
    authenticate: YaxysClue.actions.byClue,
    meRefresh
  }
)
export default class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dirty: false,
      form: {
        email: null,
        password: null
      }
    }
  }

  onLogin = () => {
    this.props.authenticate({
      identity: "auth",
      query: queries.CREATE,
      data: this.state.form
    });
  };

  onLogout = () => {
    const d = new Date();
    d.setTime(d.getTime() - (1000 * 60 * 60 * 24));
    const expires = "expires=" + d.toGMTString();
    window.document.cookie = `jwt=; ${expires};path=/`;

    this.props.meRefresh();
  };

  onChange = (event) => {
    this.state.form[event.target.name] = event.target.value;
    this.forceUpdate();
  };

  onKeyPress = (event) => {
    switch(event.charCode) {
      case 13:
        this.onLogin();
        break;
    }
  };

  renderProperty = (propertyKey, index) => {
    const property = FORM_SCHEMA.properties[propertyKey];
    if (!property) { return false; }

    const error = this.state.dirty && !this.state.form[propertyKey];

    return <TextField
      key={ index }
      type={ property.password ? "password" : "email" }
      fullWidth
      autoFocus={ index === 0 }
      name={ propertyKey }
      label={ property.title }
      margin={ "normal" }
      error={ error }
      helperText={ error ? "Should not be empty" : "" }
      value={ this.state.form[propertyKey] || "" }
      onChange={ this.onChange }
      onKeyPress={ this.onKeyPress }
    />;
  };

  render() {
    const { classes } = this.props;
    const propertyKeys = Object.keys(FORM_SCHEMA.properties);
    if (this.props.me) {
      return <Fragment>
        <p>
          You are logged in as <b>{ this.props.me.email }</b>
        </p>
        <Button onClick={ this.onLogout }variant="text" className={ classes.logoutButton } onClick={ this.onLogout }>Logout</Button>
      </Fragment>
    }
    return <Fragment>
      { propertyKeys.map(this.renderProperty) }
      <Button
        className={ classes.button }
        variant="text" onClick={ this.onLogin }>Log in</Button>
    </Fragment>;
  }
};

LoginForm.propTypes = {
};
