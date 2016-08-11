import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Checkbox, Alert, Panel } from 'react-bootstrap'
import { forEach, sum, includes, reduce } from 'lodash'
import { __, getStatusStyle } from './utils'
import { activeRankChange } from '../redux/actions'
import { rankSelector, timerSelector, filterShowSelector } from '../redux/selectors'

export default connect(
  createSelector([
    rankSelector,
    timerSelector,
    filterShowSelector
  ], ({ rank }, { timer }, { filterShow }) =>
    ({ rank, timer, filterShow })),
  { activeRankChange }
)(class RankPanel extends Component {
  constructor(props) {
    super(props)
    this.state = {
      show: true,
      ranks: [1, 5, 20, 100, 500]
    }
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
          { `${rateList[i]} ( ↑${deltaList[i]} )` }
        </span>
      )
    })

    return (
      <div className="rank-panel">
        <Panel collapsible expanded={this.props.filterShow}>
          { checkbox }
        </Panel>
        <Alert bsStyle='danger'
               className={isUpdated ? 'hidden' : 'show'}>
          { __('It will save when all rates is updated') }
        </Alert>
        <div className="list-container" style={getStatusStyle(cover)} >
          <div className="list">
            <span className="title">{ __('Ranking') }</span>
            { rankDom }
          </div>
          <div className="list">
            <span className="title">{ __('Rate') }</span>
            { rateDom }
          </div>
        </div>
      </div>
    )
  }
})
