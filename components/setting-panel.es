import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { connect } from 'react-redux'
import { includes } from 'lodash'
import { settingSelector } from '../redux/selectors'
import { showCustom, showRankFilter, showHistory } from '../redux/actions'
import { __ } from './utils'

export default connect(
  settingSelector,
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
    const disabled = includes(this.props.setting, true)
    return (
      <div className="setting-panel">
        <DropdownButton title={
          <FontAwesome className="setting-icon" key={0} name='gear' />
        } id="bg-nested-dropdown" disabled={disabled}>
          <MenuItem onSelect={this.onCustomShow} eventKey="1">
            { __('Custom calc') }
          </MenuItem>
          <MenuItem onSelect={this.onShowFilter} eventKey="2">
            { __('Setting') }
          </MenuItem>
          <MenuItem onSelect={this.onShowHistory} eventKey="3">
            { __('History') }
          </MenuItem>
        </DropdownButton>
      </div>
    )
  }
})
