import { join } from 'path-extra'
import fs from 'fs-extra'
import { combineReducers } from 'redux'
import { observer, observe } from 'redux-observers'
import { get, set, forEach } from 'lodash'
import { store } from 'views/createStore'
import { basicSelector } from 'views/utils/selectors'
import { baseDetailSelector, historyDataSelector, timerSelector } from './selectors'
import {
  getRate,
  getMemberId,
  getFilePath,
  getFinalTime,
  getRefreshTime,
  getActiveRank,
  getUserNickname
} from '../components/utils'
import {
  ACTIVE_RANK_UPDATE,
  RATE_HISTORY_SHOW,
  HISTORY_HIDE,
  RATE_TIME_UP,
  RATE_UPDATED,
  RATE_ACCOUNTED,
  RATE_CUSTOM_CHANGE
} from './actions'
const REDUCER_EXTENSION_KEY = 'poi-plugin-senka-calc'
const { i18n } = window
const __ = i18n["poi-plugin-senka-calc"].__.bind(i18n["poi-plugin-senka-calc"])
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

// /kcsapi/api_get_member/record
// /kcsapi/api_req_ranking/getlist

// /kcsapi/api_port/port
// /kcsapi/api_req_mission/result
// /kcsapi/api_req_practice/battle_result
// /kcsapi/api_req_sortie/battleresult
// /kcsapi/api_req_combined_battle/battleresult
// /kcsapi/api_req_map/next

const apiMap = {
  api: 'mxltvkpyuklh',
  api_no: 'api_mxltvkpyuklh',
  api_rate: 'api_wuhnhojjxmke',
  api_nickname: 'api_mtjmdcwtvhdr'
}
const emptyRank = {
  api_no: -1,
  api_rate: -1,
  rate: -1
}

const storePath = 'plugin-senka'
const storeItems = ['detail', 'custom']
const dataPath = join(APPDATA_PATH, 'senka-calc')

export function observeInit() {

  // run after plugin loaded
  observe(store,[observer(
    // (state) =>
    //   get(state, path + '.baseDetail'),
    baseDetailSelector,
    (dispatch, current, previous) => {
      localStorage.setItem(storePath, JSON.stringify(current))
    }
  )])

  observe(store, [observer(
    // (state) =>
    //   get(state, path + '.history.historyData'),
    historyDataSelector,
    (dispatch, current, previous) => {
      saveHistoryData(current)
    }
  )])
}

function saveHistoryData(historyData) {
  fileWriter.write(
    getFilePath(true),
    CSON.stringify({
      ...historyData
    })
  )
}

const baseDetail = {
  custom: {
    baseExp: 0,
    baseRate: 0,
    enable: false
  },
  rank: {
    exRate: [0, 0],
    activeRank: [true, true, true, true, true],
    rateList: [0, 0, 0, 0, 0],
    deltaList: [0, 0, 0, 0, 0],
    updatedRate: 0,
    updatedRank: 0,
    rateDelta: 0,
    rankDelta: 0
  },
  timer: {
    updateTime: -1
  }
}

function initReducer() {
  // historyData
  let historyData
  try {
    fs.ensureDirSync(getFilePath())
    historyData = fs.readJsonSync(getFilePath(true))
  } catch (e) {
    historyData = []
  }
  // baseDetail
  let storeData = getLocalStorage()
  if (Object.keys(storeData).length === 0) {
    storeData = baseDetail
  } else {
    for (let k in baseDetail) {
      if (!storeData[k] || Object.keys(storeData[k]).length === 0) {
        storeData[k] = baseDetail[k]
      }
    }
  }
  // accounted timer
  let accounted = false
  let eoAccounted = false
  let expAccounted = false
  let accountString = ''
  let nextAccountTime = getRefreshTime('account')

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
  } else if (now >= storeData.updateTime + 11 * 3600 * 1000) {
    storeData.rank.exRate[0] = storeData.rank.exRate[1]
    storeData.rank.exRate[1] = 0
    accounted = true
  } else {
    accountString = __('Account time')
    accounted = false
  }
  // refresh timer
  let refreshString = __("Refresh time")
  let nextRefreshTime = getRefreshTime()
  let updatedList = [true, true, true, true, true]
  let isTimeUp = true
  // ???
  let _refreshTime = nextRefreshTime
  // if not refreshed, mark as timeup
  if (!storeData.rank
      || (storeData.timer && storeData.timer.updateTime !== _refreshTime)) {
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

  return {
    custom: {
      ...storeData.custom
    },
    rank: {
      ...storeData.rank
    },
    history: {
      historyShow: false,
      historyData
    },
    timer: {
      ...storeData.timer,
      accounted,
      eoAccounted,
      expAccounted,
      accountString,
      nextAccountTime,
      refreshString,
      nextRefreshTime,
      updatedList,
      isTimeUp
    }
  }
}

