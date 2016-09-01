import React, { Component } from 'react'
import { connect } from 'react-redux'
import { __, isLastDay, timeToString } from './utils'
import { timerCounterSelector } from '../redux/selectors'
import { rateAccounted, rateTimeUp } from '../redux/actions'

import { CountdownTimer } from 'views/components/main/parts/countdown-timer'

export default connect(
  timerCounterSelector,
  { rateAccounted, rateTimeUp }
)(class TimerPanel extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLastDay: isLastDay(),
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.counter.nextTime != this.props.counter.nextTime) {
      this.setState({
        isLastDay: isLastDay(),
      })
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.counter != this.props.counter
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
    const { isTimeUp, accounted, refreshed } = this.props.counter
    return (
      <div className="timer-panel" style={this.state.isLastDay ? { color: 'red' } : { color: 'inherit' }}>
        {
          accounted.status
          ? (
            <div className="timer-container">
              <span>{__('Accounted')}</span>
            </div>
          )
          : (
            <div className="timer-container">
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
          )
        }
        <div className="timer-container">
          <div className="timer-part">
            <span>{refreshed.str}</span>
            <span>{timeToString(refreshed.nextTime)}</span>
          </div>
          {
            (isTimeUp && !refreshed.status)
            ? ''
            :(
              <div className="timer-part">
                <span>{__('Before refresh')}</span>
                <CountdownTimer countdownId="sanka-refresh"
                                completeTime={refreshed.nextTime}
                                tickCallback={this.refreshTick} />
              </div>
            )
          }
        </div>
      </div>
    )
  }
})
