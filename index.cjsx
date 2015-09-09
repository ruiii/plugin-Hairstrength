{APPDATA_PATH, ROOT, React, ReactBootstrap, FontAwesome, error, log, JSON} = window
{Alert} = ReactBootstrap
fs = require 'fs-extra'
{relative, join} = require 'path-extra'
#i18n = require './node_modules/i18n'

# i18n configure
#i18n.configure({
#    locales: ['en_US', 'ja_JP', 'zh_CN', 'zh_TW'],
#    defaultLocale: 'zh_CN',
#    directory: join(__dirname, 'assets', 'i18n'),
#    updateFiles: false,
#    indent: '\t',
#    extension: '.json'
#})
#i18n.setLocale(window.language)
# {__} = i18n

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

  "#{date.getFullYear()}-#{date.getMonth()+1}-#{date.getDate()} #{date.getHours()}"

getStatusStyle = (flag) ->
  if flag
    return {opacity: 0.4}
  else
    return {}

emptyDetail =
  updateTime: null,
  ranking: null,
  rankingDelta: null,
  rate: 0,
  rateDelta: 0,
  exp: 0,
  senkaList: [0, 0, 0, 0, 0]

module.exports =
  name: 'Hairstrength'
  displayName: <span><FontAwesome key={0} name='child' />秃　　秃</span>
  priority: 7
  author: 'Rui'
  link: 'https://github.com/ruiii'
  description: '战果计算器'
  version: '1.1.0'
  reactClass: React.createClass
    getInitialState: ->
      needToUpdate = []
      for count in [0..5]
        needToUpdate.push true
      baseDetail: Object.clone emptyDetail
      memberId: ''
      nickname: ''
      nextAccountTime: 0
      nextUpdateTime: 0
      senka: 0
      exp: 0
      updateCountdown: -1
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
      {baseDetail, senka} = @state
      if baseDetail.exp? and baseDetail.exp isnt null
        if (nextState.exp - baseDetail.exp) > 1428 or senka is 0
          senkaDelta = Math.floor((nextState.exp - baseDetail.exp) / 1428)
          if senka isnt (senkaDelta + baseDetail.rate)
            @setState
              senka: senkaDelta + baseDetail.rate
    handleResponse: (e) ->
      {path, body} = e.detail
      if @state.needToUpdate.every isFalse
        return 0
      else
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
            {needToUpdate, memberId, baseDetail, ranks, senka} = @state
            refreshFlag = false
            for teitoku in body.api_list
              if needToUpdate[0] and teitoku.api_member_id is memberId
                #teitoku.api_member_id is memberId and baseDetail.rate isnt teitoku.api_rate
                rate = teitoku.api_rate
                ranking = teitoku.api_no
                baseDetail.rateDelta = rate - baseDetail.rate
                baseDetail.rankingDelta = ranking - baseDetail.ranking
                baseDetail.updateTime = getRefreshTime('')
                baseDetail.rate = rate
                baseDetail.ranking = ranking
                baseDetail.exp = teitoku.api_experience
                senka = baseDetail.rate
                exp = baseDetail.exp
                needToUpdate[0] = false
                refreshFlag = true
              if teitoku.api_no in ranks
                index = ranks.indexOf(teitoku.api_no)
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
      {refreshCountdown, accountCountdown, needToUpdate, nextUpdateTime} = @state
      if getCountdown('refresh') >= 1 and nextUpdateTime isnt 0
        refreshCountdown = getCountdown('refresh')
        accountCountdown = getCountdown('')
        if accountCountdown < 1
          nextAccountTime = timeToString getRefreshTime('account')
          @setState
            nextAccountTime: nextAccountTime
        @setState
          refreshCountdown: refreshCountdown
          accountCountdown: accountCountdown
      else if getCountdown('refresh') < 1
        for index in [0..needToUpdate.length - 1]
          needToUpdate[index] = true
        @setState
          needToUpdate: needToUpdate
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
            请浏览战绩表示以更新战果值
          </Alert>
        {
          detail = @state.baseDetail
          update = @state.needToUpdate
          {nickname, nextUpdateTime, nextAccountTime, refreshCountdown, accountCountdown, exp, senka, ranks} = @state
          <div style={getStatusStyle(update.every isTrue)}>
            <h4>{nickname}提督</h4>
            <div style={getStatusStyle update[0]}>
              <h5>截止至  {timeToString detail.updateTime} 时</h5>
              <h5>顺位:  {detail.ranking}位 ({
                                                  if detail.rankingDelta < 0
                                                    "↑#{detail.rankingDelta}"
                                                  else if detail.rankingDelta > 0
                                                    "↓#{detail.rankingDelta}"
                                                  else
                                                    '-'})</h5>
              <h5>战果值:  {detail.rate} ({
                                                  if detail.rateDelta > 0
                                                    "↑#{detail.rateDelta}"
                                                  else
                                                    '-'})</h5>
            </div>
            <div className='table-container'
                 style={if isLastDay() then color: 'red' else color: 'inherit'}>
              <div className='col-container'>
                <span>结算时间</span>
                <span>{nextAccountTime} 时</span>
                <span>距离结算</span>
                <span>{window.resolveTime accountCountdown}</span>
              </div>
              <div className='col-container'>
                <span>刷新时间</span>
                <span>{nextUpdateTime} 时</span>
                <span>距离刷新</span>
                <span>{window.resolveTime refreshCountdown}</span>
              </div>
            </div>
            <div className='table-container'>
              <div className='col-container'>
                <span>经验值:</span>
                <span>{detail.exp} -> {exp}</span>
                <span>( 增值: {exp - detail.exp} )</span>
              </div>
              <div className='col-container'>
                <span>战果值:</span>
                <span>{detail.rate} -> {senka}</span>
                <span>( 增值: {senka - detail.rate} )</span>
              </div>
            </div>
            <div>
              <div className='table-container'>
                <div className='col-container'>
                  <span>Ranking</span>
                  {
                    for rank, index in ranks
                      <span key={index}>{rank}位</span>
                  }
                </div>
                <div className='col-container'>
                  <span>战果值</span>
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
