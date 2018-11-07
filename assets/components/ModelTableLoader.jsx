/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { omit } from "lodash"

import TablePagination from "@material-ui/core/TablePagination"
import { withStyles } from "@material-ui/core/styles"

import YaxysClue, { queries } from "../services/YaxysClue.js"
import { withConstants } from "../services/Utils.js"

import ModelTable from "./ModelTable.jsx"
import Loader from "./Loader.jsx"

@withConstants
export default class ModelTableLoader extends Component {
  static propTypes = {
    identity: PropTypes.string.isRequired,
    limit: PropTypes.number,
    additionalClueProperties: PropTypes.object,
    columns: PropTypes.arrayOf(PropTypes.string),
    onCellClick: PropTypes.func,
    url: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    deletedHash: PropTypes.object,
    deletedKey: PropTypes.string,
  }

  state = {
    page: 0,
  }

  onChangePage = (event, page) => {
    this.setState({ page: page })
  }

  render() {
    return (
      <ModelTableLoaderPage
        page={this.state.page}
        onChangePage={this.onChangePage}
        limit={this.props.limit || this.props.constants.paginationLimit}
        {...omit(this.props, "limit")}
      />
    )
  }
}

const modelClue = props => ({
  identity: props.identity.toLowerCase(),
  query: queries.FIND,
  sort: { id: 1 },
  limit: props.limit,
  skip: props.page * props.limit,
  ...props.additionalClueProperties,
})
const modelSelector = YaxysClue.selectors.byClue(modelClue)

@withConstants
@connect(
  (state, props) => ({
    models: modelSelector(state, props),
  }),
  {
    loadModels: YaxysClue.actions.byClue,
  }
)
@withStyles(props => ({
  paginationSpacer: {
    display: "none",
  },
}))
class ModelTableLoaderPage extends Component {
  static propTypes = {
    identity: PropTypes.string.isRequired,
    limit: PropTypes.number,
    additionalClueProperties: PropTypes.object,
    columns: PropTypes.arrayOf(PropTypes.string),
    onCellClick: PropTypes.func,
    url: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    deletedHash: PropTypes.object,
    deletedKey: PropTypes.string,
    page: PropTypes.number,
    onChangePage: PropTypes.func,
  }

  componentDidMount() {
    this.props.loadModels(modelClue(this.props), { force: true })
  }

  componentDidUpdate(prevProps) {
    if (this.props.page !== prevProps.page) {
      this.props.loadModels(modelClue(this.props), { force: true })
    }
  }

  render() {
    const { classes, identity, models, page, limit, constants, onChangePage } = this.props
    const meta = models?.meta?.responseMeta?.meta && JSON.parse(models.meta.responseMeta.meta)
    return (
      <Loader item={models}>
        <ModelTable
          schema={constants.schemas[identity]}
          data={models?.data || []}
          {...omit(
            this.props,
            "identity",
            "limit",
            "additionalClueProperties",
            "page",
            "onChangePage",
            "loadModels"
          )}
        />
        {meta?.total > limit ? (
          <TablePagination
            classes={{
              spacer: classes.paginationSpacer,
            }}
            count={JSON.parse(models.meta.responseMeta.meta).total}
            rowsPerPage={limit}
            rowsPerPageOptions={[]}
            page={page}
            onChangePage={onChangePage}
            component="div"
          />
        ) : false}
      </Loader>
    )
  }
}
