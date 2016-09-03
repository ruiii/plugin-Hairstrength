import { combineReducers } from 'redux'
import { forEach, isEmpty, includes } from 'lodash'
import {
  timerSelector,
  rankSelector,
  customSelector,
  expSelector,
  userDetailInitSelector,
} from './selectors'
import {
  getRate,
  getMemberId,
  getFinalTime,
  getRefreshTime,
  getUserNickname,
  checkIsUpdated,
  loadHistoryData,
  __,
  storePath,
  accountTimeout,
  refreshTimeout,
  isNewMonth,
  pickStoreData,
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
    "activeRank": {
      "1": {
        active: true,
        rate: 0,
        delta: 0,
      },
      "5": {
        active: true,
        rate: 0,
        delta: 0,
      },
      "20": {
        active: true,
        rate: 0,
        delta: 0,
      },
      "100": {
        active: true,
        rate: 0,
        delta: 0,
      },
      "500": {
        active: true,
        rate: 0,
        delta: 0,
      },
    },
    "updatedDetail": {
      "exp": 0,
      "rate": {
        "value": 0,
        "delta": 0,
      },
      "rank": {
        "value": 0,
        "delta": 0,
      },
    },
    "eoRate": {
      "store": 0,
      "new": 0,
    },
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
    "isTimeUp": false,
    "updateTime": 0,
    "updatedList": {
      "1": true,
      "5": true,
      "20": true,
      "100": true,
      "500": true,
    },
    "counter": {
      "accounted": {
        "status": false,
        "str": "",
        "nextTime": 0,
      },
      "refreshed": {
        "status": false,
        "str": "",
        "nextTime": 0,
      },
    },
    "finalTimes": {
      am: getFinalTime('am'),
      pm: getFinalTime('pm'),
    },
  },
  "custom": {
    "baseExp": 0,
    "baseRate": 0,
    "enable": false,
    "auto": false,
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
const initActions = [
  '@@Response/kcsapi/api_get_member/require_info',
  '@@poi-plugin-senka-calc@init',
]
const eoActions = {
  '@@Response/kcsapi/api_req_sortie/battleresult': 'api_get_exmap_rate',
  '@@Response/kcsapi/api_req_map/next': 'api_get_eo_rate',
}
function initStatusReducer(state = initialState.initStatus, action) {
  if (initActions.includes(action.type)) {
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
      return pickStoreData(storeData, state)
    }
  }
  case RATE_CUSTOM_CHANGE:
    return {
      ...state,
      ...action.custom,
    }
  case '@@RATE_RESET_RATE': {
    const _store = window.getStore()
    const { auto } = customSelector(_store).custom
    let exp = 0
    let rate = 0
    if (auto) {
      const { updatedDetail } = userDetailInitSelector(_store)
      if (updatedDetail.exp === state.baseExp) {
        return state
      }
      exp = updatedDetail.exp
      rate = updatedDetail.rate.value
    }
    return {
      ...state,
      baseExp: exp,
      baseRate: rate,
    }
  }
  }
  return state
}

