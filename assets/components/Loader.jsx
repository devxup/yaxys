import React, { Component, Fragment } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import "./Loader.scss";

export default (props) => {
  if (!props.item || props.item.pending) {
    return <div className="loader loader_pending">
      <CircularProgress />
      { props.loadingText || "Loading..." }
    </div>
  }
  if (props.item.success) {
    return props.children;
  }
  return <Card className="loader loader_error">
    <CardContent>
      {
        (props.item.data && props.item.data.message)
        || props.errorText
        || "An error occured"
      }
      {
        props.onRetry
        && <button
          className="btn white black-text"
          onClick={ props.onRetry }
        >{ props.retryText || "Retry" }</button>
      }
    </CardContent>
  </Card>
};
