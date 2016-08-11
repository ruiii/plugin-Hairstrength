import React, { Component } from 'react'
import { join } from 'path-extra'

import { reducer, observeInit } from './redux'
import SettingPanel from './components/setting-panel'
import DetailPanel from './components/detail-panel'
import TimerPanel from './components/timer-panel'
import RatePanel from './components/rate-panel'
import RankPanel from './components/rank-panel'
import HistoryPanel from './components/history-panel'

export const reactClass = (class SenkaCalc extends Component {
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

export function pluginDidLoad() {
  observeInit()
}
