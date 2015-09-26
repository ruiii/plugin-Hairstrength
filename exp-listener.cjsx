{React} = window
i18n = require './node_modules/i18n'
{__} = i18n

ExpListener = React.createClass
  getInitialState: ->
    senka: '0.0'
    exp: 0
    exRate: [0, 0]
  componentDidMount: ->
    window.addEventListener 'game.response', @handleResponse
  componentWillUnmount: ->
    window.removeEventListener 'game.response', @handleResponse
  componentWillReceiveProps: (nextProps) ->
    if nextProps.accounted is true and nextProps.accounted isnt @props.accounted
      @props.setPresumedSenka @state.senka
      @state.exRate[1] = @state.exRate[0]
      @state.exRate[0] = 0
    if @state.exp is 0 and nextProps.exp isnt 0
      @setState
        exp: nextProps.exp
    if nextProps.timeUp is false and @props.timeUp is true
      @state.exRate[1] = 0
  componentWillUpdate: (nextProps, nextState) ->
    {exRate, senka} = @state
    if nextProps.baseDetail.adjustedExp? and nextProps.baseDetail.adjustedExp isnt 0  #judge if initialled
      #senkaDelta = Math.floor((nextState.exp - baseDetail.exp) / 1428)
      #A guess of Katokawa's method: Senka = Math.floor((Exp - absOffset)/1428)
      senkaDelta = ((nextState.exp - nextProps.baseDetail.adjustedExp) / 1428)
      if (senkaDelta + nextProps.data[nextProps.data.length - 1][2] + exRate[0] + exRate[1] - senka) > 0.1
        @setState
          senka: (senkaDelta + nextProps.data[nextProps.data.length - 1][2] + exRate[0] + exRate[1] - 0.05).toFixed(1)
  handleResponse: (e) ->
    if !@props.timeUp
      {path, body} = e.detail
      {exp, exRate} = @state
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
    {baseSenka, data} = @props
    {senka, exp} = @state
    baseExp = data[data.length - 1][3]
    <div className='exp-listener'>
      <span>{__ 'Experience'}</span>
      <span>{baseExp}　->　{exp}</span>
      <span>( ↑ {exp - baseExp} )</span>
      <span>{__ 'Rate'}</span>
      <span>{baseSenka}　->　{senka}</span>
      <span>( ↑ {(senka - baseSenka).toFixed(1)} )</span>
    </div>

module.exports = ExpListener
