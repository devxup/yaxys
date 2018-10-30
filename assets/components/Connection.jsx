import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import YaxysClue, { queries } from "../services/YaxysClue"

import { withStyles } from "@material-ui/core/styles"
import { withConstants } from "../services/Utils"

import { Button } from "@material-ui/core"

import Loader from "./Loader.jsx"
import ModelTable from "./ModelTable.jsx"
import ModelPicker from "./ModelPicker.jsx"
import ModelCreator from "./ModelCreator.jsx"

const relatedClue = props => ({
  identity: props.relatedIdentity,
  query: queries.FIND,
  where: {
    [props.relatedProperty]: props.pasrentId,
  },
  ...props.additionalCluePropertiea,
})
const relatedSelector = YaxysClue.selectors.byClue(relatedClue)

@withStyles(theme => ({
  button: {
    margin: "0 10px 10px 0",
  },
}))
@withConstants
@connect(
  (state, props) => ({
    related: relatedSelector(state, props),
  }),
  {
    loadRelated: YaxysClue.actions.byClue,
  }
)
export default class Door extends Component {
  static propTypes = {
    // from HOCs
    constants: PropTypes.object,
    related: PropTypes.object,
    loadRelated: PropTypes.func,

    relatedIdentity: PropTypes.string,
    relatedProperty: PropTypes.string,
    parentId: PropTypes.oneOfType(PropTypes.number, PropTypes.string),
    additionalCluePropertiea: PropTypes.object,
    columns: PropTypes.array,
    url: PropTypes.func,
  }
  constructor(props) {
    super(props)
    this.state = {
      pickerOpen: false,
      creatorOpen: false,
    }
  }

  componentDidMount() {
    this.props.loadRelated(relatedClue(this.props))
  }

  onPickerOpen = event => {
    this.setState({
      pickerOpen: true,
    })
  }

  onPickerClose = event => {
    this.setState({
      pickerOpen: false,
    })
  }

  onPick = item => {
    this.setState({
      creatorOpen: false,
    })
  }

  onCreatorOpen = event => {
    this.setState({
      creatorOpen: true,
    })
  }

  onCreatorClose = event => {
    this.setState({
      creatorClose: false,
    })
  }

  onCreate = item => {
    this.setState({
      creatorOpen: false,
    })
  }

  render() {
    const { constants, relatedIdentity, related, columns, url, classes } = this.props
    const relatedSchema = constants.schemas[relatedIdentity?.toLowerCase()]

    return (
      <Loader item={related}>
        <Button
          variant="text"
          color="secondary"
          onClick={this.onPickerOpen}
          className={classes.button}
        >
          Add existing
        </Button>
        <Button
          variant="text"
          color="secondary"
          onClick={this.onCreatorOpen}
          className={classes.button}
        >
          Create new
        </Button>
        <ModelTable schema={relatedSchema} data={related?.data || []} url={url} columns={columns} />
        {this.state.pickerOpen && (
          <ModelPicker
            onClose={this.onPickerClose}
            onPick={this.onPick}
            open={this.state.pickerOpen}
            identity={relatedIdentity}
          />
        )}
        {this.state.creatorOpen && (
          <ModelCreator
            onClose={this.onCreatorClose}
            onCreate={this.onCreate}
            open={this.state.creatorOpen}
            identity={relatedIdentity}
          />
        )}
      </Loader>
    )
  }
}