function rankReducer(state = initialState.rank, action) {
  const { type, body } = action
  if (initActions.includes(type)) {
    const storeData = getLocalStorage().rank
    if (!storeData || isEmpty(storeData)) {
      return state
    } else {
      const { updatedTime, activeRank } = storeData
      if (updatedTime && isNewMonth(updatedTime)) {
        forEach(activeRank, (data, i) => {
          data.rate = 0
          data.delta = 0
        })
        return {
          ...state,
          activeRank,
        }
      }
      return pickStoreData(storeData, state)
    }
  } else if (type.includes(apiMap.api)) {

    if (!body.api_list) {
      return state
    }

    const memberId = getMemberId()
    const nickname = getUserNickname()
    const { timer } = timerSelector(window.getStore())
    let { updatedDetail, updatedTime, activeRank } = state
    const { rate, rank } = updatedDetail
    let { exp } = updatedDetail
    let updated = false

    forEach(body.api_list, (data) => {

      const api_nickname = data[apiMap.api_nickname]
      const api_no = data[apiMap.api_no]
      const api_rate = data[apiMap.api_rate]
      const newRate = getRate(api_no, api_rate, memberId)

      if (api_nickname === nickname && (timer.isTimeUp || rate.value === 0) && updatedTime !== getRefreshTime()) {
        rate.value = newRate
        rank.value = api_no
        rate.delta = rate.value - state.updatedDetail.rate.value
        rank.delta = rank.value - state.updatedDetail.rank.value
        exp = expSelector(window.getStore()).exp
        updatedTime = getRefreshTime()
        updated = true
      }

      if (includes(Object.keys(activeRank), String(api_no)) && !timer.updatedList[api_no]) {
        activeRank[api_no].delta = newRate - activeRank[api_no].rate
        activeRank[api_no].rate = newRate
        updated = true
      }

      // TODO: move this to observe
      setImmediate(() => window.dispatch(rateUpdated(api_no)))
    })

    if (!updated) {
      return state
    }

    return {
      ...state,
      activeRank,
      updatedDetail: {
        ...updatedDetail,
        exp,
        rate,
        rank,
      },
      updatedTime,
    }
  } else if (type === ACTIVE_RANK_UPDATE) {
    return {
      ...state,
      activeRank: action.activeRank,
    }
  } else if (type === '@@RATE_STORE_EORATE') {
    const { eoRate } = state
    eoRate.store = eoRate.new
    eoRate.new = 0
    return {
      ...state,
      eoRate,
    }
  } else if (Object.keys(eoActions).includes(type)) {
    const { eoRate } = state
    const rate = parseInt(body[eoActions[type]])
    // in case of '0'
    if (rate && rate !== 0) {
      eoRate.new += rate
    }
    return {
      ...state,
      eoRate,
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
    const rankStore = rankSelector(window.getStore()).rank
    const { rank, rate } = rankStore.updatedDetail
    return {
      ...state,
      historyData: [
        ...state.historyData,
        {
          rate: rate.value,
          rank: rank.value,
          time: rankStore.updatedTime,
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
    const storeTimer = pickStoreData(storeData.timer, state)

    let newState = {
      ...state,
    }
    newState.counter.accounted.nextTime = getRefreshTime('account')
    newState = {
      ...newState,
      ...accountTimeout(state),
    }
    if (Date.now() >= storeTimer.updateTime + 11 * 3600 * 1000) {
      newState.counter.accounted.status = true
    }

    const { counter } = newState

    // refresh timer
    counter.refreshed.str = __("Refresh time")
    counter.refreshed.nextTime = getRefreshTime()
    // if not refreshed, mark as timeup

    if (!storeData.rank.updatedTime || (storeTimer.updateTime !== counter.refreshed.nextTime)) {
      newState = {
        ...newState,
        ...refreshTimeout(newState),
      }
    } else {
      counter.refreshed.nextTime = getRefreshTime('next')
      forEach(storeData.rank.activeRank, (data, i) => {
        if (data.rate === 0) {
          newState.updatedList[i] = false
        }
      })
    }
    counter.refreshed.status = checkIsUpdated(storeData.rank.activeRank, newState.updatedList)
    return {
      ...newState,
      counter,
    }
  }
  case RATE_TIME_UP: {
    const isTimeUp = true

    return {
      ...state,
      ...refreshTimeout({
        ...state,
        isTimeUp,
      }),
    }
  }
  case ACTIVE_RANK_UPDATE: {
    const isUpdated = checkIsUpdated(action.activeRank, state.updatedList)
    const { counter } = state
    let { status, nextTime } = counter.accounted
    if (isUpdated !== counter.refreshed.status) {
      nextTime = getRefreshTime('account')
      status = true
      if (nextTime > Date.now()) {
        status = false
      }
    }
    return {
      ...state,
      counter: {
        ...counter,
        accounted: {
          ...counter.accounted,
          status,
          nextTime,
        },
        refreshed:{
          ...counter.refreshed,
          nextTime: getRefreshTime('next'),
          status: isUpdated,
        },
      },
    }
  }
  case RATE_UPDATED:
    if (action.rankNo) {
      const { rankNo } = action
      const rankStore = rankSelector(window.getStore()).rank
      if (!rankStore.activeRank[rankNo] || !rankStore.activeRank[rankNo].active) {
        return state
      }
      const updatedList = state.updatedList
      updatedList[rankNo] = true

      const { counter } = state
      const { refreshed, accounted } = counter
      refreshed.status = checkIsUpdated(rankStore.activeRank, updatedList)

      if (refreshed.status) {
        refreshed.nextTime = getRefreshTime('next')
        accounted.nextTime = getRefreshTime('account')
        if (accounted.nextTime > Date.now()) {
          accounted.status = false
        }
      }

      return {
        ...state,
        updatedList,
        counter: {
          ...counter,
          refreshed: {
            ...counter.refreshed,
            ...refreshed,
          },
          accounted: {
            ...counter.accounted,
            ...accounted,
          },
        },
      }
    } else {
      return state
    }
  case RATE_ACCOUNTED:
    return {
      ...state,
      ...accountTimeout(state),
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
