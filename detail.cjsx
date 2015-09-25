{React} = window
i18n = require './node_modules/i18n'
{__} = i18n

getpaneltaStyle = (delta) ->
  if delta < 0
    "↑#{Math.abs delta}"
  else if delta > 0
    "↓#{delta}"
  else
    '-'

Detail = React.createClass
  render: ->
    # updateTime, ranking, rate, exp
    {data, nickname, timeToString, accounted, baseDetail} = @props
    time = [0, 0]
    rate = [0, 0]
    ranking = [0, 0]
    rateDelta = [0, 0]
    time[0] = data[data.length - 1][0]
    time[1] = data[data.length - 2]?[0]
    ranking[0] = data[data.length - 1][1]
    ranking[1] = data[data.length - 2]?[1]
    rate[0] = data[data.length - 1][2]
    rate[1] = data[data.length - 2]?[2]
    rateDelta[0] = data[data.length - 2]?[2] - data[data.length - 1][2]
    rateDelta[1] = data[data.length - 3]?[2] - data[data.length - 2]?[2]
    updateTime = data[data.length - 1][0]
    if time[0] isnt null
      time[0] = timeToString time[0]
    if time[1] isnt null
      time[1] = timeToString time[1]
    if accounted
      text = __ 'Presumed rate'
      rate[0] = baseDetail.presumedSenka
      rate[1] = data[data.length - 1][2]
    else
      text = __ 'Rate'
      rate[0] = data[data.length - 1][2]
      if data[data.length - 2]?
        rate[1] = data[data.length - 2][2]
      else
        rate[0] = ''
    <div className='main-container'>
      <h4>{__('Admiral　%s　', nickname)}</h4>
      <h5>{__('By:　%s　', timeToString(updateTime))}</h5>
      <div className='row-container'>
        <div className='col-container'>
          <span>{__ 'Time'}</span>
          <span>{__ 'Rate'}</span>
          <span>{__ 'Ranking'}</span>
        </div>
        <div className='col-container'>
          <span>{time[1]}</span>
          <span>{rate[1]}</span>
          <span>{ranking[1]}</span>
        </div>
        <div className='col-container'>
          <span>{time[0]}</span>
          <span>{rate[0]}</span>
          <span>{ranking[0]}</span>
        </div>
      </div>
    </div>

module.exports = Detail
