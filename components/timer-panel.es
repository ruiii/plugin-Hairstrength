import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { includes } from 'lodash'
import { isLastDay, timeToString } from './utils'
import { timerSelector } from '../redux/selectors'
import { rateAccounted, rateTimeUp } from '../redux/actions'

const { i18n } = window
const __ = i18n["poi-plugin-senka-calc"].__.bind(i18n["poi-plugin-senka-calc"])

import { CountdownTimer } from 'views/components/main/parts/countdown-timer'

export default connect(
  timerSelector,
  { rateAccounted, rateTimeUp }
)(class TimerPanel extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLastDay: isLastDay(),
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.timer.nextAccountTime != this.props.timer.nextAccountTime) {
      this.setState({
        isLastDay: isLastDay(),
      })
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.timer != this.props.timer
  }
  accountTick = (timeRemaining) => {
    if (timeRemaining === 0) {
      this.props.rateAccounted()
    }
  }
  refreshTick = (timeRemaining) => {
    if (timeRemaining === 0) {
      this.props.rateTimeUp()
      const _isLastDay = isLastDay()
      if (_isLastDay != this.state.isLastDay) {
        this.setState({
          isLastDay: _isLastDay
        })
      }
    }

  }
  render() {
    const {
      accounted,
      accountString,
      nextAccountTime,
      refreshString,
      nextRefreshTime,
      updatedList,
      isTimeUp,
      isUpdated
    } = this.props.timer
    return (
      <div style={this.state.isLastDay ? { color: 'red' } : { color: 'inherit' }}>
        {
          (accounted && !isUpdated)
          ? (
            <div>
              <span>{__('Accounted')}</span>
            </div>
          )
          : (
            <div>
              <span>{accountString}</span>
              <span>{timeToString(nextAccountTime)}</span>
              <span>{__('Before account')}</span>
              <CountdownTimer countdownId="sanka-account"
                              completeTime={nextAccountTime}
                              tickCallback={this.accountTick} />
            </div>
          )
        }
        <div>
          <span>{refreshString}</span>
          <span>{timeToString(nextRefreshTime)}</span>
          {
            (isTimeUp && !isUpdated)
            ? <span>please update rank list</span>
            :(
              <div>
                <span>{__('Before refresh')}</span>
                <CountdownTimer countdownId="sanka-refresh"
                                completeTime={nextRefreshTime}
                                tickCallback={this.refreshTick} />
              </div>
            )
          }
        </div>
      </div>
    )
  }
})
