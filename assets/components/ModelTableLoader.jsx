/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import TablePagination from "@material-ui/core/TablePagination"

import YaxysClue, { queries } from "../services/YaxysClue.js"
import { withConstants } from "../services/Utils.js"

import ModelTable from "./ModelTable.jsx"
import Loader from "./Loader.jsx"

const modelClue = (props, state) => ({
  identity: props.identity.toLowerCase(),
  query: queries.FIND,
  sort: { id: 1 },
  limit: props.limit || props.constants.tableRowsNumber,
  offset: state.page * (props.limit || props.constants.tableRowsNumber),
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

  componentDidMount() {
    this.props.loadModels(modelClue(this.props), { force: true })
  }

  componentDidUpdate(prevProps) {
    if (this.props.page !== prevProps.page) {
      this.props.loadModels(modelClue(this.props), { force: true })
    }
  }

  render() {
    const { identity, models, constants, columns, onCellClick, url, deletedHash, deletedKey } = this.props
    const currentLimit = this.props.limit || constants.tableRowsNumber
    return (
      <Loader item={models}>
        <ModelTable
          schema={constants.schemas[identity]}
          data={models?.data || []}
          columns={columns}
          onCellClick={onCellClick}
          url={url}
          deletedHash={deletedHash}
          deletedKey={deletedKey}
        />
        <TablePagination
          count={models?.meta.responseMeta
            ? JSON.parse(models.meta.responseMeta.meta).total
            : currentLimit}
          rowsPerPage={currentLimit}
          rowsPerPageOptions={_.sortBy(_.uniq([10, 20, 50, 100].concat(currentLimit)))}
          page={0}
          onChangePage={(e, p) => {this.setState({ page: p })}}
          //onChangeRowsPerPage={this.handleChangeRowsPerPage}
          component="div"
        />
      </Loader>
    )
  }
}
