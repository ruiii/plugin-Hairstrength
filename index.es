import React, { Component } from 'react'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'
import { join } from 'path-extra'
import { observer, observe } from 'redux-observers'

import { store } from 'views/createStore'
import { reducer } from './redux'
import { initStatusSelector, baseDetailSelector, historyDataSelector, rankSelector } from './redux/selectors'
import { storeHistoryData } from './redux/actions'
import { saveHistoryData, storePath, getMemberId } from './components/utils'
import SettingPanel from './components/setting-panel'
import DetailPanel from './components/detail-panel'
import TimerPanel from './components/timer-panel'
import RatePanel from './components/rate-panel'
import RankPanel from './components/rank-panel'
import HistoryPanel from './components/history-panel'

export const reactClass = class SenkaCalc extends Component {
  render() {
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
  }
})

export { reducer }

let unsubBaseDetailObserve, unsubRankObserve, unsubHistoryDataObserve

export function pluginDidLoad() {
  unsubBaseDetailObserve = observe(store, [observer(
    baseDetailSelector,
    (dispatch, current, previous) => {
      if (isEmpty(current.custom)) {
        return
      }
      if (previous.rank.updatedDetail !== current.rank.updatedDetail) {
        return dispatch({ type: '@@RATE_RESET_RATE'})
      }
      if (previous.timer.counter.accounted.status !== current.timer.counter.accounted.status
          && current.timer.counter.accounted.status
          && current.rank.eoRate.new !== 0) {
        return dispatch({ type: '@@RATE_STORE_EORATE'})
      }

      const id = getMemberId()
      const data = JSON.parse(localStorage.getItem(storePath) || '{}')
      data[id] = current
      localStorage.setItem(storePath, JSON.stringify(data))
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

  store.dispatch({ type: '@@poi-plugin-senka-calc@init' })
}

export function pluginWillUnload() {
  unsubBaseDetailObserve()
  unsubRankObserve()
  unsubHistoryDataObserve()
}
