{APPDATA_PATH, ROOT, React, ReactBootstrap, FontAwesome, error, JSON} = window
{Alert} = ReactBootstrap
fs = require 'fs-extra'
{relative, join} = require 'path-extra'
__ = window.i18n["poi-plugin-senka-calc"].__.bind(window.i18n["poi-plugin-senka-calc"])

Detail = require './detail' #completed
RankList = require './rank-list'
ExpListener = require './exp-listener'
Countdown = require './countdown'

getFinalTime = (type) -> #get Final AccountTime EO for EO
  finalDate = new Date()
  finalDate.setUTCHours(finalDate.getUTCHours() + 9)    #mapping Tokyo(00:00) to UTC(00:00)
  finalDate.setUTCDate(1)                               #in case next month's day less than this month
  finalDate.setUTCMonth(finalDate.getUTCMonth() + 1)
  finalDate.setUTCDate(0)
  if type is 'eo'
    finalDate.setUTCHours(15)
  else if type is 'exp'
    finalDate.setUTCHours(13)
  else
    finalDate.setUTCHours(6)

  finalDate.setUTCMinutes(0)
  finalDate.setUTCSeconds(0)
  finalDate.setUTCMilliseconds(0)

  finalDate.getTime()

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
  date.setUTCMilliseconds(0)

  date.getTime()

timeToString = (time, isFilename = false) ->
  if time isnt null
    date = new Date(time)
    if isFilename
      "#{date.getFullYear()}-#{date.getMonth()+1}"
    else
      "#{date.getFullYear()}-#{date.getMonth()+1}-#{date.getDate()} #{date.getHours()}:00"

getStatusStyle = (flag) ->
  if flag
    return {opacity: 0.4}
  else
    return {}

# updateTime, ranking, rate, exp
emptyData = [[0, 0, 0, 0]]


emptyDetail =
  adjustedExp: 0,     #exp for adjust
  baseExp: 0,
  baseRate: 0,
  exRate: [0, 0],
  presumedExp: 0,
  updateTime: 0,
  rankListChecked: [true, true, true, true, true],
  listDelta: [0, 0, 0, 0, 0]
  senkaList: [0, 0, 0, 0, 0]

