import { combineReducers } from 'redux'
import { forEach, isEmpty } from 'lodash'
import { timerSelector, rankSelector } from './selectors'
import {
  getRate,
  getMemberId,
  getFinalTime,
  getRefreshTime,
  getActiveRank,
  getUserNickname,
  checkIsUpdated,
  loadHistoryData,
  __,
  storePath,
} from '../components/utils'
import {
  ACTIVE_RANK_UPDATE,
  RATE_HISTORY_SHOW,
  RATE_CUSTOM_SHOW,
  RATE_FILTER_SHOW,
  RATE_HISTORY_UPDATE,
  RATE_TIME_UP,
  RATE_UPDATED,
  RATE_ACCOUNTED,
  RATE_CUSTOM_CHANGE,
  rateUpdated,
} from './actions'

/*
*    api_req_ranking/getlist	：ランキング
*    	api_count			：最大読み込み可能数？
*    	api_page_count		：最大ページ数
*    	api_disp_page		：表示中のページ
*    	api_list			：提督リスト
******************************************
*    		api_no			：順位   api_mxltvkpyuklh
*    		api_rank		：階級   api_pcumlrymlujh
*    		api_nickname	：提督名   api_mtjmdcwtvhdr
*    		api_comment		：コメント api_itbrdpdbkynm
*    		api_rate		：戦果　暗号化されている api_wuhnhojjxmke
*    		api_flag		：旗アイコン? 0=金色
*    		api_medals		：甲種勲章保有数
*/

const apiMap = {
  api: 'mxltvkpyuklh',
  api_no: 'api_mxltvkpyuklh',
  api_rate: 'api_wuhnhojjxmke',
  api_nickname: 'api_mtjmdcwtvhdr',
}

const initialState = {
  "initStatus": {
    "init": false,
  },
  "rank": {
    "exRate": [0, 0],
    "activeRank": [true, true, true, true, true],
    "rateList": [0, 0, 0, 0, 0],
    "deltaList": [0, 0, 0, 0, 0],
    "updatedRate": 0,
    "updatedRank": 0,
    "rateDelta": 0,
    "rankDelta": 0,
    "updatedTime": 0,
  },
  "history": {
    "historyData": [
      {
        "rate": 0,
        "rank": 0,
        "time": 0,
      },
    ],
  },
  "timer": {
    "updateTime": 0,
    "updatedList": [true, true, true, true, true],
    "accounted": false,
    "eoAccounted": false,
    "expAccounted": false,
    "accountString": "",
    "nextAccountTime": 0,
    "refreshString": "",
    "nextRefreshTime": 0,
    "isTimeUp": false,
    "isUpdated": false,
  },
  "custom": {
    "baseExp": 0,
    "baseRate": 0,
    "enable": false,
  },
  "setting": {
    "historyShow": false,
    "customShow": false,
    "filterShow": false,
  },
}
const emptyStoreData = {
  rank: initialState.rank,
  timer: initialState.timer,
  custom: initialState.custom,
}
function initStatusReducer(state = initialState.initStatus, action) {
  if (action.type === '@@Response/kcsapi/api_get_member/require_info' || action.type === '@@poi-plugin-senka-calc@init') {
    return {
      ...state,
      init: true,
    }
  }
  return state
}

function customReducer(state = initialState.custom, action) {
  switch (action.type) {
  case '@@Response/kcsapi/api_get_member/require_info':
  case '@@poi-plugin-senka-calc@init': {
    const storeData = getLocalStorage().custom
    if (!storeData || isEmpty(storeData)) {
      return state
    } else {
      return {
        ...state,
        ...storeData,
      }
    }
  }
  case RATE_CUSTOM_CHANGE:
    return {
      ...state,
      ...action.custom,
    }
  }
  return state
}

