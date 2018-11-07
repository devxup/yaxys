import React from "react"
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles"
import { blue, green, red, yellow } from "@material-ui/core/colors"
import CssBaseline from "@material-ui/core/CssBaseline"

const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: {
      main: green["600"],
      light: green["A400"],
      dark: green["900"],
    },
    error: {
      main: red["400"],
      light: red["50"],
      dark: red["900"],
    },
    pending: {
      main: yellow[100],
    },
  },
})

export default function Theme(props) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {props.children}
    </MuiThemeProvider>
  )
}
