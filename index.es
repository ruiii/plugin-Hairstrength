import React, { Component, PropTypes } from 'react'
import { combineReducers } from 'redux'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Alert } from 'react-bootstrap'
import { join } from 'path-extra'

import { reducer, observeInit } from './redux'
import DetailPanel from './components/detail-panel'
import SettingPanel from './components/setting-panel'
import TimerPanel from './components/timer-panel'
import RatePanel from './components/rate-panel'
import RankList from './components/rank-list'
import HistoryPanel from './components/history-panel'

export const reactClass = (class SenkaCalc extends Component {
  render() {
    return (
      <div id="Senka Calc" className="Senka Calc">
        <link rel='stylesheet' href={join(__dirname , 'assets', 'senka-calc.css')} />
        <DetailPanel />
        <SettingPanel />
        <TimerPanel />
        <RatePanel />
        <RankList />
        <HistoryPanel />
      </div>
    )
  }
})

export { reducer }

export function pluginDidLoad() {
  observeInit()
}

export function pluginWillUnload() {
  // will unload
  // TODO: save data or ...
}
