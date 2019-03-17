import { omit } from "lodash"
import { takeEvery, call, put } from "redux-saga/effects"
import * as jwt from "jsonwebtoken"
import * as cookie from "cookie"

const extractStateFromCookie = () => {
  if (typeof window === "undefined") {
    return null
  }
  try {
    const token = jwt.decode(cookie.parse(document.cookie).jwt)
    return {
      exp: token.exp,
      ...omit(token, "exp", "iat"),
    }
  } catch (err) {
    return null
  }
}

export const meReducer = (state = extractStateFromCookie(), action) => {
  switch (action && action.type) {
    case "YaxysClue:success:auth:create":
    case "me:refresh":
      return extractStateFromCookie()
  }
  return state
}

export const meSelector = state => {
  if (!state.Me) {
    return false
  }
  if (state.Me.exp * 1000 < new Date().getTime()) {
    return false
  }
  return state.Me
}

export const meRefresh = () => ({
  type: "me:refresh",
})

export const meSaga = function* saga() {
  yield takeEvery(["me:refresh", "YaxysClue:success:auth:create"], workerSaga)
}

const delay = ms => new Promise(res => setTimeout(res, ms))

const workerSaga = function*() {
  const me = meSelector({ Me: extractStateFromCookie() })
  if (me) {
    const pause = (me.exp + 1) * 1000 - new Date().getTime()
    if (pause > 0) {
      yield call(delay, pause)
      yield put({ type: "me:refresh" })
    }
  }
}