module.exports =
  reactClass: React.createClass
    getInitialState: ->
      data: Object.clone emptyData
      baseDetail: Object.clone emptyDetail
      memberId: ''
      nickname: ''
      exp: 0
      baseSenka: '0.0'  #basesenka for show

      accounted: false
      expAccounted: false
      eoAccounted: false

      accountString: ''

      timeUp: false

      updatedFlag: true

      #remove the flag of user's update as timeUp can stand for it
      isUpdated: [true, true, true, true ,true]

      ranks: [1, 5, 20, 100, 500]

      tutuInitialed: false

      #final refresh, exp account, eo account
      finalTimes: [0, 0, 0]
      nextAccountTime: 0
      nextRefreshTime: 0


    componentDidMount: ->
      if window._teitokuId? && window._nickName? && window._teitokuExp?
        @tutuInitial window._teitokuId, window._nickName, window._teitokuExp
      else
        window.addEventListener 'game.response', @handleResponse
    componentWillUnmount: ->
      if !@state.tutuInitialed
        window.removeEventListener @handleResponse
      else if !@state.updatedFlag
        window.removeEventListener @handleRefreshList
    handleResponse: (e) ->
      {path, body} = e.detail
      {isUpdated} = @state
      switch path
        when '/kcsapi/api_get_member/basic'
          #remove useless judgement
          #if @state.memberId isnt body.api_member_id
          @tutuInitial body.api_member_id, body.api_nickname, body.api_experience

          window.removeEventListener 'game.response', @handleResponse

    #initial everything of tutu
    tutuInitial: (memberId, nickname, exp)->
      {accounted, eoAccounted, expAccounted, accountString, isUpdated} = @state

      {data, baseDetail} = @getDataFromFile memberId
      finalTimes = [getFinalTime(), getFinalTime('exp'), getFinalTime('eo')]
      nextAccountTime = getRefreshTime 'account'
      accountString = __ 'Account time'
      now = Date.now()
      #some logic to determine account Stage
      if now >= finalTimes[2]
        eoAccounted = true
        accounted = true
      else if now >= finalTimes[1]
        expAccounted = true
        accountString = __ 'EO map final time'
        nextAccountTime = finalTimes[2]
      else if now >= finalTimes[0]
        accountString = __ 'Normal map final time'
        nextAccountTime = finalTimes[1]
      else if now >= baseDetail.updateTime + 11 * 3600 * 1000 #TODO
        baseDetail.exRate[0] = baseDetail.exRate[1]
        baseDetail.exRate[1] = 0
        @saveData baseDetail
        accounted = true
      else
        accountString = __ 'Account time'
        accounted = false

      if (eoAccounted or accounted) and baseDetail.presumedExp is 0
        baseDetail.presumedExp = exp

      if baseDetail.updateTime isnt getRefreshTime ''  # if not refreshed ,mark as timeup
        @refreshTimeout()
        isUpdated = [false, false, false, false, false]
        nextRefreshTime = getRefreshTime ''
      else
        nextRefreshTime = getRefreshTime 'next'
        for rank, idx in baseDetail.senkaList
          if rank is 0
            isUpdated[idx] = false

      baseSenka = (((baseDetail.baseExp - baseDetail.adjustedExp) / 1428) + baseDetail.baseRate - 0.0499).toFixed(1)


      @setState
        baseDetail: baseDetail
        memberId: parseInt memberId
        data: data
        exp: exp
        nickname: nickname
        baseSenka: baseSenka
        finalTimes: finalTimes
        nextAccountTime: nextAccountTime
        nextRefreshTime: nextRefreshTime
        accounted: accounted
        eoAccounted: eoAccounted
        expAccounted: expAccounted
        accountString: accountString
        isUpdated: isUpdated

        tutuInitialed: true
    #TODO: judge if adjusted
    ##adjustInitial: (baseDetail, listRate, listExp) ->


    saveData: (baseDetail) ->
      for senka, idx in baseDetail.senkaList
        if !@state.isUpdated[idx]
          senka = 0
      try
        fs.writeJSONSync join(APPDATA_PATH, 'hairstrength', "#{@state.memberId}", 'detail.json'), baseDetail
      catch e
        error "Write senkaDetail error!#{e}"
    addData: (data) ->
      filename = timeToString data[0], true
      try
        fs.appendFileSync join(APPDATA_PATH, 'hairstrength', "#{@state.memberId}", "#{filename}"), "#{data}\n", 'utf-8'
      catch e
        error "Write senkaData error!#{e}"
    getDataFromFile: (memberId, exp) ->
      filename = timeToString getRefreshTime(''), true
      try
        fs.ensureDirSync join(APPDATA_PATH, 'hairstrength', memberId)
        baseDetail = fs.readJSONSync join(APPDATA_PATH, 'hairstrength', memberId, 'detail.json')
        data = fs.readFileSync join(APPDATA_PATH, 'hairstrength', memberId, "#{filename}"), 'utf-8'
      catch e
        error "Read file form hairstrength error!#{e}" if process.env.DEBUG?
      if !baseDetail?
        baseDetail = Object.clone emptyDetail
      else
        aEmptyDetail = Object.clone emptyDetail
        for idx of emptyDetail
          if !baseDetail[idx]?
            baseDetail[idx] = aEmptyDetail[idx]

      if data?.length > 0
        data = data.split '\n'
        data = data.filter (item) ->
          item isnt ''
        data = data.map (a) ->
          a.split(',').map (a) ->
            parseInt a

        if baseDetail.baseRate is 0
          baseDetail.baseRate = data[data.length - 1][2]
        if baseDetail.baseExp is 0
          baseDetail.baseExp = data[data.length - 1][3]
        if baseDetail.updateTime is 0
          baseDetail.updateTime = data[data.length - 1][0]
      else
        data = Object.clone emptyData
        #if there's no data mark baseDetail as empty
        baseDetail = Object.clone emptyDetail


      {data, baseDetail}

    estimateSenka: (exp) ->
      {adjustedExp, baseRate, exRate} = @state.baseDetail
      if adjustedExp isnt 0
        estimate = (((exp - adjustedExp) / 1428) + exRate[0] + exRate[1] + baseRate- 0.0499).toFixed(1)
      else
        estimate = '0.0'

    accountTimeout: ->
      {finalTimes, nextAccountTime} = @state
      {accounted, expAccounted, eoAccounted} = @state
      {accountString, baseDetail} = @state

      now = Date.now()
      #some logic to determine account Stage
      if now >= finalTimes[2]
        eoAccounted = true
        accounted = true
      else if now >= finalTimes[1]
        expAccounted = true
        accountString = __ 'EO map final time'
        nextAccountTime = finalTimes[2]
      else if now >= nextAccountTime
        accounted = true
      else
        baseDetail.exRate[0] = baseDetail.exRate[1]
        baseDetail.exRate[1] = 0
        @saveData baseDetail
        accountString = __ 'Account time'
        accounted = false

      @setState {nextAccountTime, accounted, expAccounted, eoAccounted, accountString, baseDetail}


    refreshTimeout: ->
      {timeUp, baseDetail, isUpdated} = @state
      {accounted, expAccounted, eoAccounted} = @state
      {accountString} = @state
      {nextRefreshTime, finalTimes, nextAccountTime} = @state
      if !timeUp
        isUpdated = [false, false, false, false, false]
        #baseDetail.senkaList = [0, 0, 0, 0, 0]

        @handleCheckedChange baseDetail.rankListChecked, isUpdated
      else
        baseDetail.exRate[0] = 0
        baseDetail.presumedExp = 0
        nextRefreshTime = getRefreshTime 'next'
        nextAccountTime = getRefreshTime 'account'
        accounted = false
        accountString = __ 'Account time'
        if eoAccounted
          baseDetail.exRate[1] = 0
          finalTimes = [getFinalTime(), getFinalTime('exp'), getFinalTime('eo')]
          expAccounted = false
          eoAccounted = false
        if Date.now() >= finalTimes[0]
          accountString = __ 'Normal map final time'
          nextAccountTime = finalTimes[1]


      @setState
        baseDetail: baseDetail
        isUpdated: isUpdated
        timeUp: !timeUp
        accounted: accounted
        expAccounted: expAccounted
        eoAccounted: eoAccounted
        nextAccountTime: nextAccountTime
        nextRefreshTime: nextRefreshTime
        finalTimes: finalTimes
        accountString: accountString


    handleRefreshList: (e) ->
      {path, body} = e.detail
      switch path
        when '/kcsapi/api_req_ranking/getlist'
          {memberId, data, baseDetail, isUpdated, ranks, timeUp, accounted, baseSenka, eoAccounted} = @state
          # updateTime, ranking, rate, exp
          newData = []
          refreshFlag = false
          for teitoku in body.api_list
              if teitoku.api_member_id is memberId and timeUp
                #teitoku.api_member_id is memberId and baseDetail.rate isnt teitoku.api_rate
                #Estimate the rate with the offset;
                if eoAccounted
                  baseDetail = Object.clone emptyDetail
                  data = []
                if baseDetail.adjustedExp
                  _Senka = Math.floor((teitoku.api_experience - baseDetail.adjustedExp) / 1428) + baseDetail.baseRate + baseDetail.exRate[0]
                else
                  _Senka = 0

                if (teitoku.api_rate - _Senka) isnt 0
                  baseDetail.adjustedExp = teitoku.api_experience
                else
                  baseDetail.adjustedExp = teitoku.api_experience - ((teitoku.api_experience - baseDetail.adjustedExp) % 1428)

                baseDetail.baseExp = teitoku.api_experience
                baseDetail.baseRate = teitoku.api_rate
                baseDetail.updateTime = getRefreshTime ''

                ranking = teitoku.api_no
                newData[0] = getRefreshTime ''
                newData[1] = ranking
                newData[2] = teitoku.api_rate
                newData[3] = teitoku.api_experience
                baseSenka = (((teitoku.api_experience - baseDetail.adjustedExp) / 1428) + teitoku.api_rate - 0.0499).toFixed(1)

                @addData newData

                data.push newData #add new data to @state.data
                @refreshTimeout()
                refreshFlag = true

              if  (index = ranks.indexOf teitoku.api_no) > -1
                if !isUpdated[index]
                  baseDetail.listDelta[index] = teitoku.api_rate - baseDetail.senkaList[index]
                  baseDetail.senkaList[index] = teitoku.api_rate
                  isUpdated[index] = true
                  refreshFlag = true

          if refreshFlag
            @handleCheckedChange baseDetail.rankListChecked, isUpdated
            @setState {baseSenka, baseDetail, isUpdated, data}


    addExRate: (rate) ->
      {baseDetail} = @state
      baseDetail.exRate[1] = baseDetail.exRate[1] + rate

      @saveData baseDetail
      @setState {baseDetail}


    setPresumedExp: (exp) ->
      {baseDetail} = @state
      baseDetail.exRate[0] = baseDetail.exRate[1]
      baseDetail.exRate[1] = 0
      if exp isnt 0
        baseDetail.presumedExp = exp
        @saveData baseDetail
      @setState {baseDetail}

    handleCheckedChange: (rankListChecked, isUpdated)->

      {isUpdated} = @state if !isUpdated?
      {updatedFlag, baseDetail} = @state

      flag = true
      for checked, idx in rankListChecked
        if checked and !isUpdated[idx]
          flag = false
          break

      if !flag and updatedFlag
        window.addEventListener 'game.response', @handleRefreshList
        @setState
          updatedFlag: flag
      else if flag and !updatedFlag
        @saveData baseDetail
        window.removeEventListener 'game.response', @handleRefreshList
        @setState
          updatedFlag: flag

    render: ->
      if !@state.tutuInitialed
        return <div />
      <div id="Senka Calc" className="Senka Calc">
        <link rel='stylesheet' href={join(__dirname , 'assets', 'Hairstrength.css')} />
        <div className='main-container'>
          <Alert bsStyle='danger'
                 className={if @state.timeUp then 'show' else 'hidden'}>
            {__ 'Please click the stats to update rankings'}
          </Alert>
        {
          {data, baseDetail, nickname, timeUp, accounted, isUpdated, exp, baseSenka, ranks, updatedFlag, eoAccounted} = @state
          {expAccounted, nextAccountTime, nextRefreshTime, accountString} = @state
          <div style={getStatusStyle timeUp}>
            <Detail
              data={data}
              baseDetail={baseDetail}
              nickname={nickname}
              timeToString={timeToString}
              accounted={accounted} />
            <Countdown
              accountTimeout={@accountTimeout}
              refreshTimeout={@refreshTimeout}
              accounted={accounted}
              timeUp={timeUp}
              accountTimeString={accountString}
              refreshTimeString={__ "Refresh time"}
              nextAccountTime={nextAccountTime}
              nextRefreshTime={nextRefreshTime}
              timeToString={timeToString}
              isLastDay={isLastDay}
              presumedSenka={@estimateSenka baseDetail.presumedExp} />
            <ExpListener
              exp={exp}
              accounted={accounted}
              eoAccounted={eoAccounted}
              expAccounted={expAccounted}
              baseSenka={baseSenka}
              baseExp={baseDetail.baseExp}
              estimateSenka={@estimateSenka}
              addExRate={@addExRate}
              setPresumedExp={@setPresumedExp} />
            <RankList
              baseDetail={baseDetail}
              ranks={ranks}
              isUpdated={isUpdated}
              updatedFlag={updatedFlag}
              isTrue={isTrue}
              getStatusStyle={getStatusStyle}
              handleCheckedChange={@handleCheckedChange} />
          </div>
        }
        </div>
      </div>
