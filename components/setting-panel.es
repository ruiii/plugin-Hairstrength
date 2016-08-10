import React, { Component, PropTypes } from 'react'
import FontAwesome from 'react-fontawesome'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { connect } from 'react-redux'
import { showCustom, showRankFilter, showHistory } from '../redux/actions'

const { i18n } = window
const __ = i18n["poi-plugin-senka-calc"].__.bind(i18n["poi-plugin-senka-calc"])

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
      <div>
        <DropdownButton title={
          <FontAwesome key={0} name='gear' />
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
