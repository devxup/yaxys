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

@withStyles({
  root: {
    margin: "0 20px 0 10px",
    // padding: "2px 0 0 10px",
    borderRadius: 4,
    backgroundColor: "#fff",
    height:32,
    "&>div>div>div": {
      paddingLeft: 10,
      paddingTop: 8,
    },
    "&>div:before": {
      border: "none !important",
    },
  },
})
@withConstants
@withNamespaces()
export default class LanguageSelector extends React.Component {
  static displayName = "LanguageSelector"
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
    const { classes } = this.props
		return (
      <div className={ classes.root }>
        <Select value={this.state.currentLang} onChange={this.handleChange}>
          {this.props.constants.languages.map((language, index) => (
            <MenuItem key={index} value={language.code}>{language.name}</MenuItem>
          ))}
        </Select>
      </div>
    )
	}
}
