import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Button, Checkbox, Panel, Table } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { forEach, includes } from 'lodash'
import { __, getStatusStyle } from './utils'
import { activeRankChange } from '../redux/actions'
import {
  activeRankSelector,
  updateTimerDetailSelector,
  userDetailInitSelector,
  userInitInfoSelector,
} from '../redux/selectors'

export default connect(
  createSelector([
    activeRankSelector,
    updateTimerDetailSelector,
    userDetailInitSelector,
    userInitInfoSelector,
  ], ({ activeRank }, timerDetail, { updatedDetail }, { api_nickname }) =>
    ({ activeRank, timerDetail, updatedDetail, api_nickname })),
  { activeRankChange }
)(class RankBlock extends Component {
  constructor(props) {
    super(props)
  }
  onClickCheckbox = (index) => {
    const activeRank = this.props.activeRank
    activeRank[index].active = !activeRank[index].active
    this.props.activeRankChange(activeRank)
  }
  render() {
    const { activeRank, timerDetail, updatedDetail, api_nickname } = this.props
    const { updatedList, isUpdated } = timerDetail
    const { rank, rate } = updatedDetail

    return (
      <div className="rank-block">
        <Table responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>{ __('Ranking') }</th>
              <th>{ __('Rate') }</th>
            </tr>
          </thead>
          <tbody>
            {
              Object.keys(activeRank).map(rank =>
                <tr key={rank} style={getStatusStyle(activeRank[rank].active)}>
                  <th>
                    <Checkbox onChange={this.onClickCheckbox.bind(this, rank)}
                              checked={activeRank[rank].active} />
                  </th>
                  <th>{ rank }</th>
                  <th style={getStatusStyle(updatedList[rank])}>
                    { `${activeRank[rank].rate} ( ↑${activeRank[rank].delta} )` }
                  </th>
                </tr>
              )
            }
            <tr>
              <th>{ api_nickname }</th>
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
