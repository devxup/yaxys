/* eslint-disable react/prop-types */
import React from "react"
import PropTypes from "prop-types"
import { Select, MenuItem } from "@material-ui/core"
import { withConstants } from "../services/Utils"
import { takeEvery, put } from "redux-saga/effects"
import { connect } from "react-redux"
import * as cookie from "cookie"
//const cookie = require("cookie")

const extractLanguageFromCookie = () => {
	try {
		return cookie.parse(document.cookie).language
	} catch (err) {
		return null
	}
}

const defaultState = {
	language: extractLanguageFromCookie(),
	locale: {},
}

export const languageReducer = (state = defaultState, action) => {
	switch (action.type) {
		case "SET_LANGUAGE":
			return {
				...state,
				language: action.language,
				locale: action.locale,
			}
		case "FETCH_LOCALE":
		default:
			return state
	}
}

function* fetchLocale(action) {
	const response = yield fetch(`api/language/${action.language}`)
	const locale = yield response.json()
	document.cookie = `language=${action.language}`
	yield put({
		type: "SET_LANGUAGE",
		language: action.language,
		locale,
	})
}

export const languageSaga = function*() {
	yield takeEvery("FETCH_LOCALE", fetchLocale)
}

@withConstants
@connect(
	state => ({ current: state.language.language }),
	dispatch => ({
		setLanguage: language => {dispatch({ type: "FETCH_LOCALE", language })},
	})
)
export default class LanguageSelector extends React.Component {
	static propTypes = {
		current: PropTypes.string,
		setLanguage: PropTypes.func,
	}

	componentDidMount() {
		this.props.setLanguage(this.props.current || this.props.constants.language || "en_US")
	}

	handleChange = e => {
		this.props.setLanguage(e.target.value)
	}

	render() {
		const { constants, current } = this.props
		return (
			<Select value={current || constants.language || "en_US"} onChange={this.handleChange}>
				{constants.languages.map((language, index) => (
					<MenuItem key={index} value={language}>{language}</MenuItem>
				))}
			</Select>
		)
	}
}
