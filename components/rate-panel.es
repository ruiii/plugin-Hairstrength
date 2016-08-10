import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Button, FormControl, Panel, Checkbox } from 'react-bootstrap'
import { expSelector, customSelector, updatedRateSelector } from '../redux/selectors'
import { estimateSenka } from './utils'
import { customChange } from '../redux/actions'

const { i18n } = window
const __ = i18n["poi-plugin-senka-calc"].__.bind(i18n["poi-plugin-senka-calc"])

export default connect(
  createSelector([
    expSelector,
    customSelector,
    updatedRateSelector
  ], ({ exp }, { custom }, { updatedRate }) =>
    ({ exp, custom, updatedRate })),
  { customChange }
)(class RatePanel extends Component{
  constructor(props) {
    super(props)
    this.state = {
      customShow: false,
      _customExp: '',
      _customRate: '',
      _enable: false,
      btnDisable: true
    }
  }
  componentWillMount() {
    this.setState({
      _enable: this.props.custom.enable,
    })
  }
  onUseCurrentExp = (e) => {
    this.check({
      _customExp: this.props.exp
    })
  }
  onUseUpdatedRate = (e) => {
    this.check({
      _customRate: this.props.updatedRate
    })
  }
  onExpChange = (e) => {
    let customExp = parseInt(e.target.value)
    const exp = this.props.exp
    if (exp < customExp) {
      customExp = exp
    } else if (customExp <= 0) {
      customExp = 0
    }
    this.check({
      _customExp: customExp
    })
  }
  onRateChange = (e) => {
    let customRate = parseInt(e.target.value)
    if (customRate <= 0) {
      customRate = 0
    }
    this.check({
      _customRate: customRate
    })
  }
  check(newState) {
    const { baseExp, baseRate, enable } = this.props.custom
    const _state = {
      ...this.state,
      ...newState
    }
    const { _customExp, _customRate, _enable } = _state
    if (_enable && !_customRate) {
      this.setState({
        ...newState,
        btnDisable: true
      })
    } else {
      this.setState({
        ...newState,
        btnDisable: (
          !!_customExp
          && baseExp === _customExp
          && enable === _enable
          && baseRate === _customRate
        )
      })
    }
  }
  onEnableRate = (e) => {
    this.check({
      _enable: e.target.checked
    })
  }
  onCustomShow = (e) => {
    this.setState({
      customShow: !this.state.customShow,
      _customExp: this.props.custom.baseExp,
      _customRate: this.props.custom.baseRate,
      _enable: this.props.custom.enable,
      btnDisable: true
    })
  }
  onCustomChange = (e) => {
    const { _customExp, _customRate, _enable } = this.state
    this.props.customChange({
      baseExp: _customExp,
      baseRate: _customRate,
      enable: _enable
    })
    this.setState({
      btnDisable: true
    })
  }
  render() {
    const { exp, custom } = this.props
    const {
      baseExp,
      baseRate,
      enable
    } = custom
    const {
      customShow,
      _customExp,
      _customRate,
      _enable,
      btnDisable
    } = this.state
    const rate = estimateSenka(exp, baseExp)

    return (
      <div className='exp-listener'>
        <Button onClick={this.onCustomShow}>{ __('Custom') }</Button>
        <Panel collapsible expanded={customShow}>
          <div>
            <FormControl type='number'
                         label={ __('Base Exp') }
                         placeholder="exp"
                         value={_customExp}
                         ref='customExp'
                         onChange={this.onExpChange} />
            <Button onClick={this.onUseCurrentExp}>
              { __('Use current exp') }
            </Button>
          </div>
          <div>
            <Button onClick={this.onUseUpdatedRate}>
              { __('Use updated rate') }
            </Button>
            <Checkbox onChange={this.onEnableRate}
                      checked={_enable}/>
            <FormControl type='number'
                         label={ __('Base Rate') }
                         placeholder="rate"
                         value={_customRate}
                         ref='customRate'
                         disabled={!_enable}
                         onChange={this.onRateChange} />
          </div>
          <Button onClick={this.onCustomChange}
                  disabled={btnDisable}>{ __('OK') }</Button>
        </Panel>
        <span>{__('Experience')}</span>
        <span>{baseExp}　->　{exp}</span>
        <span>( ↑ {exp - baseExp} )</span>
        <span>{__('Rate')}</span>
        <span>{rate.toFixed(1)} {baseRate} {
          enable ?  (rate + baseRate).toFixed(1) : rate.toFixed(1)
        }</span>
      </div>
    )
  }
})
