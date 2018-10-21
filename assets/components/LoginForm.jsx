import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import { withStyles } from "@material-ui/core/styles"
import Button from "@material-ui/core/Button"
import TextField from "@material-ui/core/TextField"

import YaxysClue, { queries } from "../services/YaxysClue"

const FORM_SCHEMA = {
  properties: {
    email: {
      title: "E-mail",
    },
    password: {
      title: "Password",
      password: true,
    },
  },
}

export default
@withStyles(theme => ({
  button: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}))
@connect(
  (state, props) => ({
  }),
  {
    authenticate: YaxysClue.actions.byClue,
  }
)
class LoginForm extends Component {
  static propTypes = {
    authenticate: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      dirty: false,
      form: {
        email: null,
        password: null,
      },
    }
  }

  onLogin = () => {
    this.props.authenticate({
      identity: "auth",
      query: queries.CREATE,
      data: this.state.form,
    })
  }

  onChange = event => {
    this.state.form[event.target.name] = event.target.value
    this.forceUpdate()
  }

  onKeyPress = event => {
    switch (event.charCode) {
      case 13:
        this.onLogin()
        break
    }
  }

  renderProperty = (propertyKey, index) => {
    const property = FORM_SCHEMA.properties[propertyKey]
    if (!property) {
      return false
    }

    const error = this.state.dirty && !this.state.form[propertyKey]

    return (
      <TextField
        key={index}
        type={property.password ? "password" : "email"}
        fullWidth
        autoFocus={index === 0}
        name={propertyKey}
        label={property.title}
        margin={"normal"}
        error={error}
        helperText={error ? "Should not be empty" : ""}
        value={this.state.form[propertyKey] || ""}
        onChange={this.onChange}
        onKeyPress={this.onKeyPress}
      />
    )
  }

  render() {
    const { classes } = this.props
    const propertyKeys = Object.keys(FORM_SCHEMA.properties)

    return (
      <Fragment>
        {propertyKeys.map(this.renderProperty)}
        <Button className={classes.button} variant="text" onClick={this.onLogin}>
          Log in
        </Button>
      </Fragment>
    )
  }
}
