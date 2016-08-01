import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Panel, Label, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { map, get, range, once, isEqual } from 'lodash'

import CountdownTimer from 'views/components/main/parts/countdown-timer'

class CountdownLabel extends Component {
  getLabelStyle = (timeRemaining) => {
    return (
      timeRemaining > 600 ? 'primary' :
      timeRemaining > 60 ? 'warning' :
      timeRemaining >= 0 ? 'success' :
      'default'
    )
  }
  constructor(props) {
    super(props)
    this.notify = once(this.props.notify)
    this.state = {
      style: this.getLabelStyle(CountdownTimer.getTimeRemaining(this.props.completeTime)),
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.completeTime != this.props.completeTime) {
      this.notify = once(nextProps.notify)
      this.setState({
        style: this.getLabelStyle(CountdownTimer.getTimeRemaining(nextProps.completeTime)),
      })
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.completeTime != this.props.completeTime || nextState.style != this.state.style
  }
  tick = (timeRemaining) => {
    const notifyBefore = Math.max(window.notify.expedition || 0, 1)
    if (0 < timeRemaining && timeRemaining <= notifyBefore)
      this.notify()
    const style = this.getLabelStyle(timeRemaining)
    if (style != this.state.style)
      this.setState({style: style})
  }
  render() {
    return (
      <OverlayTrigger placement='left' overlay={
        (this.props.completeTime > 0) ? (
          <Tooltip id={`expedition-return-by-${this.props.dockIndex}`}>
            <strong>{__("Return by : ")}</strong>{timeToString(this.props.completeTime)}
          </Tooltip>
        ) : (
          <span />
        )
      }>
        <Label className="expedition-timer" bsStyle={this.state.style}>
        {
          (this.props.completeTime > 0) ? (
            <CountdownTimer countdownId={`expedition-${this.props.dockIndex+1}`}
                            completeTime={this.props.completeTime}
                            tickCallback={this.tick} />
          ) : undefined
        }
        </Label>
      </OverlayTrigger>
    )
  }
}
