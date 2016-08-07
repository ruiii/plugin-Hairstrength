import React, { Component, PropTypes } from 'react'
import { combineReducers } from 'redux'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Alert } from 'react-bootstrap'
import { join } from 'path-extra'

import { extendReducer } from 'views/createStore'
const { i18n } = window
const __ = i18n["poi-plugin-senka-calc"].__.bind(i18n["poi-plugin-senka-calc"])
const REDUCER_EXTENSION_KEY = 'poi-plugin-senka-calc'

import DetailPanel from './components/detail-panel'
import TimerPanel from './components/timer-panel'

// import HistoryPanel from './components/history-panel'
// import RatePanel from './components/rate-panel'
// import RankList from './components/rank-list'

//import { initReducer } from './redux'


export const reactClass = (class SenkaCalc extends Component {
  render() {
    return (
      <div id="Senka Calc" className="Senka Calc">
        <link rel='stylesheet' href={join(__dirname , 'assets', 'Hairstrength.css')} />
        <DetailPanel />
        <TimerPanel />
        {/*{<HistoryPanel />
        <RatePanel />
        <RankList />}*/}
      </div>
    )
  }
})
