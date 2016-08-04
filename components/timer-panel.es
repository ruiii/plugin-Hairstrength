import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { isLastDay } from './utils'

import CountdownTimer from 'views/components/main/parts/countdown-timer'

export default connect(
  createSelector([
    accountSelector,
    refreshSelector
  ], (account, refresh) => ({
    account,
    refresh
  }))
)(class TimerPanel extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLastDay: isLastDay(),
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.completeTime != this.props.completeTime) {
      this.setState({
        isLastDay: isLastDay(),
      })
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.completeTime != this.props.completeTime || nextState.isLastDay != this.state.isLastDay
  }
  tick = (timeRemaining) => {
    const isLastDay = isLastDay()
    if (isLastDay != this.state.isLastDay)
      this.setState({ isLastDay })
  }
  render() {
    const {
      presumedSenka,
      accounted,
      accountTimeString,
      nextAccountTime,
      accountCountdown
    } = this.props.account
    const {
      refreshTimeString,
      nextRefreshTime,
      refreshCountdown
    } = this.props.refresh
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
              <span>{presumedSenka}</span>
            </div>
          )
          : (
            <div className='col-container'>
              <span>{accountTimeString}</span>
              <span>{timeToString(nextAccountTime)}</span>
              <span>{__('Before account')}</span>
              <CountdownTimer countdownId={`expedition-${this.props.dockIndex+1}`}
                              completeTime={accountCountdown}
                              tickCallback={this.tick} />
            </div>
          )
        }
        <div className='col-container'>
          <span>{refreshTimeString}</span>
          <span>{timeToString(nextRefreshTime)}</span>
          <span>{__('Before refresh')}</span>
          <CountdownTimer countdownId={`expedition-${this.props.dockIndex+1}`}
                          completeTime={refreshCountdown}
                          tickCallback={this.tick} />
        </div>
      </div>
    )
  }
})
