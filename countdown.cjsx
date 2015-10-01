{React, ReactBootstrap} = window
i18n = require './node_modules/i18n'
{__} = i18n



accountTimeString = [
  __('Account time'),
  'Normal map',
  'Extra Operation map'
]


getFinalTime = (type)-> #get Final AccountTime EO for EO 
  finalDate = new Date()
  finalDate.setUTCHours(finalDate.getUTCHours() + 9)    #mapping Tokyo(00:00) to UTC(00:00)
  finalDate.setUTCMonth(finalDate.getUTCMonth() + 1)
  finalDate.setUTCDate(0)
  if type is 'EO'
    finalDate.setUTCHours(15)
   else
    finalDate.setUTCHours(13)
  finalDate.setUTCMinutes(0)
  finalDate.setUTCSeconds(0)
  finalDate.setUTCMilliseconds(0)

  finalDate.getTime()

isLastDay = ->
  return getFinalTime('EO') - Date.now() < 24 * 3600 * 1000

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
  date.setUTCMilliseconds(0)
  
  date.getTime()

timeToRefresh = (refreshTime) ->
  time = refreshTime - Date.now()

getCountdown = (type) ->
  timeToRefresh(type) / 1000

Countdown = React.createClass
  getInitialState: ->
    accountStage: 0 # 0 for normal 1 for final normal map 2 for final eo 
    nextAccountTime: [getRefreshTime('account'), getFinalTime(), getFinalTime('EO')] 
    nextRefreshTime: getRefreshTime('next')
    refreshCountdown: 0
    accountCountdown: 0
  componentDidMount: ->
    setInterval @updateCountdown, 1000
  componentWillUnmount: ->
    clearInterval @updateCountdown, 1000
  componentWillReceiveProps: (nextProps) ->
      if @props.timeUp and !nextProps.timeUp
        @setState          
          nextRefreshTime: getRefreshTime('next')
          nextAccountTime: [getRefreshTime('account'), getFinalTime(), getFinalTime('EO')] 
  updateCountdown: ->
    if !@props.timeUp
      if getCountdown(@state.nextRefreshTime) >= 1
        {finalNormalTime, finalEOTime, nextAccountTime, nextRefreshTime, refreshCountdown, accountCountdown} = @state
        refreshCountdown = getCountdown(nextRefreshTime)

        #some logic to determine account Stage
        if @props.eoAccounted
          accountStage = 2
          accountCountdown = 0
        else if getCountdown(nextAccountTime[2]) <= 0
          accountStage = 2
          accountCountdown = 0
          @props.isEOAccounted()
        else if getCountdown(nextAccountTime[1]) <= 0
          accountStage = 2
          accountCountdown = getCountdown(nextAccountTime[2])
          if !@props.accounted
            @props.isAccounted()
        else if getCountdown(nextAccountTime[1]) <= 8 * 3600
          accountStage = 1
          accountCountdown = getCountdown(nextAccountTime[1])
        else
          accountStage = 0
          if getCountdown(nextAccountTime[0]) <= 0 and !@props.accounted
            @props.isAccounted()
            accountCountdown = 0
          else if @props.accounted
            accountCountdown = 0
          else
            accountCountdown = getCountdown(nextAccountTime[0])

        @setState
          refreshCountdown: refreshCountdown
          accountCountdown: accountCountdown
          accountStage: accountStage
      else if getCountdown(@state.nextRefreshTime) <= 0
        refreshCountdown = 0
        @props.isTimeUp()    
        @setState
          refreshCountdown: refreshCountdown
          #nextRefreshTime: getRefreshTime('next')
          #nextAccountTime: [getRefreshTime('account'), getFinalTime(), getFinalTime('EO')] 
  render: ->

    <div className='table-container'
         style={if isLastDay() then color: 'red' else color: 'inherit'}>
      <div className='col-container'>
        <span>{accountTimeString[@state.accountStage]}</span>
        <span>{@props.timeToString @state.nextAccountTime[@state.accountStage]}</span>
        <span>{__ 'Before account'}</span>
        <span>{window.resolveTime @state.accountCountdown}</span>
      </div>
      <div className='col-container'>
        <span>{__ "Refresh time"}</span>
        <span>{@props.timeToString @state.nextRefreshTime}</span>
        <span>{__ "Before refresh"}</span>
        <span>{window.resolveTime @state.refreshCountdown}</span>
      </div>
    </div>
module.exports = Countdown
