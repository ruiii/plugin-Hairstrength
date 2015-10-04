{React, ReactBootstrap, FontAwesome} = window
{OverlayTrigger, Tooltip, Table, TabbedArea, TabPane} = ReactBootstrap
i18n = require './node_modules/i18n'
{__} = i18n

dateToString = (time) ->
  if time isnt null
    date = new Date(time)

    "#{date.getMonth()+1}-#{date.getDate()}"

DataItem = React.createClass
  render: ->
    <tr>
      {
        for item, index in @props.data
          if index is 0
            <td style={padding: 2} key={index}>{dateToString item}</td>
          else
            if index is @props.data.length - 1
              item = "↑#{item}"
            <td style={padding: 2} key={index}>{item}</td>
      }
    </tr>

DataTable = React.createClass
  render: ->
    <Table striped bordered condensed hover Responsive>
      <thead>
        <tr>
          <th>{__ 'Time'}</th>
          <th>{__ 'Ranking'}</th>
          <th>{__ 'Rate'}</th>
          <th>Delta</th>
        </tr>
      </thead>
      <tbody>
        {
          for detail, index in @props.data
            continue if (new Date(detail[0])).getUTCHours() is 18
            _detail = []
            for n, idx in detail
              _detail[idx] = n
            if index is 0
              _detail[3] = detail[2]
            else
              _detail[3] = detail[2] - @props.data[index - 2][2]
            <DataItem key={index} data={_detail} />
        }
      </tbody>
    </Table>

Detail = React.createClass
  getInitialState: ->
    selectedKey: 0
  handleSelectTab: (selectedKey) ->
    @setState
      selectedKey: selectedKey
  render: ->
    # updateTime, ranking, rate, exp
    {data, nickname, accounted, baseDetail, timeToString} = @props
    partOne = []
    partTwo = []
    partThree = []
    if data.length > 41
      partOne = data.slice 0, 20
      partTwo = data.slice 21, 40
      partThree = data.slice 41, data.length - 1
    else if data.length >= 21
      partOne = data.slice 0, 20
      partTwo = data.slice 21, data.length - 1
    else
      partOne = data.slice 0, data.length - 1
    <div className='main-container'>
      <h4 className='admiral-name'>{__('Admiral　%s　', nickname)}</h4>
      <OverlayTrigger trigger='click' placement='bottom' overlay={
        <Tooltip>
          <TabbedArea activeKey={@state.selectedKey} onSelect={@handleSelectTab} animation={false}>
            <TabPane eventKey={1} tab='1-10'>
              <DataTable data={partOne} />
            </TabPane>
            {
              if partTwo.length > 0
                <TabPane eventKey={2} tab='10-20'>
                  <DataTable data={partTwo} />
                </TabPane>
            }
            {
              if partThree.length > 0
                <TabPane eventKey={3} tab='20-'>
                  <DataTable data={partThree} />
                </TabPane>
            }
          </TabbedArea>
        </Tooltip>
      }>
        <h5 className='detail-time'>
          {__('By:　%s　', timeToString(data[data.length - 1][0]))}
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
