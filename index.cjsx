{APPDATA_PATH, ROOT, React, ReactBootstrap, FontAwesome, error, JSON} = window
{Alert} = ReactBootstrap
fs = require 'fs-extra'
{relative, join} = require 'path-extra'
i18n = require './node_modules/i18n'
# i18n configure
i18n.configure({
    locales: ['en-US', 'ja-JP', 'zh-CN', 'zh-TW'],
    defaultLocale: 'zh-CN',
    directory: join(__dirname, 'assets', 'i18n'),
    updateFiles: false,
    indent: '\t',
    extension: '.json'
})
i18n.setLocale window.language
{__} = i18n

Detail = require './detail' #completed
RankList = require './rank-list'
ExpListener = require './exp-listener'
Countdown = require './countdown'

isLastDay = ->
  lastDay = false
  today = new Date()
  today.setUTCHours(today.getUTCHours()+9)    #mapping Tokyo(00:00) to UTC(00:00)
  tomorrow = new Date(today)
  tomorrow.setUTCDate(today.getUTCDate()+1)
  if today.getUTCMonth() isnt tomorrow.getUTCMonth()
    lastDay = true
  lastDay

isTrue = (item) ->
  item is true
isFalse = (item) ->
  item is false

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

timeToString = (time) ->
  if time isnt null
    date = new Date(time)

    "#{date.getFullYear()}-#{date.getMonth()+1}-#{date.getDate()} #{date.getHours()}:00"

getStatusStyle = (flag) ->
  if flag
    return {opacity: 0.4}
  else
    return {}

# updateTime, ranking, rate, exp
emptyData = [[null, 0, 0, 0]]

emptyDetail =
  isAccounted: false,
  presumedSenka: 0,
  rankListChecked: [true, true, true, true, true],
  senkaList: [0, 0, 0, 0, 0]

