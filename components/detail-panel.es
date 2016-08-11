import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { __, timeToString } from './utils'
import { timerSelector, rankSelector } from '../redux/selectors'

const rankName = ['', '元帥', '大将', '中将', '少将', '大佐', '中佐', '新米中佐', '少佐', '中堅少佐', '新米少佐']

export default connect(
  createSelector([
    state => ({ basic: state.info.basic }),
    timerSelector,
    rankSelector,
  ], ({ basic }, { timer }, { rank }) =>
    ({ basic, timer, rank }))
)(class DetailPanel extends Component{
  render() {
    const { basic, timer, rank } = this.props
    const { api_nickname, api_rank } = basic
    const {
      updatedRate,
      updatedRank,
      rateDelta,
      rankDelta,
    } = rank

    return (
      <div className="detail-panel">
        <div className="user-container">
          <div className="nickname">{ api_nickname }</div>
          <div className="rank">{ rankName[api_rank] }</div>
        </div>
        <div className="rate-container">
          <span>
            {__('By:　%s　', timeToString(timer.updateTime))}
          </span>
          <span>
            { __('Rate') }: { updatedRate.toFixed(1) }
            { rateDelta > 0 ? ` ( ↑${rateDelta.toFixed(1)} )` : ''}
          </span>
          <span>
            { __('Ranking') }: { updatedRank.toFixed(1) }
            { rankDelta > 0 ? ` ( ↓${rankDelta.toFixed(1)} )` : ` ( ↑${Math.abs(rankDelta).toFixed(1)} )` }
          </span>
        </div>

      </div>
    )
  }
})
