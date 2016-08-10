import React, { Component, PropTypes } from 'react'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { timeToString } from './utils'
import { showHistory } from '../redux/actions'
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
    ({ basic, timer, rank })),
  { showHistory }
)(class DetailPanel extends Component{
  constructor(props) {
    super(props)
    this.state = {
      show: false
    }
  }
  onShowHistory = (e) => {
    const show = !this.state.show
    this.props.showHistory(show)
    this.setState({ show })
  }
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
          <div className="name">{ api_nickname }</div>
          <div className="rank">{ rankName[api_rank] }</div>
        </div>
        <h6 className="detail-time">
          {__('By:　%s　', timeToString(timer.updateTime))}
          <OverlayTrigger placement='top' overlay={
            <Tooltip id='show-rate-tip'>
              <span>{__('Click to show your rates this month')}</span>
            </Tooltip>
          }>
            <FontAwesome key={0} name='book' onClick={this.onShowHistory} />
          </OverlayTrigger>
        </h6>
        <h6>
          { __('Ranking') }: { updatedRank }
          { rankDelta > 0 ? `(↓${rankDelta})` : `(↑${Math.abs(rankDelta)})` }
          &nbsp;&nbsp;
          { __('Rate') }: { updatedRate }
          { rateDelta > 0 ? `(↑${rateDelta})` : ''}
        </h6>
      </div>
    )
  }
})
