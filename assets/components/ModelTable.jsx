import React, { Component } from "react"
import { Link } from "react-router-dom"
import PropTypes from "prop-types"
import classNames from "classnames"
import { withStyles } from "@material-ui/core/styles"
import MuiTable from "mui-table"
import { omit } from "lodash"

const styles = theme => ({
  cell: {
    fontSize: 16,
  },
  headerCell: {
    background: theme.palette.grey[200],
    color: theme.palette.grey[900],
    fontSize: 16,
    fontWeight: 400,
  },
  linkCell: {
    padding: 0,
  },
  link: {
    display: "block",
    padding: "0px 56px 0px 24px",
    height: 48,
    lineHeight: "48px",
    color: "#333",
  },
  row: {
    "&:hover": {
      background: theme.palette.grey[100],
    },
  },
})

export default
@withStyles(styles)
class ModelTable extends Component {
  static propTypes = {
    schema: PropTypes.object.isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    url: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    columns: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
  }

  render() {
    const { classes, columns, url, schema } = this.props
    const tableProps = {
      rowProps: {
        className: classes.row,
      },
      bodyCellProps: {
        className: classNames(classes.cell, { [classes.linkCell]: !!url }),
      },
      headerCellProps: {
        className: classNames(classes.cell, classes.headerCell),
      },
      ...omit(this.props, "url", "schema", "classes"),
    }
    const patchedColumns = columns.map(columnOriginal => {
      let column =
        typeof columnOriginal === "string"
          ? { name: columnOriginal }
          : Object.assign({}, columnOriginal)

      if (typeof columnOriginal === "string" && schema) {
        const property = schema.properties[column.name]
        column.header =
          column.name === "id" || column.name === "#"
            ? "#"
            : (property && property.title) || column.name
      }

      if (url) {
        column.cell = rowData => {
          return (
            <Link className={classes.link} to={url(rowData)}>
              {rowData[column.name]}
            </Link>
          )
        }
      }
      return column
    })

    return <MuiTable includeHeaders={true} {...tableProps} columns={patchedColumns} />
  }
}
