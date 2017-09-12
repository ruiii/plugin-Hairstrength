import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { Button, FormGroup, FormControl, ControlLabel, Panel, Checkbox } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { expSelector, customSelector, updatedRateSelector, customShowSelector, eoRateSelector } from '../redux/selectors'
import { __, estimateSenka, getStatusStyle } from './utils'
import { customChange, showCustom } from '../redux/actions'

export default connect(
  createSelector([
    expSelector,
    customSelector,
    updatedRateSelector,
    customShowSelector,
    eoRateSelector,
  ], ({ exp }, { custom }, { updatedRate }, { customShow }, { eoRate }) =>
    ({ exp, custom, updatedRate, customShow, eoRate })),
  { customChange, showCustom }
)(class RatePanel extends Component{
  constructor(props) {
    super(props)
    this.state = {
      customShow: false,
      _customExp: '',
      _customRate: '',
      _enable: false,
      _auto: false,
      btnDisable: true,
    }
  }
  componentWillMount() {
    this.setState({
      _enable: this.props.custom.enable,
      _auto: this.props.custom.auto,
    })
  }
  onUseCurrentExp = (e) => {
    this.check({
      _customExp: this.props.exp,
    })
  }
  onUseUpdatedRate = (e) => {
    this.check({
      _customRate: parseFloat(this.props.updatedRate.toFixed(1)),
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
      _customExp: customExp,
    })
  }
  onRateChange = (e) => {
    let customRate = parseInt(e.target.value)
    if (customRate <= 0) {
      customRate = 0
    }
    this.check({
      _customRate: customRate,
    })
  }
  check(newState) {
    const _state = {
      ...this.state,
      ...newState,
    }

    if (_state._auto) {
      this.setState({
        ...newState,
        btnDisable: false,
      })
      return
    }

    const { baseExp, baseRate, enable } = this.props.custom
    const { _customExp, _customRate, _enable } = _state
    if (_enable && !_customRate) {
      this.setState({
        ...newState,
        btnDisable: true,
      })
    } else {
      this.setState({
        ...newState,
        btnDisable: (
          !!_customExp
          && baseExp === _customExp
          && enable === _enable
          && baseRate === _customRate
        ),
      })
    }
  }
  onEnableRate = (e) => {
    this.check({
      _enable: e.target.checked,
    })
  }
  onEnableAuto = (e) => {
    this.check({
      _auto: e.target.checked,
    })
  }
  onCustomChange = (e) => {
    const { _customExp, _customRate, _enable, _auto } = this.state
    this.props.customChange({
      baseExp: _customExp,
      baseRate: _customRate,
      enable: _enable,
      auto: _auto,
    })
    this.setState({
      btnDisable: true,
    })
  }
  onCustomClose = (e) => {
    this.props.showCustom()
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.customShow != this.props.customShow && nextProps.customShow) {
      this.setState({
        _customExp: nextProps.custom.baseExp,
        _customRate: nextProps.custom.baseRate,
        _enable: nextProps.custom.enable,
        _auto : nextProps.custom.auto,
        btnDisable: true,
      })
    }
  }
  render() {
    const { exp, custom, customShow, eoRate } = this.props
    const { baseExp, baseRate, enable, auto } = custom
    const { _customExp, _customRate, _enable, _auto, btnDisable } = this.state
    const rate = estimateSenka(exp, baseExp) + eoRate.new

    return (
      <div className="rate-block">
        <Button onClick={this.props.showCustom}>
          <FontAwesome className="setting-icon" key={0} name='gear' />
        </Button>
        <Panel collapsible expanded={customShow}>
          <div style={getStatusStyle(!_auto)}>
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
          </div>
          <Checkbox onChange={this.onEnableAuto}
                    checked={_auto}>
            {__('Auto-set the base value')}
          </Checkbox>
          <p className={_auto ? 'show' : 'hidden'} style={{color: 'red', fontSize: 12}}>
            {__('Auto-set tips')}
          </p>
          <div className="rate-btns">
            <Button onClick={this.onCustomChange}
                    disabled={btnDisable}>{ __('OK') }</Button>
            <Button onClick={this.onCustomClose}>
              <FontAwesome className="setting-icon" key={0} name='close' />
            </Button>
          </div>
        </Panel>
        {
          !isNaN(exp)
          ? (
            <div className="rate-calc">
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
                  <span> {baseRate}　->　{(enable || auto) ?  (rate + baseRate).toFixed(1) : rate.toFixed(1)} </span>
                  { (enable || auto) ? <span>( ↑ {rate.toFixed(1)} )</span> : '' }
                </div>
              </div>
            </div>
          )
          : undefined
        }
      </div>
    )
  }
})
