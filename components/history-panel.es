import React, { Component, PropTypes } from 'react'
import { Table } from 'react-bootstrap'
import { connect } from 'react-redux'
import { forEach } from 'lodash'
import { dateToString } from './utils'
import { historyStatusSelector, historyDataSelector } from '../redux/selectors'

const DataItem = connect(
  state => ({}),
  { dateToString }
)((dateToString, data) => {
  const { data, dateToString } = this.props
  let td = []
  forEach(data, (d, i) =>
    td.push(
      (i === 0)
      ? <td style={{padding: 2}} key={i}>{ dateToString(d) }</td>
      : <td style={{padding: 2}} key={i}>{ d }</td>
    )
  )
  return (
    <tr>{ td }</tr>
  )
})


export default connect(
  historyStatusSelector,
  historyDataSelector
)(class HistoryPanel extends Component{
  render() {
    let items = []
    forEach(this.props.historyData, (d, i) => {
      if ((new Date(d[0])).getUTCHours() === 18) {
        continue
      }
      items.push(<DataItem key={i} data={d} />)
    })
    return (
      <div className={`histort-panel ${this.props.historyShow ? 'show' : 'hidden'}`}>
        <Table striped bordered condensed hover Responsive>
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
