{APPDATA_PATH, ROOT, React, ReactBootstrap, FontAwesome, error, log, JSON} = window
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

timeToString = (time) ->
  date = new Date(time)

  "#{date.getFullYear()}-#{date.getMonth()+1}-#{date.getDate()} #{date.getHours()}:00"

getStatusStyle = (flag) ->
  if flag
    return {opacity: 0.4}
  else
    return {}

emptyDetail =
  updateTime: null,
  ranking: 0,
  rankingDelta: 0,
  rate: 0,
  rateDelta: 0,
  exp: 0,
  senkaList: [0, 0, 0, 0, 0],

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
      needToUpdate = []
      for count in [0..5]
        needToUpdate.push true
      baseDetail: Object.clone emptyDetail
      memberId: ''
      nickname: ''
      accounted: false
      nextAccountTime: 0
      nextUpdateTime: 0
      senka: 0
      exp: 0
      refreshCountdown: -1
      accountCountdown: -1
      ranks: [1, 5, 20, 100, 500]
      needToUpdate: needToUpdate
    componentDidMount: ->
      window.addEventListener 'game.response', @handleResponse
      setInterval @updateCountdown, 1000
    componentWillUnmount: ->
      window.addEventListener 'game.response', @handleResponse
      clearInterval @updateCountdown, 1000
    componentWillUpdate: (nextProps, nextState) ->
      {senka} = @state
      if nextState.baseDetail.exp? and nextState.baseDetail.exp isnt null
        #senkaDelta = Math.floor((nextState.exp - baseDetail.exp) / 1428)
        #A guess of Katokawa's method: Senka = Math.floor((Exp - absOffset)/1428)
        senkaDelta = ((nextState.exp - nextState.baseDetail.exp ) / 1428)
        if (senkaDelta + nextState.baseDetail.rate - senka) > 0.1
          @setState
            senka: parseFloat((senkaDelta + nextState.baseDetail.rate - 0.05).toFixed(1))
    handleResponse: (e) ->
      {path, body} = e.detail
      switch path
        when '/kcsapi/api_get_member/basic'
          if memberId isnt body.api_member_id
            memberId = body.api_member_id
            exp = body.api_experience
            nextUpdateTime = timeToString getRefreshTime('next')
            nextAccountTime = timeToString getRefreshTime('account')
            @getDataFromFile memberId, exp
            @setState
              nextUpdateTime: nextUpdateTime
              nextAccountTime: nextAccountTime
              nickname: body.api_nickname
              exp: exp
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
        when '/kcsapi/api_req_ranking/getlist'
          if @state.needToUpdate.every isFalse
            return 0
          else
            {needToUpdate, memberId, baseDetail, ranks} = @state
            refreshFlag = false
            for teitoku in body.api_list
              if needToUpdate[0] and teitoku.api_member_id is memberId
                #teitoku.api_member_id is memberId and baseDetail.rate isnt teitoku.api_rate
                #Estimate the rate with the offset;
                _rate = Math.floor((teitoku.api_experience - baseDetail.exp) / 1428)
                _rate = baseDetail.rate + _rate
                if (teitoku.api_rate - _rate) % 10 isnt 0 # %10 to ignore Extra Operation Map Senka.
                  _newBaseExp = teitoku.api_experience
                else
                  _newBaseExp = teitoku.api_experience - ((teitoku.api_experience - baseDetail.exp) % 1428)
                _rate = Math.max(_rate, teitoku.api_rate)
                ranking = teitoku.api_no
                baseDetail.rateDelta = _rate - baseDetail.rate
                baseDetail.rankingDelta = ranking - baseDetail.ranking
                baseDetail.updateTime = getRefreshTime('')
                baseDetail.rate = teitoku.api_rate
                baseDetail.ranking = ranking
                baseDetail.exp = _newBaseExp
                needToUpdate[0] = false
                refreshFlag = true
              if teitoku.api_no in ranks
                index = ranks.indexOf teitoku.api_no
                if baseDetail.senkaList[index] isnt teitoku.api_rate or needToUpdate[index + 1]
                  baseDetail.senkaList[index] = teitoku.api_rate
                  needToUpdate[index + 1] = false
                refreshFlag = true
              if refreshFlag
                @setState
                  baseDetail: baseDetail
                  needToUpdate: needToUpdate
                refreshFlag = false
              if needToUpdate.every isFalse
                @saveData baseDetail
    updateCountdown: ->
      {needToUpdate, nextUpdateTime, accounted} = @state
      if getCountdown('refresh') >= 1 and nextUpdateTime isnt 0
        refreshCountdown = getCountdown('refresh')
        if getCountdown('') <= 1
          accounted = true
        if accounted
          accountCountdown = 0
        else
          accountCountdown = getCountdown('')
        @setState
          accounted: accounted
          refreshCountdown: refreshCountdown
          accountCountdown: accountCountdown
      else if getCountdown('refresh') < 1
        for index in [0..needToUpdate.length - 1]
          needToUpdate[index] = true
        accounted = false
        nextUpdateTime = timeToString getRefreshTime('next')
        nextAccountTime = timeToString getRefreshTime('account')
        @setState
          accounted: accounted
          needToUpdate: needToUpdate
          nextUpdateTime: nextUpdateTime
          nextAccountTime: nextAccountTime
    saveData: (baseDetail) ->
      try
        fs.writeJSONSync join(APPDATA_PATH, 'hairstrength', "#{@state.memberId}.json"), baseDetail
      catch e
        error "Write senkaDetail error!#{e}"
    getDataFromFile: (memberId, exp) ->
      {needToUpdate, baseDetail} = @state
      for index in [0..needToUpdate.length - 1]
        needToUpdate[index] = false
      try
        fs.ensureDirSync join(APPDATA_PATH, 'hairstrength')
        baseDetail = fs.readJSONSync join(APPDATA_PATH, 'hairstrength', "#{memberId}.json")
      catch e
        error "Read file form hairstrength error!#{e}"
      if !baseDetail.updateTime? and baseDetail.updateTime is null
        baseDetail = Object.clone emptyDetail
        baseDetail.exp = exp
        for index in [0..needToUpdate.length - 1]
          needToUpdate[index] = true
      else
        if (getRefreshTime('') - baseDetail.updateTime) > 43199000 # 60 * 60 * 1000 * 12
          for index in [0..needToUpdate.length - 1]
            needToUpdate[index] = true
      @setState
        baseDetail: baseDetail
        memberId: parseInt memberId
        needToUpdate: needToUpdate

    render: ->
      <div>
        <link rel='stylesheet' href={join(relative(ROOT, __dirname), 'assets', 'Hairstrength.css')} />
        <div className='main-container'>
          <Alert bsStyle='danger'
                 className={if @state.needToUpdate.every isTrue then 'show' else 'hidden'} >
            {__ 'Please click the stats to update rankings'}
          </Alert>
        {
          detail = @state.baseDetail
          update = @state.needToUpdate
          {nickname, nextUpdateTime, nextAccountTime, refreshCountdown, accountCountdown, exp, senka, ranks} = @state
          <div style={getStatusStyle(update.every isTrue)}>
            <h4>{__('Admiral　%s　', nickname)}</h4>
            <div style={getStatusStyle update[0]}>
              <h5>{__('By:　%s　', timeToString(detail.updateTime))}</h5>
              <h5>{__ 'Ranking'}:　{detail.ranking}　({
                                                  if detail.rankingDelta < 0
                                                    "↑#{Math.abs detail.rankingDelta}"
                                                  else if detail.rankingDelta > 0
                                                    "↓#{detail.rankingDelta}"
                                                  else
                                                    '-'})</h5>
              <h5>{__ 'Rate'}:　{detail.rate}　({
                                                  if detail.rateDelta > 0
                                                    "↑#{detail.rateDelta}"
                                                  else
                                                    '-'})</h5>
            </div>
            <div className='table-container'
                 style={if isLastDay() then color: 'red' else color: 'inherit'}>
              <div className='col-container'>
                <span>{__ 'Account time'}</span>
                <span>{nextAccountTime}</span>
                <span>{__ 'Before account'}</span>
                <span>{window.resolveTime accountCountdown}</span>
              </div>
              <div className='col-container'>
                <span>{__ "Refresh time"}</span>
                <span>{nextUpdateTime}</span>
                <span>{__ "Before refresh"}</span>
                <span>{window.resolveTime refreshCountdown}</span>
              </div>
            </div>
            <div className='table-container'>
              <div className='col-container'>
                <span>{__ 'Experience'}</span>
                <span>{detail.exp}　->　{exp}</span>
                <span>( {__ 'Increment'}:　{exp - detail.exp} )</span>
              </div>
              <div className='col-container'>
                <span>{__ 'Rate'}</span>
                <span>{detail.rate}　->　{senka}</span>
                <span>( {__ 'Increment'}:　{(senka - detail.rate).toFixed(1)} )</span>
              </div>
            </div>
            <Alert bsStyle='danger'
                   className={if @state.needToUpdate.every isFalse then 'hidden' else 'show'} >
              {__ 'It will save when all rates is updated'}
            </Alert>
            <div>
              <div className='table-container'>
                <div className='col-container'>
                  <span>{__ 'Ranking'}</span>
                  {
                    for rank, index in ranks
                      <span key={index}>{rank}</span>
                  }
                </div>
                <div className='col-container'>
                  <span>{__ 'Rate'}</span>
                  {
                    for senka, index in detail.senkaList
                      <span key={index} style={getStatusStyle update[index+1]}>{senka}</span>
                  }
                </div>
              </div>
            </div>
          </div>
        }
        </div>
      </div>
