import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Button, Checkbox, Alert, Panel } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { forEach, includes } from 'lodash'
import { __, getStatusStyle } from './utils'
import { activeRankChange, showRankFilter } from '../redux/actions'
import { rankDetailSelector, updateTimerDetailSelector, filterShowSelector } from '../redux/selectors'

export default connect(
  createSelector([
    rankDetailSelector,
    updateTimerDetailSelector,
    filterShowSelector,
  ], (rankDetail, timerDetail, { filterShow }) =>
    ({ rankDetail, timerDetail, filterShow })),
  { activeRankChange, showRankFilter }
)(class RankPanel extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ranks: [1, 5, 20, 100, 500],
    }
  }
  onClickCheckbox = (index) => {
    const activeRank = this.props.rankDetail.activeRank
    activeRank[index] = !activeRank[index]
    this.props.activeRankChange(activeRank)
  }
  onFilterClose = (e) => {
    this.props.showRankFilter()
  }
  render() {
    const { activeRank, rateList, deltaList } = this.props.rankDetail
    const { updatedList, isUpdated } = this.props.timerDetail

    const { onClickCheckbox } = this
    const { ranks } = this.state
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
          <Button onClick={this.onFilterClose}>
            <FontAwesome className="setting-icon" key={0} name='close' />
          </Button>
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
