/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import { withStyles } from "@material-ui/core/styles"

import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogTitle from "@material-ui/core/DialogTitle"

import YaxysClue, { queries } from "../services/YaxysClue.js"
import { withConstants } from "../services/Utils.js"

import ModelTable from "./ModelTable.jsx"
import Loader from "./Loader.jsx"
import Button from "@material-ui/core/Button/Button"
import { withNamespaces } from "react-i18next"

const modelClue = props => ({
  identity: props.identity.toLowerCase(),
  query: queries.FIND,
  sort: { id: 1 },
  ...props.queryOptions,
})
const modelSelector = YaxysClue.selectors.byClue(modelClue)

@withStyles(theme => ({
  dialogPaper: {
    minWidth: theme.breakpoints.values.sm - theme.spacing.unit * 6,
    [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
      minWidth: `calc(100% - ${theme.spacing.unit * 4}px)`,
      margin: `${theme.spacing.unit * 6}px ${theme.spacing.unit * 2}px`,
    },
  },
}))
@withConstants
@withNamespaces()
@connect(
  (state, props) => ({
    models: modelSelector(state, props),
  }),
  {
    loadModels: YaxysClue.actions.byClue,
  }
)
export default class ModelPicker extends Component {
  static propTypes = {
    title: PropTypes.string,
    open: PropTypes.bool.isRequired,
    identity: PropTypes.string.isRequired,
    queryOptions: PropTypes.object,
    onClose: PropTypes.func,
    onPick: PropTypes.func,
    columns: PropTypes.arrayOf(PropTypes.string),
  }

  componentDidMount() {
    if (this.props.open) {
      this.props.loadModels(modelClue(this.props), { force: true })
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.open && !prevProps.open) {
      this.props.loadModels(modelClue(this.props), { force: true })
    }
  }

  onCellClick = data => {
    this.props.onPick && this.props.onPick(data.rowData)
  }

  render() {
    const { classes, open, identity, onClose, columns, title, constants, models, t } = this.props
    const schema = constants.schemas[identity]
    return (
      <Dialog open={open} onClose={onClose} classes={{ paper: classes.dialogPaper }}>
        <DialogTitle>
          { title || `${t("PICK")} ${t(schema.i18Key, { context: "ACCUSATIVE" })}`}
        </DialogTitle>
        <Loader item={models}>
          <ModelTable
            schema={constants.schemas[identity]}
            data={ models?.data || [] }
            columns={columns}
            onCellClick={this.onCellClick}
          />
          <DialogActions>
            <Button onClick={onClose} color="primary">
              {t("CANCEL")}
            </Button>
          </DialogActions>
        </Loader>
      </Dialog>
    )
  }
}
