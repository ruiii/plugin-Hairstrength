import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { timeToString } from './utils'
import { timerSelector, rankSelector } from '../redux/selectors'

const { i18n } = window
const __ = i18n["poi-plugin-senka-calc"].__.bind(i18n["poi-plugin-senka-calc"])
const rankName = ['', '元帥', '大将', '中将', '少将', '大佐', '中佐', '新米中佐', '少佐', '中堅少佐', '新米少佐']

export default connect(
  createSelector([
    state => ({ basic: state.info.basic }),
    timerSelector,
    rankSelector
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
      rankDelta
    } = rank

    return (
      <div>
        <div>
          <div>{ api_nickname }</div>
          <div>{ rankName[api_rank] }</div>
        </div>
        <div>
          <h6>
            {__('By:　%s　', timeToString(timer.updateTime))}
          </h6>
          <h6>
            { __('Rate') }: { updatedRate }
            { rateDelta > 0 ? `(↑${rateDelta})` : ''}
          </h6>
          <h6>
            { __('Ranking') }: { updatedRank }
            { rankDelta > 0 ? `(↓${rankDelta})` : `(↑${Math.abs(rankDelta)})` }
          </h6>
        </div>

      </div>
    )
  }
})
