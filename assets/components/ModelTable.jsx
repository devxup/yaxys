import React, { Component } from "react"
import { Link } from "react-router-dom"
import PropTypes from "prop-types"
import classNames from "classnames"
import { withStyles } from "@material-ui/core/styles"
import MuiTable from "mui-table"
import { omit } from "lodash"
import { deepOrange } from "@material-ui/core/colors"
import Checkbox from "@material-ui/core/Checkbox"
import Chip from "@material-ui/core/Chip"
import Avatar from "@material-ui/core/Avatar"
import DeleteIcon from "@material-ui/icons/Delete"
import IconButton from "@material-ui/core/IconButton"

const styles = theme => ({
  checkboxRoot: {
    padding: 0,
  },
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
    padding: "12px 56px 12px 24px",
    color: "#333",
  },
  chip: {
    marginLeft: theme.spacing.unit / 2,
    cursor: "inherit",
  },
  row: {
    "&:hover": {
      background: theme.palette.grey[100],
    },
    "&:hover $trashButton": {
      visibility: "visible",
    },
  },
  deletedCell: {
    color: theme.palette.grey[700],
    background: deepOrange[50],
    cursor: "default",
  },
  trashButton: {
    visibility: "hidden",
  },
  trashButtonCell: {
    paddingRight: 0,
    textAlign:"right",
    width: 1,
  },
})

@withStyles(styles)
export default class ModelTable extends Component {
  static propTypes = {
    schema: PropTypes.object.isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    url: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    columns: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
    onCellClick: PropTypes.func,
    deletedHash: PropTypes.object,
    deletedKey: PropTypes.string,
    onDelete: PropTypes.func,
  }

  _renderRelatedModel(model, props) {
    const { classes } = this.props

    // it might be empty containing just _binding_id in case of m:m
    if (!model.id) {
      return true
    }

    return (
      <Chip
        className={classes.chip}
        avatar={<Avatar>#{model.id}</Avatar>}
        label={model.name || ""}
        color="primary"
        variant="outlined"
        {...props}
      />
    )
  }

  renderPropertyCellContent(propertySchema, value) {
    const { classes } = this.props
    switch (propertySchema?.type) {
      case "boolean":
        return <Checkbox checked={value} classes={{ root: classes.checkboxRoot }} />
      default:
        if (propertySchema.connection) {
          if (Array.isArray(value)) {
            return value.map((item, index) => this._renderRelatedModel(item, { key: index }))
          }
          if (value && typeof value === "object") {
            return this._renderRelatedModel(value)
          }
        }
        return value
    }
  }

  renderPropertyCell(proppertySchema, value, url) {
    const { classes } = this.props
    return url ? (
      <Link className={classes.link} to={url}>
        {this.renderPropertyCellContent(proppertySchema, value)}
      </Link>
    ) : (
      <div className={classes.link}>{this.renderPropertyCellContent(proppertySchema, value)}</div>
    )
  }

  render() {
    const { classes, columns, url, schema, deletedHash, deletedKey, onDelete } = this.props
    const tableProps = {
      rowProps: {
        className: classes.row,
      },
      headerCellProps: {
        className: classNames(classes.cell, classes.headerCell),
      },
      bodyCellProps: data => {
        const { rowData } = data
        const isDeleted = deletedHash?.[rowData[deletedKey || "id"]]
        return {
          className: classNames(
            classes.cell,
            { [classes.linkCell]: !!url },
            { [classes.deletedCell]: isDeleted }
          ),
        }
      },
      ...omit(this.props, "url", "schema", "classes", "deletedHash", "deletedKey"),
    }
    const patchedColumns = (columns || schema?.defaultProperties || ["id", "name"]).map(
      columnOriginal => {
        let column =
          typeof columnOriginal === "string"
            ? { name: columnOriginal }
            : Object.assign({}, columnOriginal)
        let property
        if (typeof columnOriginal === "string" && schema) {
          property = schema.properties[column.name]
          column.header =
            column.name === "id" || column.name === "#"
              ? "#"
              : (property && property.title) || column.name
        }
        column.cell = rowData => {
          const isDeleted = deletedHash?.[rowData[deletedKey || "id"]]
          return this.renderPropertyCell(
            property,
            rowData[column.name],
            (url && !isDeleted)
              ? url(rowData)
              : false
          )
        }

        return column
      }
    )

    if (onDelete) {
      patchedColumns.push({
        header: (
          <IconButton disabled={true}>
            <DeleteIcon />
          </IconButton>
        ),
        cellProps: { classes: { root:classes.trashButtonCell } },
        cell: rowData => {
          if (deletedHash?.[rowData[deletedKey || "id"]]) {
            return false
          }
          return (
            <IconButton className={classes.trashButton} onClick={() => onDelete(rowData)}>
              <DeleteIcon />
            </IconButton>
          )
        },
      })
    }

    return <MuiTable includeHeaders={true} {...tableProps} columns={patchedColumns} />
  }
}