function rankReducer(state = initialState.rank, action) {
  if (action.type === '@@Response/kcsapi/api_get_member/require_info' || action.type === '@@poi-plugin-senka-calc@init') {
    const storeData = getLocalStorage().rank
    if (!storeData || isEmpty(storeData)) {
      return state
    } else {
      return {
        ...state,
        ...storeData,
      }
    }
  } else if (action.type.includes(apiMap.api)) {
    const { body } = action

    if (!body.api_list) {
      return state
    }

    const memberId = getMemberId()
    const nickname = getUserNickname()
    const timer = timerSelector(window.getStore()).timer
    const rateList = [ ...state.rateList ]
    const deltaList = [ ...state.deltaList ]
    let { updatedRate, updatedRank, rateDelta, rankDelta, updatedTime } = state
    let updated = false

    forEach(body.api_list, (data) => {

      const api_nickname = data[apiMap.api_nickname]
      const api_no = data[apiMap.api_no]
      const api_rate = data[apiMap.api_rate]

      if (api_nickname === nickname && timer.isTimeUp && updatedTime !== getRefreshTime()) {
        updatedRate = getRate(api_no, api_rate, memberId)
        updatedRank = api_no
        rateDelta = updatedRate - state.updatedRate
        rankDelta = updatedRank - state.updatedRank
        updatedTime = getRefreshTime()
        updated = true
      }

      const idx = getActiveRank().indexOf(api_no)

      if (idx < 0 || timer.updatedList[idx]) {
        return
      }

      updated = true
      rateList[idx] = getRate(api_no, api_rate, memberId)
      deltaList[idx] = rateList[idx] - state.rateList[idx]

      // TODO: move this to observe
      setImmediate(() => window.dispatch(rateUpdated(api_no)))
    })

    if (!updated) {
      return state
    }

    return {
      ...state,
      rateList,
      deltaList,
      updatedRate,
      updatedRank,
      rateDelta,
      rankDelta,
      updatedTime,
    }
  } else if (action.type === ACTIVE_RANK_UPDATE) {
    // [1, 5, 20, 100, 500]
    // const activeRank = [true, true, true, true, true]
    return {
      ...state,
      activeRank: action.activeRank,
    }
  } else {
    return state
  }
}

function historyReducer(state = initialState.history, action) {
  switch (action.type) {
  case '@@Response/kcsapi/api_get_member/require_info':
  case '@@poi-plugin-senka-calc@init': {
    const historyData = loadHistoryData()
    if (historyData.length === 0) {
      return state
    } else {
      return {
        ...state,
        historyData: [
          ...historyData,
        ],
      }
    }
  }
  case RATE_HISTORY_UPDATE: {
    const rank = rankSelector(window.getStore()).rank
    return {
      ...state,
      historyData: [
        ...state.historyData,
        {
          rate: rank.updatedRate,
          rank: rank.updatedRank,
          time: rank.updatedTime,
        },
      ],
    }
  }
  }
  return state
}

