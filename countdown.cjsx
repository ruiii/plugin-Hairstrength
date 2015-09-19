{React, ReactBootstrap} = window
i18n = require './node_modules/i18n'
{__} = i18n

isLastDay = ->
  lastDay = false
  today = new Date()
  today.setUTCHours(today.getUTCHours()+9)    #mapping Tokyo(00:00) to UTC(00:00)
  tomorrow = new Date(today)
  tomorrow.setUTCDate(today.getUTCDate()+1)
  if today.getUTCMonth() isnt tomorrow.getUTCMonth()
    lastDay = true
  lastDay

getRefreshTime = (type) ->
  date = new Date()
  hour = date.getUTCHours()
  if type is 'next'
    offset = 12
  else if type is 'account'
    offset = 12 - 1
  else
    offset = 0
  if hour < 6
    freshHour = -6    #UTC lastDay's 18:00(Tokyo today's 3:00)
  else if hour < 18
    freshHour = 6
  else
    freshHour = 18
  date.setUTCHours(freshHour + offset)
  date.setUTCMinutes(0)
  date.setUTCSeconds(0)

  date.getTime()

timeToRefresh = (type) ->
  anHour = 60 * 60 * 1000
  date = new Date()
  if type is 'refresh'
    offset = 0
  else
    offset = -1
  if isLastDay() and (date.getUTCHours() + 9) in [15..21]
    ten = (22 - 9) * anHour
    time = 24 * anHour - (Date.now() - ten) % (24 * anHour)
  else
    three = anHour * (9 - 3 + offset)
    time = 12 * anHour - ((Date.now() - three) % (12 * anHour))

  time

getCountdown = (type) ->
  timeToRefresh(type) / 1000

Countdown = React.createClass
  getInitialState: ->
    nextAccountTime: 0
    nextRefreshTime: 0
    refreshCountdown: 0
    accountCountdown: 0
  componentDidMount: ->
    setInterval @updateCountdown, 1000
  componentWillUnmount: ->
    clearInterval @updateCountdown, 1000
  updateCountdown: ->
    if !@props.timeUp
      if getCountdown('refresh') >= 1
        {refreshCountdown, accountCountdown} = @state
        refreshCountdown = getCountdown('refresh')
        if getCountdown('') <= 1
          @props.isAccounted()
        if @props.accounted
          accountCountdown = 0
        else
          accountCountdown = getCountdown('')
        @setState
          refreshCountdown: refreshCountdown
          accountCountdown: accountCountdown
      else if getCountdown('refresh') <= 1
        refreshCountdown = 0
        @props.isTimeUp()
        @setState
          refreshCountdown: refreshCountdown
  render: ->
    <div className='table-container'
         style={if isLastDay() then color: 'red' else color: 'inherit'}>
      <div className='col-container'>
        <span>{__ 'Account time'}</span>
        <span>{@state.nextAccountTime}</span>
        <span>{__ 'Before account'}</span>
        <span>{window.resolveTime @state.accountCountdown}</span>
      </div>
      <div className='col-container'>
        <span>{__ "Refresh time"}</span>
        <span>{@state.nextRefreshTime}</span>
        <span>{__ "Before refresh"}</span>
        <span>{window.resolveTime @state.refreshCountdown}</span>
      </div>
    </div>
module.exports = Countdown
