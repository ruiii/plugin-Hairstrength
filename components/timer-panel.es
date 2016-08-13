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
          isLastDay: _isLastDay,
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
      isTimeUp,
      isUpdated,
    } = this.props.timer
    return (
      <div className="timer-panel" style={this.state.isLastDay ? { color: 'red' } : { color: 'inherit' }}>
        {
          accounted
          ? (
            <div className="timer-container">
              <span>{__('Accounted')}</span>
            </div>
          )
          : (
            <div className="timer-container">
              <div className="timer-part">
                <span>{accountString}</span>
                <span>{timeToString(nextAccountTime)}</span>
              </div>
              <div className="timer-part">
                <span>{__('Before account')}</span>
                <CountdownTimer countdownId="sanka-account"
                                completeTime={nextAccountTime}
                                tickCallback={this.accountTick} />
              </div>
            </div>
          )
        }
        <div className="timer-container">
          <div className="timer-part">
            <span>{refreshString}</span>
            <span>{timeToString(nextRefreshTime)}</span>
          </div>
          {
            (isTimeUp && !isUpdated)
            ? ''
            :(
              <div className="timer-part">
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
