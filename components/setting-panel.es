import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { connect } from 'react-redux'
import { showCustom, showRankFilter, showHistory } from '../redux/actions'
import { __ } from './utils'

export default connect(
  (state) => ({}),
  { showCustom, showRankFilter, showHistory }
)(class SettingPanel extends Component {
  onCustomShow = (e) => {
    this.props.showCustom()
  }
  onShowFilter = (e) => {
    this.props.showRankFilter()
  }
  onShowHistory = (e) => {
    this.props.showHistory()
  }
  render() {
    return (
      <div className="setting-panel">
        <DropdownButton title={
          <FontAwesome className="setting-icon" key={0} name='gear' />
        } id="bg-nested-dropdown">
          <MenuItem onSelect={this.onCustomShow} eventKey="1">
            { __('Custom calc') }
          </MenuItem>
          <MenuItem onSelect={this.onShowFilter} eventKey="2">
            { __('Rank list') }
          </MenuItem>
          <MenuItem onSelect={this.onShowHistory} eventKey="3">
            { __('History') }
          </MenuItem>
        </DropdownButton>
      </div>
    )
  }
})
