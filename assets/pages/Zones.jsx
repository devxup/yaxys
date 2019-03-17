/* eslint-disable react/prop-types */
import React, { Component } from "react"
import { connect } from "react-redux"

import Paper from "@material-ui/core/Paper"
import Button from "@material-ui/core/Button"

import YaxysClue, { queries } from "../services/YaxysClue"
import { withConstants } from "../services/Utils"

import Wrapper from "../components/Wrapper.jsx"
import Created from "../components/Created.jsx"
import ModelTableLoader from "../components/ModelTableLoader.jsx"
import ModelDialog from "../components/ModelDialog.jsx"
import { withNamespaces } from "react-i18next"
import Request from "../components/Request.jsx"

const CREATED_ZONES_MARKER = "zones-page"
const createdZonesSelector = YaxysClue.selectors.byClue(
  props => ({ identity: "zone", query: queries.CREATE }),
  { marker: CREATED_ZONES_MARKER }
)

@withConstants
@withNamespaces()
@connect(
  (state, props) => ({
    createdZones: createdZonesSelector(state, props),
  }),
  {
    createZone: YaxysClue.actions.byClue,
    deleteZone: YaxysClue.actions.byClue,
  }
)
export default class Zones extends Component {
  state = {
    addOpen: false,
    deletedHash: {},
    constructedAt: new Date().getTime(),
  }

  onAdd = event => {
    this.setState({ addOpen: true })
  }

  onAddClose = () => {
    this.setState({ addOpen: false })
  }

  onAddReady = values => {
    this.setState({ addOpen: false })

    this.props.createZone(
      {
        identity: "zone",
        query: queries.CREATE,
        data: values,
      },
      { marker: CREATED_ZONES_MARKER }
    )
  }

  onDeleteItem = item => {
    const { t } = this.props
    if (this.state.deletedHash[item.id]) {
      return
    }
    const entityInstance = t("ENTITY_INSTANCE", {
      entity: "$t(ZONE)",
      case: "ACCUSATIVE",
      info: {
        id: item.id,
        data: item,
      },
    })
    if (!confirm(`${t("ARE_YOU_SURE_TO")} ${t("DELETE").toLowerCase()} ${entityInstance}?`)) {
      return
    }

    this.props.deleteZone({
      identity: "zone",
      query: queries.DELETE,
      id: item.id,
    })

    this.setState({
      deletedSelector: YaxysClue.selectors.byClue(
        props => ({ identity: "zone", query: queries.DELETE, id: item.id })
      ),
      deleteAttemptAt: new Date().getTime(),
    })
  }

  onItemDeleted = item => {
    this.state.deletedHash[item?.meta?.clue?.id] = true
    this.forceUpdate()
  }

  render() {
    const { constants, t } = this.props
    return (
      <Wrapper breadcrumbs={[t("ZONE_PLURAL")]}>
        <h1 style={{ marginTop: 0 }}>{t("ZONE_PLURAL")}</h1>
        <Button
          variant="text"
          color="secondary"
          onClick={this.onAdd}
        >
          { `${t("CREATE")} ${t("ZONE", { "context": "ACCUSATIVE" })}`}
        </Button>
        <Created
          items={this.props.createdZones}
          content={
            zone => t("ENTITY_INSTANCE", {
              entity: "$t(ZONE)",
              info: {
                id: zone.id,
                data: zone,
              },
            })
          }
          url={zone => `/zones/${zone.id}`}
          laterThan={ this.state.constructedAt }
        />
        <Paper>
          <ModelTableLoader
            identity="zone"
            url={zone => `/zones/${zone.id}`}
            columns={["id", "name", "description"]}
            onDelete={this.onDeleteItem}
            deletedHash={ this.state.deletedHash }
            deletedKey="id"
          />
        </Paper>
        <br />
        <ModelDialog
          title={t("ZONES_PAGE.CREATE_DLG_TITLE")}
          open={this.state.addOpen}
          onClose={this.onAddClose}
          onReady={this.onAddReady}
          schema={constants.schemas.zone}
          attributes={["name", "description"]}
          btnReady={t("CREATE")}
        >
          {t("ZONES_PAGE.CREATE_DLG_DESC")}
        </ModelDialog>
        <Request
          selector={this.state.deletedSelector}
          message={ `${t("DELETE_PROCESS")} ${t("DEFINITE_ARTICLE")} ${t("ZONE", { context: "GENITIVE" })}`}
          attemptAt={ this.state.deleteAttemptAt }
          onSuccess={ this.onItemDeleted }
        />
      </Wrapper>
    )
  }
}
