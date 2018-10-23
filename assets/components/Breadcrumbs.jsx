import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"

import classNames from "classnames"

import { withStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography/Typography"
import ChevronRightIcon from "@material-ui/icons/ChevronRight"

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  hasSeparators: {
    position: "relative",
    top: 1,
  },
  link: {
    color: "inherit",
    // textDecoration: "underline",
    // float:"left"
  },
  separator: {
    verticalAlign: "middle",
    display: "inline-block",
    fontSize: 14,
    position: "relative",
    top: 2,
    margin: "0 6px",
  },
})

@withStyles(styles)
export default class Breadcrumbs extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
    isRoot: PropTypes.bool,
  }

  render() {
    const { classes, items, isRoot } = this.props
    const hasSeparators = !isRoot && items && items.length
    return (
      <Typography
        component="h1"
        variant="title"
        color="inherit"
        noWrap
        className={classNames(classes.root, { [classes.hasSeparators]: hasSeparators })}
      >
        {!isRoot && (
          <Link className={classes.link} to={"/"} key={0}>
            Yaxys
          </Link>
        )}
        {items &&
          items.map((item, index) => (
            <Fragment key={index}>
              {!!(!isRoot || index) && (
                <span className={classes.separator}>
                  {" "}
                  <ChevronRightIcon fontSize="small" />{" "}
                </span>
              )}
              {item.url ? (
                <Link className={classes.link} to={item.url}>
                  {`${item.title}`}
                </Link>
              ) : (
                <span>{item}</span>
              )}
            </Fragment>
          ))}
      </Typography>
    )
  }
}