let baseState = initReducer()
console.log('baseState', baseState)

function customReducer(state = baseState.custom, action) {
  switch (action.type) {
  case RATE_CUSTOM_CHANGE:
    return {
      ...state,
      ...action.custom
    }
  }
  return state
}

function rankReducer(state = baseState.rank, action) {
  switch (action.type) {
  // case '@@Response/kcsapi/api_req_ranking/getlist':
  case `@@Response/kcsapi/api_req_ranking/${apiMap.api}`:
    // const { api_no, api_rate } = body
    const { type, body, postBody } = action

    if (!body.api_list) {
      return state
    }

    const memberId = getMemberId()
    const nickname = getUserNickname()
    const timer = timerSelector(window.getStore()).timer
    let rateList = [ ...state.rateList ]
    let deltaList = [ ...state.deltaList ]
    let { updatedRate, updatedRank, rateDelta, rankDelta } = state
    let updated = false

    forEach(body.api_list, (data) => {

      const api_nickname = data[apiMap.api_nickname]
      const api_no = data[apiMap.api_no]
      const api_rate = data[apiMap.api_rate]

      if (api_nickname === nickname && timer.isTimeUp) {
        updatedRate = getRate(api_no, api_rate, memberId)
        updatedRank = api_no
        rateDelta = updatedRate - state.updatedRate
        rankDelta = updatedRank - state.updatedRank
        let historyData = historyDataSelector()
        updated = true
      }

      const idx = getActiveRank().indexOf(api_no)

      if (idx < 0) {
        return
      }

      updated = true
      rateList[idx] = getRate(api_no, api_rate, memberId)
      deltaList[idx] = rateList[idx] - state.rateList[idx]
      // setImmediate(() => {
      //   dispatch(rateUpdated(api_no))
      // });
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
      rankDelta
    }

  case ACTIVE_RANK_UPDATE:
    // [1, 5, 20, 100, 500]
    // const activeRank = [true, true, true, true, true]
    return {
      ...state,
      activeRank: action.activeRank
    }
  }
  return state
}

function historyReducer(state = baseState.history, action) {
  switch (action.type) {
  case RATE_HISTORY_SHOW:
    return {
      ...state,
      historyShow: action.show
    }
  }
  return state
}

// export const emptyTimer = {
//   accounted: false,
//   accountTimeString: '',
//   nextAccountTime: -1,
//   refreshTimeString: '',
//   nextRefreshTime: -1
// }
function timerReducer(state = baseState.timer, action) {
  switch (action.type) {
  case `@@Response/kcsapi/api_req_ranking/${apiMap.api}`:
    const { type, body, postBody } = action

    if (body.api_list) {
      let updatedList = [ ...state.updatedList ]
      let updated = false

      forEach(body.api_list, (data) => {
        const api_no = data[apiMap.api_no]
        const idx = getActiveRank().indexOf(api_no)

        updated = true
        updatedList[idx] = true
      })

      if (updated) {
        return {
          ...state,
          updatedList
        }
      }
    }
    break;
  case RATE_TIME_UP:
    return {
      ...state,
      isTimeUp: true
    }
  case RATE_UPDATED:
    if (action.rankNo) {
      const idx = getActiveRank().indexOf(action.rankNo)
      let updatedList = [ ...state.updatedList ]
      updatedList[action.idx] = true
      return {
        ...state,
        updatedList
      }
    }
    break;
  case RATE_ACCOUNTED:
    return {
      ...state,
      accounted: true
    }
  }
  return state
}

function getLocalStorage() {
  try {
    return JSON.parse(localStorage.getItem(storePath) || '{}')
  } catch (e) {
    return {}
  }
}

export const reducer = combineReducers({
  rank: rankReducer,
  history: historyReducer,
  timer: timerReducer,
  custom: customReducer
})
