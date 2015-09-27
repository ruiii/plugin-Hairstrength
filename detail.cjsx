{React, ReactBootstrap, FontAwesome} = window
{OverlayTrigger, Tooltip, Table} = ReactBootstrap
i18n = require './node_modules/i18n'
{__} = i18n

timeToString = (time) ->
  if time isnt null
    date = new Date(time)

    "#{date.getMonth()+1}-#{date.getDate()} #{date.getHours()}:00"

DataItem = React.createClass
  render: ->
    <tr>
      {
        for item, index in @props.data
          if index is 0
            <td key={index}>{timeToString item}</td>
          else
            if index is @props.data.length - 1
              item = "↑#{item}"
            <td key={index}>{item}</td>
      }
    </tr>

Detail = React.createClass
  render: ->
    # updateTime, ranking, rate, exp
    {data, nickname, accounted, baseDetail, timeToString} = @props
    <div className='main-container'>
      <h4 className='admiral-name'>{__('Admiral　%s　', nickname)}</h4>
      <OverlayTrigger trigger='click' placement='bottom' overlay={
        <Tooltip>
          <Table striped bordered condensed hover Responsive>
            <thead>
              <tr>
                <th>{__ 'Time'}</th>
                <th>{__ 'Ranking'}</th>
                <th>{__ 'Rate'}</th>
                <th>Rate Delta</th>
              </tr>
            </thead>
            <tbody>
              {
                for detail, index in data
                  _detail = []
                  for n,idx in detail
                    _detail[idx] = n                 
                  if index is 0
                    _detail[3] = detail[2]
                  else
                    _detail[3] = detail[2] - data[index - 1][2]
                  <DataItem key={index} data={_detail} />
              }
            </tbody>
          </Table>
        </Tooltip>
      }>
        <h5 className='detail-time'>
          {__('By:　%s　', timeToString(data[0][0]))}
          <OverlayTrigger placement='top' overlay={
            <Tooltip>
              <span>点击查看本月战绩</span>
            </Tooltip>
          }>
            <FontAwesome key={0} name='book' />
          </OverlayTrigger>
        </h5>
      </OverlayTrigger>
    </div>

module.exports = Detail
