const jwt = require("jsonwebtoken");
const cookie = require("cookie");
import { omit } from "lodash";
import { takeEvery, call, put } from 'redux-saga/effects';

const extractStateFromCookie = () => {
  if (typeof window === "undefined") { return null; }
  try {
    const token = jwt.decode(cookie.parse(document.cookie).jwt);
    return {
      exp: token.exp,
      ...(omit(token, "exp", "iat"))
    }
  } catch(err) {
    return null;
  }
};

export const meReducer = (state = extractStateFromCookie(), action) => {
  switch (action && action.type) {
    case "clue:success:auth:create":
    case "me:refresh":
      return extractStateFromCookie();
  }
  return state;
};

export const meSelector = (state) => {
  if (!state.Me) { return false; }
  if (state.Me.exp * 1000 < new Date().getTime()) { return false; }
  return state.Me;
};

export const meRefresh = () => ({
  type: "me:refresh"
});

export const meSaga = function* saga() {
  yield takeEvery(["me:refresh", "clue:success:auth:create"], workerSaga);
};

let timer = null;
const delay = (ms) => new Promise(res => setTimeout(res, ms));

const workerSaga = function*(action) {
  const state = extractStateFromCookie();
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (state) {
console.log(4444);
    const pause = (state.exp + 1) * 1000 - new Date().getTime();
    yield call(delay, pause);
console.log(5555);
    yield put({ type: "me:refresh" });
console.log(777);
  }
};

