import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Checkbox, Alert, Button } from 'react-bootstrap'
import { forEach, sum, includes, reduce } from 'lodash'
import { getStatusStyle } from './utils'
import { activeRankChange } from '../redux/actions'
// import {
//   activeRankSelector,
//   updateStatusSelector,
//   rankListSelector,
//   rateListSelector,
//   deltaListSelector,
//   updatedListSelector,
// } from '../redux/selectors'
import { rankSelector, timerSelector } from '../redux/selectors'
const { i18n } = window
const __ = i18n["poi-plugin-senka-calc"].__.bind(i18n["poi-plugin-senka-calc"])

export default connect(
  createSelector([
    rankSelector,
    timerSelector
  ], ({ rank }, { timer }) =>
    ({ rank, timer })),
  { activeRankChange }
)(class RankList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      show: true,
      ranks: [1, 5, 20, 100, 500]
    }
  }
  onShowFilter = (e) => {
    this.setState({
      show: !this.state.show
    })
  }
  onClickCheckbox = (index) => {
    let activeRank = this.props.rank.activeRank
    activeRank[index] = !activeRank[index]
    this.props.activeRankChange(activeRank)
  }
  render() {
    const { show, ranks, timer } = this.state
    const {
      activeRank,
      rateList,
      deltaList,
      updatedTime
    } = this.props.rank
    const { updatedList, isUpdated } = this.props.timer

    const { onClickCheckbox } = this
    const cover = includes(updatedList, true)
    let checkbox = []
    let rankDom = []
    let rateDom = []
    forEach(activeRank, (active, i) => {
      checkbox.push(
        <Checkbox key={i}
               onChange={onClickCheckbox.bind(this, i)}
               checked={active}>
          {ranks[i]}
        </Checkbox>
      )
      if (!active) {
        return
      }
      rankDom.push(
        <span key={i}>{ ranks[i] }</span>
      )
      rateDom.push(
        <span key={i} style={getStatusStyle(updatedList[i])}>
          { `${rateList[i]}(↑${deltaList[i]})` }
        </span>
      )
    })

    return (
      <div className='table-container'>
        <div className='col-container'>
          <div onClick={this.onShowFilter}>
            {/*<Divider text={__('Filter')} icon={true} hr={true} show={show}/>*/}
          </div>
          <div style={{marginTop: '-15px'}}
               className={show ? 'show' : 'hidden'}>
             { checkbox }
          </div>
        </div>
        <div className='col-container'>
          <Alert bsStyle='danger'
                 className={isUpdated ? 'hidden' : 'show'}>
            { __('It will save when all rates is updated') }
          </Alert>
          <div className='table-container' style={getStatusStyle(cover)} >
            <div className='col-container'>
              <span className='title'>{ __('Ranking') }</span>
              { rankDom }
            </div>
            <div className='col-container'>
              <span className='title'>{ __('Rate') }</span>
              { rateDom }
            </div>
          </div>
        </div>
      </div>
    )
  }
})
