import React, { Component } from "react"
import { connect } from "react-redux"
import moment from "moment-timezone"

import Wrapper from "../components/Wrapper.jsx"

import { withStyles } from "@material-ui/core"
import { withConstants, commonClasses } from "../services/Utils"
import PropTypes from "prop-types"

import Button from "@material-ui/core/Button/Button"

import { meRefresh, meSelector } from "../services/Me"
import { withNamespaces } from "react-i18next"

export default
@withStyles(theme => ({
	logoutButton: {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.secondary.contrastText,
	},
	...commonClasses(theme),
}))
@withConstants
@withNamespaces()
@connect(
	(state, props) => ({
		me: meSelector(state),
	}),
	{
		meRefresh,
	}
)
class Me extends Component {
	static propTypes = {
		me: PropTypes.object,
		meRefresh: PropTypes.func.isRequired,
		constants: PropTypes.object,
		t: PropTypes.func,
	}

	onLogout = () => {
		const d = new Date()
		d.setTime(d.getTime() - 1000 * 60 * 60 * 24)
		const expires = "expires=" + d.toGMTString()
		window.document.cookie = `jwt=; ${expires};path=/`

		this.props.meRefresh()
	}

	render() {
		const { classes, constants, t } = this.props
		return (
			<Wrapper breadcrumbs={[t("ME_PAGE.BREADCRUMB")]}>
				<h1 className={ classes.h1 }>{t("ME_PAGE.HEADER")}</h1>
				<p>{t("ME_PAGE.AUTH_UNTIL", { moment: moment.tz(this.props.me.exp * 1000, constants.timezone).format("MMMM DD HH:mm") })}</p>
				<p>
          {
            this.props.me?.email
              ? <p>{`${constants.schemas.operator.properties.email.title}: ${this.props.me?.email}`}</p>
              : <p>{`${constants.schemas.operator.properties.login.title}: ${this.props.me?.login}`}</p>
          }
        </p>
				<Button
					onClick={this.onLogout}
					variant="text"
					className={classes.logoutButton}
				>
					{t("ME_PAGE.LOGOUT")}
				</Button>
			</Wrapper>
		)
	}
}
