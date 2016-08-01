import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Alert } from 'react-bootstrap'

import DetailPanel from './components/detail-panel'
import TimerPanel from './components/timer-panel'
import HistoryPanel from './components/history-panel'
import RatePanel from './components/rate-panel'
import RankList from './components/rank-list'

const { FontAwesome, i18n, ROOT } = window
const __ = i18n["poi-plugin-senka-calc"].__.bind(i18n["poi-plugin-senka-calc"])
const REDUCER_EXTENSION_KEY = 'poi-plugin-senka-calc'

export default connect(

)(class SenkaCalc extends Component {
  render() {
    return (
      <div>
        <DetailPanel />
        <TimerPanel />
        <HistoryPanel />
        <RatePanel />
        <RankList />
      </div>
    )
  }
})
