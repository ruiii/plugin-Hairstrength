import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Table, Panel, Button } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { forEach } from 'lodash'
import { __, dateToString } from './utils'
import { historyDataSelector, historyShowSelector } from '../redux/selectors'
import { showHistory } from '../redux/actions'

const DataItem = ({ data }) => {
  const { time, rank, rate } = data
  return (
    <tr>
      <td style={{padding: 2}}>{ dateToString(time) }</td>
      <td style={{padding: 2}}>{ rank }</td>
      <td style={{padding: 2}}>{ rate.toFixed(1) }</td>
    </tr>
  )
}

export default connect(
  createSelector([
    historyShowSelector,
    historyDataSelector,
  ], ({ historyShow }, { historyData }) =>
    ({ historyShow, historyData })),
  { showHistory }
)(class HistoryPanel extends Component{
  onHistoryClose = (e) => {
    this.props.showHistory()
  }
  render() {
    const { historyShow, historyData } = this.props
    let items = []
    forEach(historyData, (d, i) => {
      if ((new Date(d[0])).getUTCHours() === 18) {
        return
      }
      items.push(<DataItem key={i} data={d} />)
    })
    return (
      <Panel className="history-panel" collapsible expanded={historyShow}>
        <Table striped bordered condensed hover responsive>
          <thead>
            <tr>
              <th>{__('Time')}</th>
              <th>{__('Ranking')}</th>
              <th>{__('Rate')}</th>
            </tr>
          </thead>
          <tbody>{ items }</tbody>
        </Table>
        <Button onClick={this.onHistoryClose}>
          <FontAwesome className="setting-icon" key={0} name='close' />
        </Button>
      </Panel>
    )
  }
})
