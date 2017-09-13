import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Button, Checkbox, Panel, Table } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { forEach, includes } from 'lodash'
import { __, getStatusStyle } from './utils'
import {
  activeRankSelector,
  updateTimerDetailSelector,
  userDetailInitSelector,
} from '../redux/selectors'

export default connect(
  createSelector([
    activeRankSelector,
    updateTimerDetailSelector,
    userDetailInitSelector,
  ], ({ activeRank }, timerDetail, { updatedDetail }) =>
    ({ activeRank, timerDetail, updatedDetail })),
)(class RankBlock extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { activeRank, timerDetail, updatedDetail } = this.props
    const { updatedList } = timerDetail
    const { rank, rate } = updatedDetail

    return (
      <div className="rank-block">
        <Table bordered responsive>
          <thead>
            <tr>
              <th>{ __('Ranking') }</th>
              <th>{ __('Rate') }</th>
            </tr>
          </thead>
          <tbody>
            {
              Object.keys(activeRank).map(rank =>
                <tr key={rank} style={getStatusStyle(activeRank[rank].active)}>
                  <th>{ rank }</th>
                  <th style={getStatusStyle(updatedList[rank])}>
                    { `${activeRank[rank].rate} ( ↑${activeRank[rank].delta} )` }
                  </th>
                </tr>
              )
            }
            <tr>
              <th>
                <p>{ rank.value.toFixed(0) }</p>
                <p>
                  {
                    rank.delta > 0
                    ? ` ( ↓${rank.delta.toFixed(0)} )`
                    : ` ( ↑${Math.abs(rank.delta).toFixed(0)} )`
                  }
                </p>
              </th>
              <th>
                <p>{ rate.value.toFixed(1) }</p>
                <p>{ rate.delta > 0 ? ` ( ↑${rate.delta.toFixed(1)} )` : ''}</p>
              </th>
            </tr>
          </tbody>
        </Table>
      </div>
    )
  }
})
