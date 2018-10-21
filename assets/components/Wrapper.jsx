import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import { withStyles } from "@material-ui/core/styles"
import { Link } from "react-router-dom"
import { withRouter } from "react-router"

import LoginDialog from "./LoginDialog.jsx"

import classNames from "classnames"
import Drawer from "@material-ui/core/Drawer"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import List from "@material-ui/core/List"
import Typography from "@material-ui/core/Typography"
import Divider from "@material-ui/core/Divider"
import IconButton from "@material-ui/core/IconButton"
import MenuIcon from "@material-ui/icons/Menu"
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft"

import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import DashboardIcon from "@material-ui/icons/Dashboard"
import SdCardIcon from "@material-ui/icons/SdCard"
import PeopleIcon from "@material-ui/icons/People"
import PeopleOutlineIcon from "@material-ui/icons/PeopleOutline"
import MeetingRoomIcon from "@material-ui/icons/MeetingRoom"
import PictureInPictureIcon from "@material-ui/icons/PictureInPicture"
import SettingsIcon from "@material-ui/icons/Settings"
import Avatar from "@material-ui/core/Avatar"
import PersonIcon from "@material-ui/icons/Person"

import { meSelector } from "../services/Me"

const drawerWidth = 240
const lists = {
  primary: [
    {
      icon: DashboardIcon,
      title: "Dashboard",
      url: "/",
    },
    {
      icon: SdCardIcon,
      title: "Access points",
      url: "/access-points",
    },
    {
      icon: MeetingRoomIcon,
      title: "Doors",
      url: "/doors",
    },
    {
      icon: PictureInPictureIcon,
      title: "Zones",
      url: "/zones",
    },
    {
      icon: PeopleOutlineIcon,
      title: "Users",
      url: "/users",
    },
  ],
  secondary: [
    {
      icon: PeopleIcon,
      title: "Operators",
      url: "/operators",
    },
    {
      icon: SettingsIcon,
      title: "Settings",
      url: "/settings",
    },
  ],
}

const styles = theme => ({
  root: {
    display: "flex",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing.unit * 9,
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    height: "100vh",
    overflow: "auto",
  },
  chartContainer: {
    marginLeft: -22,
  },
  tableContainer: {
    height: 320,
  },
  avatar: {
    margin: 10,
  },
  authLogin: {
    cursor: "pointer",
  },
  authLoginSpan: {
    float: "right",
    lineHeight: "66px",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 600,
  },
  authMe: {
    color: "white",
    fontWeight: 400,
    fontSize: 16,
  },
  drawerItem: {
    color: "rgba(0, 0, 0, 0.54)",
  },
  drawerItemSelected: {
    backgroundColor: `${theme.palette.primary[500]} !important`,
    color: "white !important",
    fontWeight: 600,
  },
  drawerItemInheritColor: {
    color: "inherit !important",
    fontWeight: "inherit !important",
  },
})

export default
@withRouter
@withStyles(styles)
@connect((state, props) => ({
  me: meSelector(state),
}))
class Wrapper extends Component {
  static propTypes = {
    me: PropTypes.object,
    location: PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.state = {
      open: !localStorage.getItem("isDrawerClosed"),
      LoginDetailsOpen: false,
    }
  }

  handleDrawerOpen = () => {
    localStorage.removeItem("isDrawerClosed")
    this.setState({ open: true })
  }

  handleDrawerClose = () => {
    localStorage.setItem("isDrawerClosed", "true")
    this.setState({ open: false })
  }

  closeLoginDialog = () => {
    this.setState({ LoginDetailsOpen: false })
  }

  showLoginDialog = () => {
    this.setState({ LoginDetailsOpen: true })
  }

  renderAuth() {
    const { classes } = this.props
    if (this.props.me) {
      return (
        <Link to="/me" className={classes.authMe}>
          {this.props.me.email}
        </Link>
      )
    }
    return (
        <div className={classes.authLogin} onClick={this.showLoginDialog}>
          <span className={classes.authLoginSpan}>Log in</span>
          <Avatar className={classes.avatar}>
            <PersonIcon />
          </Avatar>
        </div>
    )
  }

  renderList(key) {
    const { classes, location } = this.props
    const url = location.pathname
    return (
      <List>
        {lists[key].map((item, index) => (
          <Link to={item.url} key={index}>
            <ListItem
              button
              selected={
                item.url === "/" ? url === item.url : url.indexOf(item.url.toLowerCase()) === 0
              }
              classes={{ root: classes.drawerItem, selected: classes.drawerItemSelected }}
            >
              <ListItemIcon classes={{ root: classes.drawerItemInheritColor }}>
                {React.createElement(item.icon)}
              </ListItemIcon>
              <ListItemText
                classes={{ primary: classes.drawerItemInheritColor }}
                primary={item.title}
              />
            </ListItem>
          </Link>
        ))}
      </List>
    )
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <AppBar
          position="absolute"
          className={classNames(classes.appBar, this.state.open && classes.appBarShift)}
        >
          <Toolbar disableGutters={!this.state.open} className={classes.toolbar}>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerOpen}
              className={classNames(
                classes.menuButton,
                this.state.open && classes.menuButtonHidden
              )}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="title"
              color="inherit"
              noWrap
              className={classes.title}
            >
              Yaxys dashboard
            </Typography>
            {this.renderAuth()}
            <LoginDialog open={this.state.LoginDetailsOpen} onClose={this.closeLoginDialog} />
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          classes={{
            paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
          }}
          open={this.state.open}
        >
          <div className={classes.toolbarIcon}>
            <IconButton onClick={this.handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          {this.renderList("primary")}
          <Divider />
          {this.renderList("secondary")}
        </Drawer>
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          {this.props.children}
        </main>
      </div>
    )
  }
}
