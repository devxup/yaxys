import React, { Component, Fragment } from "react";

// Some props coming from selector may be an Immutable Map, so we convert them into JSON using this HOC
export const withImmutablePropsFixed = (propName) => {
  return Component =>
    props =>
      <Component
        {...props}
        items={ props[propName] && props[propName].toJSON ? props[propName].toJSON(): props[propName] }
      />;
};
