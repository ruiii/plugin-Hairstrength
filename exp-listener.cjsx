{React} = window
i18n = require './node_modules/i18n'
{__} = i18n

ExpListener = React.createClass
  getInitialState: ->
    senka: '0.0'
    exp: 0
    exRate: 0
  componentDidMount: ->
    window.addEventListener 'game.response', @handleResponse
  componentWillUnmount: ->
    window.removeEventListener 'game.response', @handleResponse
  componentWillReceiveProps: (nextProps) ->
    if nextProps.accounted is true and nextProps.accounted isnt @props.accounted
      @props.setPresumedSenka @state.senka
    if @state.exp is 0 and nextProps.exp isnt 0
      @setState
        exp: nextProps.exp
    if @props.eoAccounted and !nextProps.eoAccounted
      @setState
        exRate: 0
        senka: '0.0'
  componentWillUpdate: (nextProps, nextState) ->
    {exRate, senka} = @state
    if nextProps.baseDetail.adjustedExp? and nextProps.baseDetail.adjustedExp isnt 0  #judge if initialled
      #senkaDelta = Math.floor((nextState.exp - baseDetail.exp) / 1428)
      #A guess of Katokawa's method: Senka = Math.floor((Exp - absOffset)/1428)
      senkaDelta = ((nextState.exp - nextProps.baseDetail.adjustedExp) / 1428)
      if (senkaDelta + nextProps.data[nextProps.data.length - 1][2] + exRate - senka) > 0.1 or (senkaDelta + nextProps.data[nextProps.data.length - 1][2] + exRate - senka) < 0
        @setState
          senka: (senkaDelta + nextProps.data[nextProps.data.length - 1][2] + exRate - 0.0499).toFixed(1)
  handleResponse: (e) ->
    if !@props.accounted
      {path, body} = e.detail
      {exp} = @state
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
    else if !@props.eoAccounted #listen before EOACCOUNTED
      {path, body} = e.detail
      {exRate} = @state
      switch path
        when '/kcsapi/api_req_sortie/battleresult'
          if body.api_get_exmap_rate? and body.api_get_exmap_rate isnt 0
            exRate += parseInt body.api_get_exmap_rate
            @setState {exRate}
        when '/kcsapi/api_req_map/next'
          if body.api_get_eo_rate?
            exRate += parseInt body.api_get_eo_rate
            @setState {exRate}
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
