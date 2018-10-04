import React from "react";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import CssBaseline from '@material-ui/core/CssBaseline';

const theme = createMuiTheme({
  palette: {
    primary: blue
  }
});

// export default props => props.children ;
export default props => <MuiThemeProvider theme={ theme }>
  <CssBaseline />
  { props.children }
</MuiThemeProvider>;
