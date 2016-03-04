{React, ReactBootstrap} = window
__ = window.i18n["poi-plugin-senka-calc"].__.bind(window.i18n["poi-plugin-senka-calc"])


timeToRefresh = (refreshTime) ->
  time = refreshTime - Date.now()

getCountdown = (type) ->
  timeToRefresh(type) / 1000

Countdown = React.createClass
  interval: null
  getInitialState: ->
    refreshCountdown: 0
    accountCountdown: 0
  componentDidMount: ->
    @interval = setInterval @updateCountdown, 1000
  componentWillUnmount: ->
    clearInterval @interval
  updateCountdown: ->
    {accountCountdown, refreshCountdown} = @state
    {accounted, timeUp, nextAccountTime, nextRefreshTime} = @props

    if !accounted
      accountCountdown = getCountdown nextAccountTime
      if accountCountdown < 0
        @props.accountTimeout()
        accountCountdown = 0

    if !timeUp
      refreshCountdown = getCountdown nextRefreshTime
      if refreshCountdown < 0
        @props.refreshTimeout()
        refreshCountdown = 0

    @setState
      accountCountdown: accountCountdown
      refreshCountdown: refreshCountdown
  render: ->
    <div className='table-container'
         style={if @props.isLastDay() then color: 'red' else color: 'inherit'}>
      {
        if !@props.accounted
          <div className='col-container'>
            <span>{@props.accountTimeString}</span>
            <span>{@props.timeToString @props.nextAccountTime}</span>
            <span>{__ 'Before account'}</span>
            <span>{window.resolveTime @state.accountCountdown}</span>
          </div>
        else
          <div className='col-container'>
            <span>{__ 'Accounted'}</span>
            <span>{'  '}</span>
            <span>{__ 'Presumed rate'}</span>
            <span>{@props.presumedSenka}</span>
          </div>
      }
      <div className='col-container'>
        <span>{@props.refreshTimeString}</span>
        <span>{@props.timeToString @props.nextRefreshTime}</span>
        <span>{__ "Before refresh"}</span>
        <span>{window.resolveTime @state.refreshCountdown}</span>
      </div>
    </div>
module.exports = Countdown
