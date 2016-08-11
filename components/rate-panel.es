import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Button, FormGroup, FormControl, ControlLabel, Panel, Checkbox } from 'react-bootstrap'
import { expSelector, customSelector, updatedRateSelector, customShowSelector } from '../redux/selectors'
import { __, estimateSenka, getStatusStyle } from './utils'
import { customChange } from '../redux/actions'

export default connect(
  createSelector([
    expSelector,
    customSelector,
    updatedRateSelector,
    customShowSelector
  ], ({ exp }, { custom }, { updatedRate }, { customShow }) =>
    ({ exp, custom, updatedRate, customShow })),
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
      _customRate: parseFloat(this.props.updatedRate.toFixed(1))
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
  componentWillReceiveProps(nextProps) {
    if (nextProps.customShow != this.props.customShow && nextProps.customShow) {
      this.setState({
        _customExp: nextProps.custom.baseExp,
        _customRate: nextProps.custom.baseRate,
        _enable: nextProps.custom.enable,
        btnDisable: true
      })
    }
  }
  render() {
    const { exp, custom, customShow } = this.props
    const {
      baseExp,
      baseRate,
      enable
    } = custom
    const {
      _customExp,
      _customRate,
      _enable,
      btnDisable
    } = this.state
    const rate = estimateSenka(exp, baseExp)

    return (
      <div className="rate-panel">
        <Panel collapsible expanded={customShow}>
          <FormGroup>
            <ControlLabel>{__('Base Exp')}</ControlLabel>
            <FormControl type='number'
                         placeholder="exp"
                         value={_customExp}
                         ref='customExp'
                         onChange={this.onExpChange} />
             <Button onClick={this.onUseCurrentExp}>
               { __('Use current exp') }
             </Button>
          </FormGroup>
          <Checkbox onChange={this.onEnableRate}
                    checked={_enable}>
            {__('Set rate')}
          </Checkbox>
          <FormGroup style={getStatusStyle(_enable)}>
            <ControlLabel>{__('Base Rate')}</ControlLabel>
            <FormControl type='number'
                         placeholder="rate"
                         value={_customRate}
                         ref='customRate'
                         disabled={!_enable}
                         onChange={this.onRateChange} />
             <Button onClick={this.onUseUpdatedRate}
                     disabled={!_enable}>
               { __('Use updated rate') }
             </Button>
          </FormGroup>
          <Button onClick={this.onCustomChange}
                  disabled={btnDisable}>{ __('OK') }</Button>
        </Panel>
        <div className={`rate-calc ${customShow ? 'on-custom' : ''}`}>
          <div className="rate-container">
            <span className="rate-part">{__('Experience')}</span>
            <div className="rate-part">
              <span>{baseExp}　->　{exp}</span>
              <span>( ↑ {exp - baseExp} )</span>
            </div>
          </div>
          <div className="rate-container">
            <span className="rate-part">{__('Rate')}</span>
            <div className="rate-part">
              <span> {baseRate} -> {enable ?  (rate + baseRate).toFixed(1) : rate.toFixed(1)} </span>
              { enable ? <span>( ↑ {rate.toFixed(1)} )</span> : '' }
            </div>
          </div>
        </div>
      </div>
    )
  }
})
