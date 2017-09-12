import React, { Component } from 'react'
import { connect } from 'react-redux'
import { __, isLastDay, timeToString } from './utils'
import { timerSelector } from '../redux/selectors'
import { rateAccounted, rateTimeUp } from '../redux/actions'

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
    if (nextProps.timer.counter.accounted.nextTime != this.props.timer.counter.accounted.nextTime) {
      this.setState({
        isLastDay: isLastDay(),
      })
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.timer != this.props.coutimernter
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
          isLastDay: _isLastDay,
        })
      }
    }
  }
  render() {
    const { isTimeUp, counter } = this.props.timer
    const { accounted, refreshed } = counter
    return (
      <div className="timer-panel" style={{ color: this.state.isLastDay ? 'red' : 'inherit' }}>
        {
          accounted.status
          ? <div className="timer-container">
              <span>{__('Accounted')}</span>
            </div>
          : <div className="timer-container">
              <div className="timer-part">
                <span>{accounted.str}</span>
                <span>{timeToString(accounted.nextTime)}</span>
              </div>
              <div className="timer-part">
                <span>{__('Before account')}</span>
                <CountdownTimer countdownId="sanka-account"
                                completeTime={accounted.nextTime}
                                tickCallback={this.accountTick} />
              </div>
            </div>
        }
        <div className="timer-container">
          <div className="timer-part">
            <span>{refreshed.str}</span>
            <span>{timeToString(refreshed.nextTime)}</span>
          </div>
          {
            Boolean(isTimeUp && !refreshed.status)
            &&
            <div className="timer-part">
              <span>{__('Before refresh')}</span>
              <CountdownTimer countdownId="sanka-refresh"
                              completeTime={refreshed.nextTime}
                              tickCallback={this.refreshTick} />
            </div>
          }
        </div>
      </div>
    )
  }
})
