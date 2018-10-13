import React from "react"
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles"
import blue from "@material-ui/core/colors/blue"
import green from "@material-ui/core/colors/green"
import CssBaseline from "@material-ui/core/CssBaseline"

const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: {
      main: green["600"],
      light: green["A400"],
      dark: green["900"],
    },
  },
})

export default function Theme(props) {
  return (<MuiThemeProvider theme={theme}>
    <CssBaseline/>
    {props.children}
  </MuiThemeProvider>)
}
