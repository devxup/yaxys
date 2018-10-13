import React from "react"

// Some props coming from selector may be an Immutable Map,
// so we convert them into JSON using this HOC
export const withImmutablePropsFixed = propName => {
  return Component =>
    Object.assign(
      props =>
        React.createElement(Component, {
          ...props,
          [propName]:
            props[propName] && props[propName].toJSON ? props[propName].toJSON() : props[propName],
        }),
      { displayName: `${Component.displayName} withImmutablePropsFixed` }
    )
}
