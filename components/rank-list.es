import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Input, Alert, Button } from 'react-bootstrap'
import { forEach } from 'lodash'
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
import { rankSelector } from '../redux/selectors'

export default connect(
  rankSelector,
  { activeRankChange }
)(class RankList extends Component{
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
    let activeRank = this.props.activeRank
    activeRank[index] = !activeRank[index]
    this.props.activeRankChange(activeRank)
  }
  render() {
    const { show, ranks } = this.state
    const {
      activeRank,
      updated,
      rankList,
      rateList,
      deltaList,
      updatedList
    } = this.props.rank
    const { onClickCheckbox } = this
    let checkbox = []
    let rankDom = []
    let rateDom = []
    forEach(activeRank, (active, i) => {
      checkbox.push(
        <Input type='checkbox'
               label={ranks[i]}
               key={i}
               onChange={onClickCheckbox.bind(this, i)}
               checked={active}/>
      )
      if (!active) {
        continue
      }
      rankDom.push(
        <span key={i}>{ rankList[i] }</span>
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
            <Divider text={__('Filter')} icon={true} hr={true} show={show}/>
          </div>
          <div style={{marginTop: '-15px'}}
               className={show ? 'show' : 'hidden'}>
             { checkbox }
          </div>
        </div>
        <div className='col-container'>
          <Alert bsStyle='danger'
                 className={updated ? 'hidden' : 'show'} >
            { __('It will save when all rates is updated') }
          </Alert>
          <div className='table-container'>
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
