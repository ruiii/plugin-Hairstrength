{React} = window
i18n = require './node_modules/i18n'
{__} = i18n

ExpListener = React.createClass
  getInitialState: ->
    senka: 0
    exp: 0
  componentDidMount: ->
    window.addEventListener 'exp.change', @handleResponse
  componentWillUnmount: ->
    window.removeEventListener 'exp.change', @handleResponse
  componentWillReceiveProps: (nextProps) ->
    if nextProps.accounted is true and nextProps.accounted isnt @props.accounted
      @props.setPresumedSenka @state.senka
    if @state.exp is 0 and nextProps.exp isnt 0
      @setState
        exp: nextProps.exp
  componentWillUpdate: (nextProps, nextState) ->
    {senka} = @state
    if nextState.exp? and nextState.exp isnt 0
      #senkaDelta = Math.floor((nextState.exp - baseDetail.exp) / 1428)
      #A guess of Katokawa's method: Senka = Math.floor((Exp - absOffset)/1428)
      senkaDelta = ((nextState.exp - nextProps.data[data.length - 1][3]) / 1428)
      if (senkaDelta + nextProps.data[data.length - 1][2] - senka) > 0.1
        @setState
          senka: parseFloat((senkaDelta + nextProps.nextProps.data[data.length - 1][2] - 0.05).toFixed(1))
  handleResponse: (e) ->
    if !@props.timeUp
      {path, body} = e.detail
      switch path
        when '/kcsapi/api_req_mission/result'
          @setState
            exp: body.api_member_exp
        when '/kcsapi/api_req_practice/battle_result'
          @setState
            exp: body.api_member_exp
        when '/kcsapi/api_req_sortie/battleresult'
          @setState
            exp: body.api_member_exp
        when '/kcsapi/api_req_combined_battle/battleresult'
          @setState
            exp: body.api_member_exp
  render: ->
    <div className='table-container'>
      <div>
        <div className='col-container'>
          <span>{__ 'Experience'}</span>
          <span>{@props.data[@props.data.length - 1][3]}　->　{@state.exp}</span>
        </div>
        <div className='col-container'>
          <span>( {__ 'Increment'}</span>
          <span>{@state.exp - @props.data[@props.data.length - 1][3]} )</span>
        </div>
      </div>
      <div>
        <div className='col-container'>
          <span>{__ 'Rate'}</span>
          <span>{@props.data[@props.data.length - 1][2]}　->　{@state.senka}</span>
        </div>
        <div className='col-container'>
          <span>( {__ 'Increment'}</span>
          <span>{(@state.senka - @props.data[@props.data.length - 1][2]).toFixed(1)} )</span>
        </div>
      </div>
    </div>

module.exports = ExpListener
