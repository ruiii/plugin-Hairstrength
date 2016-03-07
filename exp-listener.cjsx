{React} = window
__ = window.i18n["poi-plugin-senka-calc"].__.bind(window.i18n["poi-plugin-senka-calc"])

ExpListener = React.createClass
  getInitialState: ->
    exp: @props.exp
    senka: '0.0'
  componentDidMount: ->
    window.addEventListener 'game.response', @handleResponse
  componentWillUnmount: ->
    window.removeEventListener 'game.response', @handleResponse
  componentWillReceiveProps: (nextProps) ->
    if @state.exp is 0 and nextProps.exp isnt 0
      @setState
        exp: nextProps.exp

    if (!@props.accounted and nextProps.accounted) or (!@props.expAccounted and nextProps.expAccounted)
      @props.setPresumedExp @state.exp

  handleResponse: (e) ->
    #listen before Exp Accounted
    if !@props.expAccounted
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
    #listen before EOACCOUNTED
    if !@props.eoAccounted
      {path, body} = e.detail
      switch path
        when '/kcsapi/api_req_sortie/battleresult'
          if body.api_get_exmap_rate? and body.api_get_exmap_rate isnt 0
            @props.addExRate parseInt body.api_get_exmap_rate
        when '/kcsapi/api_req_map/next'
          if body.api_get_eo_rate?
            @props.addExRate parseInt body.api_get_eo_rate
  render: ->
    {baseSenka, baseExp} = @props
    {exp} = @state
    senka = @props.estimateSenka exp
    <div className='exp-listener'>
      <span>{__ 'Experience'}</span>
      <span>{baseExp}　->　{exp}</span>
      <span>( ↑ {exp - baseExp} )</span>
      <span>{__ 'Rate'}</span>
      <span>{baseSenka}　->　{senka}</span>
      <span>( ↑ {(senka - baseSenka).toFixed(1)} )</span>
    </div>

module.exports = ExpListener