function timerReducer(state = initialState.timer, action) {
  switch (action.type) {
  case '@@Response/kcsapi/api_get_member/require_info':
  case '@@poi-plugin-senka-calc@init': {
    let storeData = getLocalStorage()
    if (isEmpty(storeData)) {
      storeData = emptyStoreData
    } else {
      for (const k in emptyStoreData) {
        if (!storeData[k] || isEmpty(storeData[k])) {
          storeData[k] = emptyStoreData[k]
        }
      }
    }

    let {
      accounted,
      eoAccounted,
      expAccounted,
      accountString,
      nextAccountTime,
      refreshString,
      nextRefreshTime,
      updatedList,
      isTimeUp,
      isUpdated,
    } = state
    nextAccountTime = getRefreshTime('account')
    const now = Date.now()
    const [normalTime, expTime, eoTime] = [getFinalTime(), getFinalTime('exp'), getFinalTime('eo')]
    if (now >= eoTime) {
      accounted = true
      eoAccounted = true
    } else if (now >= expTime) {
      expAccounted = true
      accountString = __('EO map final time')
      nextAccountTime = eoTime
    } else if (now >= normalTime) {
      accountString = __('Normal map final time')
      nextAccountTime = expTime
    } else if (now >= storeData.timer.updateTime + 11 * 3600 * 1000) {
      storeData.rank.exRate[0] = storeData.rank.exRate[1]
      storeData.rank.exRate[1] = 0
      accounted = true
    } else {
      accountString = __('Account time')
      accounted = false
    }
    // refresh timer
    refreshString = __("Refresh time")
    nextRefreshTime = getRefreshTime()
    // if not refreshed, mark as timeup
    if (!storeData.rank
        || (storeData.timer && storeData.timer.updateTime !== nextRefreshTime)) {
      updatedList = [false, false, false, false, false]
    } else {
      isTimeUp = false
      nextRefreshTime = getRefreshTime('next')
      forEach(storeData.rank.rateList, (rate, idx) => {
        if (rate === 0) {
          updatedList[idx] = false
        }
      })
    }
    isUpdated = checkIsUpdated(storeData.rank.activeRank, updatedList)
    return {
      ...state,
      accounted,
      eoAccounted,
      expAccounted,
      accountString,
      nextAccountTime,
      refreshString,
      nextRefreshTime,
      updatedList,
      isTimeUp,
      isUpdated,
    }
  }
  case RATE_TIME_UP:
    return {
      ...state,
      isTimeUp: true,
      isUpdated: false,
      accounted: false,
      updatedList: [false, false, false, false, false],
      nextAccountTime: getRefreshTime('account'),
    }
  case ACTIVE_RANK_UPDATE: {
    const isUpdated = checkIsUpdated(action.activeRank, state.updatedList)
    if (isUpdated !== state.isUpdated) {
      const nextAccountTime = getRefreshTime('account')
      let accounted = true
      if (nextAccountTime > (new Date()).getTime()) {
        accounted = false
      }
      return {
        ...state,
        isUpdated,
        accounted,
        nextRefreshTime: getRefreshTime('next'),
        nextAccountTime,
      }
    }
    break
  }
  case RATE_UPDATED:
    if (action.rankNo) {
      const rank = rankSelector(window.getStore()).rank
      const idx = getActiveRank().indexOf(action.rankNo)
      if (idx < 0) {
        break
      }
      const updatedList = [ ...state.updatedList ]
      updatedList[idx] = true

      const isUpdated = checkIsUpdated(rank.activeRank, updatedList)
      let { nextRefreshTime, nextAccountTime, accounted } = state

      if (isUpdated) {
        nextRefreshTime = getRefreshTime('next')
        nextAccountTime = getRefreshTime('account')
        if (nextAccountTime > (new Date()).getTime()) {
          accounted = false
        }
      }

      return {
        ...state,
        updatedList,
        isUpdated,
        accounted,
        nextRefreshTime,
        nextAccountTime,
      }
    }
    break
  case RATE_ACCOUNTED:
    return {
      ...state,
      accounted: true,
    }
  case RATE_HISTORY_UPDATE: {
    const rank = rankSelector(window.getStore()).rank
    return {
      ...state,
      updateTime: rank.updatedTime,
    }
  }
  }
  return state
}

function settingReducer(state = initialState.setting, action) {
  switch (action.type) {
  case RATE_HISTORY_SHOW:
    return {
      ...state,
      historyShow: !state.historyShow,
    }
  case RATE_CUSTOM_SHOW:
    return {
      ...state,
      customShow: !state.customShow,
    }
  case RATE_FILTER_SHOW:
    return {
      ...state,
      filterShow: !state.filterShow,
    }
  }
  return state
}
function getLocalStorage() {
  const id = getMemberId()
  let data
  try {
    const storeData = JSON.parse(localStorage.getItem(storePath) || '{}')
    data = storeData[id] || {}
  } catch (e) {
    data = {}
  }
  return data
}

export const reducer = combineReducers({
  initStatus: initStatusReducer,
  rank: rankReducer,
  history: historyReducer,
  timer: timerReducer,
  custom: customReducer,
  setting: settingReducer,
})
