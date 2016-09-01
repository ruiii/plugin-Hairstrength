import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { __, timeToString } from './utils'
import { userInitInfoSelector, updateTimeSelector, userDetailInitSelector } from '../redux/selectors'

const rankName = ['', '元帥', '大将', '中将', '少将', '大佐', '中佐', '新米中佐', '少佐', '中堅少佐', '新米少佐']

export default connect(
  createSelector([
    userInitInfoSelector,
    updateTimeSelector,
    userDetailInitSelector,
  ], ({ api_nickname, api_rank }, { updateTime }, { updatedDetail }) =>
    ({ api_nickname, api_rank, updateTime, updatedDetail }))
)(class DetailPanel extends Component{
  render() {
    const { api_nickname, api_rank, updateTime, updatedDetail } = this.props
    const { rank, rate } = updatedDetail

    return (
      <div className="detail-panel">
        <div className="user-container">
          <div className="nickname">{ api_nickname }</div>
          <div className="rank">{ rankName[api_rank] }</div>
        </div>
        <div className="rate-container">
          <span>
            {__('By:　%s　', timeToString(updateTime))}
          </span>
          <span>
            { __('Rate') }: { rate.value.toFixed(1) }
            { rate.delta > 0 ? ` ( ↑${rate.delta.toFixed(1)} )` : ''}
          </span>
          <span>
            { __('Ranking') }: { rank.value.toFixed(1) }
            { rank.delta > 0 ? ` ( ↓${rank.delta.toFixed(1)} )` : ` ( ↑${Math.abs(rank.delta).toFixed(1)} )` }
          </span>
        </div>

      </div>
    )
  }
})
