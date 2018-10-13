import ReduxClue, { Clue as rClue, queries as rQueries} from "redux-clue";

export default ReduxClue({
  storeKey: "YaxysClue",
  apiPrefix: "api",
  apiPluralize: false,
  models: [
    "operator", "auth"
  ]
});

export const queries = rQueries;
export const Clue = rClue;
