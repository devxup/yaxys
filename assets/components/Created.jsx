import React, { Component, Fragment } from "react"
import { Link } from "react-router-dom"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import classNames from "classnames"
import { withStyles } from "@material-ui/core/styles"
import Paper from "@material-ui/core/Paper"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import Button from "@material-ui/core/Button"
import DoneIcon from "@material-ui/icons/Done"
import ReportProblemIcon from "@material-ui/icons/ReportProblem"
import CircularProgress from "@material-ui/core/CircularProgress"

import { green, yellow } from "@material-ui/core/colors"
import { lighten } from "@material-ui/core/styles/colorManipulator"

import YaxysClue from "../services/YaxysClue"
import { withImmutablePropsFixed } from "../services/Utils.js"
import ErrorDialog from "./ErrorDialog.jsx"

const styles = theme => ({
  root: {
    marginBottom: 20,
  },
  item: {
    fontSize: 16,
    borderTop:"1px solid #aaa",
    padding: "16px 24px",
  },
  itemFirst: {
    borderTop: "none",
  },
  itemSuccess: {
    backgroundColor: green["A100"],
  },
  itemPending: {
    backgroundColor: yellow[100],
  },
  itemError: {
    backgroundColor: theme.palette.error.main,
    color: "white",
  },
  link: {
    color: "#333",
    display: "block",
    margin:"-16px -24px",
    padding: "16px 24px",
    width:"100%",
    boxSizing: "unset",
    "&:hover": {
      background: green["700"],
      color: "white",
    },
  },
  doneIcon: {
    verticalAlign: "middle",
    margin: "-7px 16px -5px 0",
    color:"inherit",
  },
  loader: {
    margin: "-4px 12px -4px -4px",
  },
  errorButton: {
    backgroundColor: "white",
    marginRight:20,
    "&:hover": {
      backgroundColor: lighten(theme.palette.error.light, 0.9),
    },
  },
  buttonRipple: {
    color: theme.palette.error.main,
  },
})

@connect(
  () => ({}),
  {
    repeat: YaxysClue.actions.byClue,
  }
)
@withStyles(styles)
class Created extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    content: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
    url: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    pendingText: PropTypes.string,
    errorText: PropTypes.string,
  }

  constructor(props) {
    super(props)
    this.state = {
      errorDetailsOpen: false,
    }
  }

  onOpenDetails = (event) => {
    const index = Number(event.currentTarget.getAttribute("data-index"))
    const item = this.props.items[index]
    this.setState({
      errorDetailsOpen: true,
      itemForDetails: item,
    })
  };

  onCloseDetails = () => {
    this.setState({ errorDetailsOpen: false })
  };

  onRepeat = (event) => {
    const index = Number(event.currentTarget.getAttribute("data-index"))
    const { repeat, items } = this.props
    const item = items[index]

    repeat(item.meta.clue, { ...item.meta.options, index })
  };

  renderItem = (item, index) => {
    const { classes } = this.props
    const liProps = {
      key: index,
      className: classNames(
        classes.item,
        {
          [classes.itemFirst]: index === 0,
          [classes.itemSuccess]: item.success,
          [classes.itemPending]: item.pending,
          [classes.itemError]: item.error,
        }
      ),
      component: "div",
    }

    if (item.success) {
      const url = typeof this.props.url === "function"
        ? this.props.url(item.data)
        : this.props.url
      const content = <Fragment>
        <ListItemIcon className={ classes.doneIcon }>
          <DoneIcon />
        </ListItemIcon>
        {
          typeof this.props.content === "function"
            ? this.props.content(item.data)
            : this.props.content
        }
      </Fragment>

      return (<ListItem { ...liProps }>
        {
          url
            ? <Link to={ url } className={ classes.link }>{ content }</Link>
            : content
        }
      </ListItem>)
    }

    if (item.error) {
      return (<ListItem { ...liProps } data-index={ index } onClick={ this.onOpenDetails }>
        <ListItemIcon className={ classes.doneIcon }>
          <ReportProblemIcon />
        </ListItemIcon>
        { this.props.errorText || "An error occured. Click for details or repeat the action." }
        <ListItemSecondaryAction>
          <Button
            variant="text"
            className={ classes.errorButton }
            TouchRippleProps={{
              classes: {
                root: classes.buttonRipple,
              },
            }}
            data-index={ index }
            onClick={ this.onRepeat }
          >
            Repeat
          </Button>
        </ListItemSecondaryAction>
      </ListItem>)
    }

    if (item.pending) {
      return (<ListItem { ...liProps }>
        <CircularProgress size={ 30 } className={ classes.loader } />
        { this.props.pendingText || "Creating..." }
      </ListItem>)
    }
  };

  render() {
    const { items, classes } = this.props
    if (!items || (!items.length && !items.size)) { return false }

    return (<Fragment>
      <Paper className={ classes.root }>
        <List disablePadding={ true }>
          { items.map(this.renderItem) }
        </List>
      </Paper>
      <ErrorDialog
        open={ this.state.errorDetailsOpen }
        item={ this.state.itemForDetails }
        onClose={ this.onCloseDetails }
      />
    </Fragment>)
  }
}

export default withImmutablePropsFixed("items")(Created)
