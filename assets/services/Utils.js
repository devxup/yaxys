import React, { createContext } from "react"

export const commonClasses = theme => ({
  block: {
    padding: `5px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 2}px`,
    marginBottom: theme.spacing.unit * 2,
  },
  h1: {
    marginTop: 0,
  },
  addButton: {
    background: theme.palette.secondary.main,
  },
})

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

const { Provider, Consumer } = createContext()
export const ConstantsProvider = Provider
export const withConstants = Component =>
  Object.assign(
    props =>
      React.createElement(Consumer, {}, constants =>
        React.createElement(Component, {
          ...props,
          constants,
        })
      ),
    { displayName: `${Component.displayName} withConstants` }
  )
