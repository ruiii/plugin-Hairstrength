import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { isLastDay, timeToString } from './utils'
import { timerSelector } from '../redux/selectors'

const { i18n } = window
const __ = i18n["poi-plugin-senka-calc"].__.bind(i18n["poi-plugin-senka-calc"])

import { CountdownTimer } from 'views/components/main/parts/countdown-timer'

export default connect(
  timerSelector,
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
    return nextProps.timer.nextAccountTime != this.props.timer.nextAccountTime || nextState.isLastDay != this.state.isLastDay
  }
  tick = (timeRemaining) => {
    const _isLastDay = isLastDay()
    if (_isLastDay != this.state.isLastDay)
      this.setState({ isLastDay: _isLastDay })
  }
  render() {
    const {
    //  presumedSenka,
      accounted,
      accountString,
      nextAccountTime,
      refreshString,
      nextRefreshTime,
      isTimeUp
    } = this.props.timer
    return (
      <div className='table-container'
           style={this.state.isLastDay ? { color: 'red' } : { color: 'inherit' }}>
        {
          accounted
          ? (
            <div className='col-container'>
              <span>{__('Accounted')}</span>
              <span>{'  '}</span>
              <span>{__('Presumed rate')}</span>
              {/*<span>{presumedSenka}</span>*/}
            </div>
          )
          : (
            <div className='col-container'>
              <span>{accountString}</span>
              <span>{timeToString(nextAccountTime)}</span>
              <span>{__('Before account')}</span>
              <CountdownTimer countdownId="sanka-account"
                              completeTime={nextAccountTime}
                              tickCallback={this.tick} />
            </div>
          )
        }
        <div className='col-container'>
          <span>{refreshString}</span>
          <span>{timeToString(nextRefreshTime)}</span>
          {
            !isTimeUp
            ? (
              <div>
                <span>{__('Before refresh')}</span>
                <CountdownTimer countdownId="sanka-refresh"
                                completeTime={nextRefreshTime}
                                tickCallback={this.tick} />
              </div>
            )
            : (
              <span>please update rank list</span>
            )
          }
        </div>
      </div>
    )
  }
})
