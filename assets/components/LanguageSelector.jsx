import React from "react"
import PropTypes from "prop-types"
import { Select, MenuItem, withStyles } from "@material-ui/core"
import { withConstants } from "../services/Utils"
import * as cookie from "cookie"
import { withNamespaces } from "react-i18next"

const extractLanguageFromCookie = () => {
	try {
		return cookie.parse(document.cookie).language
	} catch (err) {
		return null
	}
}

const StyledSelect = withStyles({
	root: {
		color: "#fff",
	},
})(Select)

@withConstants
@withNamespaces()
export default class LanguageSelector extends React.Component {
	static propTypes = {
		constants: PropTypes.object,
		i18n: PropTypes.object,
		t: PropTypes.func,
	}

	state = {
		currentLang: extractLanguageFromCookie() || this.props.constants.language || "en_US",
	}

	componentDidMount() {
		this.appendLocaleScript(this.state.currentLang)
		this.props.i18n.changeLanguage(this.state.currentLang)
	}

	appendLocaleScript = async lang => {
		const response = await fetch(`/api/localizedSchemas/${lang}`)
		window.yaxysConstants.schemas = await response.json()
	}

	handleChange = e => {
		document.cookie = `language=${e.target.value};path=/`
		this.appendLocaleScript(e.target.value)
		this.props.i18n.changeLanguage(e.target.value)
		this.setState({ currentLang: e.target.value })
	}

	render() {
		return (<React.Fragment>
			<h6>{this.props.t("LanguageSelector_LANG_SEL_TITLE")}</h6>
			<div style={{ margin: "0 40px 0 10px" }}>
				<StyledSelect value={this.state.currentLang} onChange={this.handleChange}>
					{this.props.constants.languages.map((language, index) => (
						<MenuItem key={index} value={language.code}>{language.name}</MenuItem>
					))}
				</StyledSelect>
			</div>
		</React.Fragment>)
	}
}
