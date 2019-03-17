import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import { withStyles } from "@material-ui/core/styles"
import classNames from "classnames"
import { Button, TextField, CircularProgress } from "@material-ui/core"

import YaxysClue, { queries } from "../services/YaxysClue"
import { withNamespaces } from "react-i18next"

const marker = "login-form"

const authClue = props => ({
  identity: "auth",
  query: queries.CREATE,
})

const authSelector = YaxysClue.selectors.byClue(authClue, { marker })

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
@withNamespaces()
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
    t: PropTypes.func,
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

  renderProperty(FORM_SCHEMA, propertyKey, index) {
    const { t } = this.props
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
        helperText={error ? t("LoginForm_NOT_EMPTY") : ""}
        value={this.state.form[propertyKey] || ""}
        onChange={this.onChange}
        onKeyPress={this.onKeyPress}
      />
    )
  }

  render() {
    const { classes, auth, t } = this.props
    const propertyKeys = Object.keys(FORM_SCHEMA.properties)

    const authJSON = auth?.toJSON?.() || auth
    const lastAttempt = this.state.hasAttempt && authJSON?.[authJSON?.length - 1]

    const FORM_SCHEMA = {
      properties: {
        loginOrEmail: {
          title: t("LOGIN_OR_EMAIL"),
        },
        password: {
          title: t("PASSWORD"),
          password: true,
        },
      },
    }

    return (
      <Fragment>
        {propertyKeys.map((property, index) => this.renderProperty(FORM_SCHEMA, property, index))}
        {lastAttempt?.pending ? (
          <Fragment>
            <CircularProgress className={classes.progress} size={30} />
            <span className={classNames(classes.message, classes.pending)}>
              {t("LoginForm_CHECKING")}
            </span>
          </Fragment>
        ) : (
          <Fragment>
            <Button classes={{ root: classes.button }} variant="text" onClick={this.onLogin}>
              {t("LOG_IN")}
            </Button>
            {lastAttempt?.error && (
              <span className={classNames(classes.message, classes.error)}>
                {lastAttempt?.data?.message ||
                  lastAttempt?.data?.toString() ||
                  (lastAttempt?.meta?.responseMeta?.status === 403
                    ? t("LoginForm_WRONG_CREDS")
                    : t("ERROR"))}
              </span>
            )}
          </Fragment>
        )}
      </Fragment>
    )
  }
}
