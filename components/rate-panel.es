import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { estimateSenka } from './utils'
export default connect(
  state => ({ exp: state.info.basic.api_experience })
)(class RatePanel extends Component{
  constructor(props) {
    super(props)
    this.state = {
      rate: 0
    }
  }
  componentDidMount() {
    this.props.startListen()
  }
  componentWillUnmount() {
    this.props.stopListen()
  }
  render() {
    const { exp, baseSenka, baseExp} = this.props
    const senka = @props.estimateSenka exp

    return (
      <div className='exp-listener'>
        <span>{__ 'Experience'}</span>
        <span>{baseExp}　->　{exp}</span>
        <span>( ↑ {exp - baseExp} )</span>
        <span>{__ 'Rate'}</span>
        <span>{baseSenka}　->　{senka}</span>
        <span>( ↑ {(senka - baseSenka).toFixed(1)} )</span>
      </div>
    )
  }
})
