import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import { withStyles } from "@material-ui/core/styles"
import classNames from "classnames"
import { Button, TextField, CircularProgress } from "@material-ui/core"

import YaxysClue, { queries } from "../services/YaxysClue"

const marker = "login-form"

const authClue = props => ({
  identity: "auth",
  query: queries.CREATE,
})

const authSelector = YaxysClue.selectors.byClue(authClue, { marker })

const FORM_SCHEMA = {
  properties: {
    loginOrEmail: {
      title: "Login or e-mail",
    },
    password: {
      title: "Password",
      password: true,
    },
  },
}

@withStyles(theme => ({
  button: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  progress: {
    marginTop: 3,
    verticalAlign: "middle",
  },
  message: {
    display: "inline-block",
    marginTop: 3,
    marginBottom: 3,
    marginLeft: theme.spacing.unit,
    verticalAlign: "middle",
  },
  pending: {
    color: "#999",
  },
  error: {
    color: theme.palette.error.dark,
  },
}))
@connect(
  (state, props) => ({
    auth: authSelector(state, props),
  }),
  {
    authenticate: YaxysClue.actions.byClue,
  }
)

export default class LoginForm extends Component {
  static propTypes = {
    auth: PropTypes.object,
    authenticate: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      dirty: false,
      hasAttempt: false,
      form: {
        loginOrEmail: null,
        password: null,
      },
    }
  }

  onLogin = () => {
    this.setState({ hasAttempt: true })
    this.props.authenticate({ ...authClue(this.props), data: this.state.form }, { marker })
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
        type={property.password ? "password" : "text"}
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
    const { classes, auth } = this.props
    const propertyKeys = Object.keys(FORM_SCHEMA.properties)

    const authJSON = auth?.toJSON?.() || auth
    const lastAttempt = this.state.hasAttempt && authJSON?.[authJSON?.length - 1]

    return (
      <Fragment>
        {propertyKeys.map(this.renderProperty)}
        {lastAttempt?.pending ? (
          <Fragment>
            <CircularProgress className={classes.progress} size={30} />
            <span className={classNames(classes.message, classes.pending)}>
              Checking credentials&hellip;
            </span>
          </Fragment>
        ) : (
          <Fragment>
            <Button classes={{ root: classes.button }} variant="text" onClick={this.onLogin}>
              Log in
            </Button>
            {lastAttempt?.error && (
              <span className={classNames(classes.message, classes.error)}>
                {lastAttempt?.data?.message ||
                  lastAttempt?.data?.toString() ||
                  (lastAttempt?.meta?.responseMeta?.status === 403
                    ? "Wrong credentials"
                    : "An error occured")}
              </span>
            )}
          </Fragment>
        )}
      </Fragment>
    )
  }
}
