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
  ], ({ rankDetail }, timerDetail, { filterShow }) =>
    ({ rankDetail, timerDetail, filterShow })),
  { activeRankChange, showRankFilter }
)(class RankPanel extends Component {
  constructor(props) {
    super(props)
  }
  onClickCheckbox = (index) => {
    const detail = this.props.rankDetail
    detail[index].active = !detail[index].active
    this.props.activeRankChange(detail)
  }
  onFilterClose = (e) => {
    this.props.showRankFilter()
  }
  render() {
    const { rankDetail, timerDetail } = this.props
    const { updatedList, isUpdated } = timerDetail

    const { onClickCheckbox } = this
    const cover = includes(updatedList, true)
    let checkbox = []
    let rankDom = []
    let rateDom = []
    forEach(rankDetail, (data, i) => {
      checkbox.push(
        <Checkbox key={i}
                  onChange={onClickCheckbox.bind(this, i)}
                  checked={data.active}>
          { i }
        </Checkbox>
      )
      if (!data.active) {
        return
      }
      rankDom.push(<span key={i}>{ i }</span>)
      rateDom.push(
        <span key={i} style={getStatusStyle(updatedList[i])}>
          { `${data.rate} ( ↑${data.delta} )` }
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
