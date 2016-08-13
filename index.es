import React, { Component } from 'react'
import { connect } from 'react-redux'
import { join } from 'path-extra'
import { observer, observe } from 'redux-observers'

import { store } from 'views/createStore'
import { reducer } from './redux'
import { initStatusSelector, baseDetailSelector, historyDataSelector, rankSelector } from './redux/selectors'
import { storeHistoryData } from './redux/actions'
import { saveHistoryData, storePath } from './components/utils'
import SettingPanel from './components/setting-panel'
import DetailPanel from './components/detail-panel'
import TimerPanel from './components/timer-panel'
import RatePanel from './components/rate-panel'
import RankPanel from './components/rank-panel'
import HistoryPanel from './components/history-panel'

export const reactClass = connect(
  initStatusSelector
)(class SenkaCalc extends Component {
  render() {
    if (this.props.init) {
      return (
        <div id="Senka Calc" className="Senka Calc">
          <link rel='stylesheet' href={join(__dirname , 'assets', 'senka-calc.css')} />
          <SettingPanel />
          <DetailPanel />
          <TimerPanel />
          <RatePanel />
          <RankPanel />
          <HistoryPanel />
        </div>
      )
    } else {
      return (
        <h6>请登录</h6>
      )
    }
  }
})

export { reducer }

let unsubBaseDetailObserve, unsubRankObserve, unsubHistoryDataObserve

export function pluginDidLoad() {
  unsubBaseDetailObserve = observe(store, [observer(
    baseDetailSelector,
    (dispatch, current, previous) => {
      if (!current.custom) {
        return
      }
      localStorage.setItem(storePath, JSON.stringify(current))
    }
  )])

  unsubRankObserve = observe(store, [observer(
    rankSelector,
    (dispatch, current, previous) => {
      if (!current.rank || !previous.rank) {
        return
      }
      if (current.rank.updatedTime !== previous.rank.updatedTime) {
        dispatch(storeHistoryData())
      }
    }
  )])

  unsubHistoryDataObserve = observe(store, [observer(
    historyDataSelector,
    (dispatch, current, previous) => {
      if (!current.historyData) {
        return
      }
      saveHistoryData(current.historyData)
    }
  )])
}

export function pluginWillUnload() {
  unsubBaseDetailObserve()
  unsubRankObserve()
  unsubHistoryDataObserve()
}
