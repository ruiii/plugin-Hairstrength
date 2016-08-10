import React, { Component, PropTypes } from 'react'
import { createSelector } from 'reselect'
import { Table } from 'react-bootstrap'
import { connect } from 'react-redux'
import { forEach } from 'lodash'
import { __, dateToString } from './utils'
import { historyDataSelector, historyShowSelector } from '../redux/selectors'

const DataItem = connect(
  state => ({})
)(({ data }) => {
  const { time, rank, rate } = data
  return (
    <tr>
      <td style={{padding: 2}}>{ dateToString(time) }</td>
      <td style={{padding: 2}}>{ rank }</td>
      <td style={{padding: 2}}>{ rate }</td>
    </tr>
  )
})

export default connect(
  createSelector([
    historyShowSelector,
    historyDataSelector
  ], ({ historyShow }, { historyData }) =>
    ({ historyShow, historyData }))
)(class HistoryPanel extends Component{
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
      <div className={`histort-panel ${historyShow ? 'show' : 'hidden'}`}>
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
      </div>
    )
  }
})
