import React, { Component, Fragment } from "react"
import { withStyles } from "@material-ui/core/styles"
import { Link } from "react-router-dom"
import Typography from "@material-ui/core/Typography/Typography"
import PropTypes from "prop-types"

const styles = theme => ({
  title: {
    flexGrow: 1,
  },
  link : {
    color: "inherit",
    textDecoration: "underline",
  },
})

export default
@withStyles(styles)
class Breadcrumbs extends Component {
  static propTypes = {
    items: PropTypes.array,
  }

  render() {
    const { classes, items } = this.props
    return (
      <Typography
      component="h1"
      variant="title"
      color="inherit"
      noWrap
      className={classes.title}
      >
        <Link className={classes.link} to={ "/" } key={ 0 }>
          Yaxys
        </Link>
        {items  && items.map(
          (item, index) =>
          (item.url === undefined) ? ` / ${item}`  : <Fragment key={ index + 1 }> / <Link className={classes.link} to={ item.url } >
              { `${item.title}` }
          </Link></Fragment>
          )
        }
      </Typography>
    )
  }
}