module.exports =
  name: 'Hairstrength'
  displayName: <span><FontAwesome key={0} name='child' />{__ 'Hairstrength'}</span>
  priority: 7
  author: 'Rui'
  link: 'https://github.com/ruiii'
  description: __ 'Senka calculator'
  version: '1.1.0'
  reactClass: React.createClass
    getInitialState: ->
      data: Object.clone emptyData
      baseDetail: Object.clone emptyDetail
      memberId: ''
      nickname: ''
      exp: 0
      timeUp: true
      accounted: false
      isUpdated: []
      ranks: [1, 5, 20, 100, 500]
    componentDidMount: ->
      window.addEventListener 'game.response', @handleResponse
    handleResponse: (e) ->
      {path, body} = e.detail
      switch path
        when '/kcsapi/api_get_member/basic'
          if @state.memberId isnt body.api_member_id
            @getDataFromFile body.api_member_id, body.api_experience
            @setState
              exp: body.api_experience
              nickname: body.api_nickname
            window.removeEventListener 'game.response', @handleResponse
    saveData: (baseDetail) ->
      try
        fs.writeJSONSync join(APPDATA_PATH, 'hairstrength', "#{@state.memberId}", 'detail.json'), baseDetail
      catch e
        error "Write senkaDetail error!#{e}"
    addData: (data) ->
      try
        fs.appendFileSync join(APPDATA_PATH, 'hairstrength', "#{@state.memberId}", 'data'), "#{data}\n", 'utf-8'
      catch e
        error "Write senkaData error!#{e}"
    getDataFromFile: (memberId, exp) ->
      {timeUp} = @state
      try
        fs.ensureDirSync join(APPDATA_PATH, 'hairstrength', memberId)
        baseDetail = fs.readJSONSync join(APPDATA_PATH, 'hairstrength', memberId, 'detail.json')
        data = fs.readFileSync join(APPDATA_PATH, 'hairstrength', memberId, 'data')
      catch e
        error "Read file form hairstrength error!#{e}"
      if !baseDetail?
        baseDetail = Object.clone emptyDetail
      if data?.length > 0
        data = data.split '\n'
        data = data.filter (item) ->
          item isnt ''
        timeUp = false
      else
        data = Object.clone emptyData
        timeUp = true
      @setState
        baseDetail: baseDetail
        memberId: parseInt memberId
        data: data
        timeUp: timeUp
    isAccounted: ->
      @saveData @state.baseDetail
      @setState
        accounted: !@state.accounted
    isTimeUp: ->
      {timeUp, baseDetail, ranks} = @state
      if timeUp
        isUpdated = [false]
        for checked, index in baseDetail.rankListChecked
          if checked is false
            ranks.splice index, 1
          else
            isUpdated.push false
        @setState
          isUpdated: isUpdated
          ranks: ranks
        window.addEventListener 'game.response', @handleRefreshList
      else
        window.removeEventListener 'game.response', @handleRefreshList
      @setState
        timeUp: !@state.timeUp
    handleRefreshList: (e) ->
      {path, body} = e.detail
      switch path
        when '/kcsapi/api_req_ranking/getlist'
          {memberId, data, baseDetail, isUpdated, ranks, timeUp, accounted} = @state
          # updateTime, ranking, rate, exp
          baseRanking = data[data.length - 1][1]
          baseRate = data[data.length - 1][2]
          baseExp = data[data.length - 1][3]
          newData = []
          refreshFlag = false
          for teitoku in body.api_list
              if teitoku.api_member_id is memberId and !isUpdated[0]
                #teitoku.api_member_id is memberId and baseDetail.rate isnt teitoku.api_rate
                #Estimate the rate with the offset;
                _rate = Math.floor((teitoku.api_experience - baseExp) / 1428)
                _rate = baseRate + _rate
                if (teitoku.api_rate - _rate) % 10 isnt 0 # %10 to ignore Extra Operation Map Senka.
                  _newBaseExp = teitoku.api_experience
                else
                  _newBaseExp = teitoku.api_experience - ((teitoku.api_experience - baseExp) % 1428)
                _rate = Math.max(_rate, teitoku.api_rate)
                ranking = teitoku.api_no
                newData[0] = getRefreshTime('')
                newData[1] = ranking
                newData[2] = teitoku.api_rate
                newData[3] = _newBaseExp
                isUpdated[0] = true
                @addData newData
                accounted = false
                timeUp = false
                refreshFlag = true
              if teitoku.api_no in ranks
                index = ranks.indexOf teitoku.api_no
                if !isUpdated[index + 1]
                  baseDetail.senkaList[index] = teitoku.api_rate
                  isUpdated[index + 1] = true
                  refreshFlag = true
              if refreshFlag
                @setState
                  accounted: accounted
                  timeUp: timeUp
                  baseDetail: baseDetail
                  isUpdated: isUpdated
                refreshFlag = false
              if isUpdated.every isTrue
                @saveData baseDetail
    setPresumedSenka: (presumedSenka) ->
      {baseDetail} = @state
      baseDetail.presumedSenka = presumedSenka
      @setState {baseDetail}
    handleCheckedChange: (rankListChecked, senkaList, isUpdated) ->
      {baseDetail} = @state
      baseDetail.rankListChecked = rankListChecked
      baseDetail.senkaList = senkaList
      @setState {baseDetail, isUpdated}
    render: ->
      <div>
        <link rel='stylesheet' href={join(relative(ROOT, __dirname), 'assets', 'Hairstrength.css')} />
        <div className='main-container'>
          <Alert bsStyle='danger'
                 className={if @state.timeUp then 'show' else 'hidden'}>
            {__ 'Please click the stats to update rankings'}
          </Alert>
        {
          {data, baseDetail, nickname, timeUp, accounted, isUpdated, exp} = @state
          <div style={getStatusStyle timeUp}>
            <Detail data={data}
                    baseDetail={baseDetail}
                    nickname={nickname}
                    timeToString={timeToString}
                    accounted={accounted} />
            <Countdown isAccounted={@isAccounted}
                       accounted={accounted}
                       isTimeUp={@isTimeUp}
                       timeUp={timeUp}
                       baseDetail={baseDetail}
                       data={data}
                       timeToString={timeToString} />
            <ExpListener data={data}
                         exp={exp}
                         accounted={accounted}
                         timeUp={timeUp}
                         setPresumedSenka={@setPresumedSenka} />
            <RankList  baseDetail={baseDetail}
                       isUpdated={isUpdated}
                       timeUp={timeUp}
                       isTrue={isTrue}
                       getStatusStyle={getStatusStyle}
                       handleCheckedChange={@handleCheckedChange} />
          </div>
        }
        </div>
      </div>
