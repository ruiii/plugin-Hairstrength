import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { expSelector, customSelector } from '../redux/selectors'
import { estimateSenka } from './utils'

export default connect(
  createSelector([
    expSelector,
    customSelector
  ], (exp, custom) => ({
    exp,
    baseExp: custom.baseExp
  }))
)(class RatePanel extends Component{
  render() {
    const { exp, baseExp } = this.props
    const rate = estimateSenka(exp, baseExp)

    return (
      <div className='exp-listener'>
        <span>{__ 'Experience'}</span>
        <span>{baseExp}　->　{exp}</span>
        <span>( ↑ {exp - baseExp} )</span>
        <span>{__ 'Rate'}</span>
        <span>{rate}</span>
      </div>
    )
  }
})
