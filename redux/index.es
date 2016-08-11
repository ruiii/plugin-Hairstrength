import fs from 'fs-extra'
import { combineReducers } from 'redux'
import { observer, observe } from 'redux-observers'
import { forEach } from 'lodash'
import { store } from 'views/createStore'
import FileWriter from 'views/utils/fileWriter'
import CSON from 'cson'
import {
  baseDetailSelector,
  historyDataSelector,
  timerSelector,
  rankSelector,
} from './selectors'
import {
  getRate,
  getMemberId,
  getFilePath,
  getFinalTime,
  getRefreshTime,
  getActiveRank,
  getUserNickname,
  checkIsUpdated,
  __,
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
  storeHistoryData,
} from './actions'

const fileWriter = new FileWriter()

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
const storePath = 'plugin-senka'

export function observeInit() {

  // run after plugin loaded
  observe(store, [observer(
    // (state) =>
    //   get(state, path + '.baseDetail'),
    baseDetailSelector,
    (dispatch, current, previous) => {
      localStorage.setItem(storePath, JSON.stringify(current))
    }
  )])

  observe(store, [observer(
    rankSelector,
    (dispatch, current, previous) => {
      if (current.rank.updatedTime !== previous.rank.updatedTime) {
        dispatch(storeHistoryData())
      }
    }
  )])

  observe(store, [observer(
    // (state) =>
    //   get(state, path + '.history.historyData'),
    historyDataSelector,
    (dispatch, current, previous) => {
      saveHistoryData(current.historyData)
    }
  )])
}

function saveHistoryData(historyData) {
  fileWriter.write(
    getFilePath(true),
    CSON.stringify(historyData)
  )
}

const baseDetail = {
  custom: {
    baseExp: 0,
    baseRate: 0,
    enable: false,
  },
  rank: {
    exRate: [0, 0],
    activeRank: [true, true, true, true, true],
    rateList: [0, 0, 0, 0, 0],
    deltaList: [0, 0, 0, 0, 0],
    updatedRate: 0,
    updatedRank: 0,
    rateDelta: 0,
    rankDelta: 0,
    updatedTime: 0,
  },
  timer: {
    updateTime: -1,
    updatedList: [false, false, false, false, false],
  },
  setting: {
    historyShow: false,
    customShow: false,
    filterShow: false,
  },
}

function initReducer() {
  // historyData
  let historyData
  try {
    fs.ensureDirSync(getFilePath())
    historyData = CSON.parseCSONFile(getFilePath(true))
    if (!(historyData instanceof Array)) {
      historyData = []
    }
  } catch (e) {
    historyData = []
  }
  // baseDetail
  let storeData = getLocalStorage()
  if (Object.keys(storeData).length === 0) {
    storeData = baseDetail
  } else {
    for (const k in baseDetail) {
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
  } else if (now >= storeData.timer.updateTime + 11 * 3600 * 1000) {
    storeData.rank.exRate[0] = storeData.rank.exRate[1]
    storeData.rank.exRate[1] = 0
    accounted = true
  } else {
    accountString = __('Account time')
    accounted = false
  }
  // refresh timer
  const refreshString = __("Refresh time")
  let nextRefreshTime = getRefreshTime()
  let updatedList = [true, true, true, true, true]
  let isTimeUp = true
  // ???
  const _refreshTime = nextRefreshTime
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
  const isUpdated = checkIsUpdated(storeData.rank.activeRank, updatedList)

  return {
    custom: {
      ...storeData.custom,
    },
    rank: {
      ...storeData.rank,
    },
    history: {
      historyData,
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
      isTimeUp,
      isUpdated,
    },
    setting: {
      ...storeData.setting,
    },
  }
}

const baseState = initReducer()

function customReducer(state = baseState.custom, action) {
  switch (action.type) {
  case RATE_CUSTOM_CHANGE:
    return {
      ...state,
      ...action.custom,
    }
  }
  return state
}

function rankReducer(state = baseState.rank, action) {
  if (action.type.includes(apiMap.api)) {
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

function historyReducer(state = baseState.history, action) {
  switch (action.type) {
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

// export const emptyTimer = {
//   accounted: false,
//   accountTimeString: '',
//   nextAccountTime: -1,
//   refreshTimeString: '',
//   nextRefreshTime: -1
// }
function timerReducer(state = baseState.timer, action) {
  switch (action.type) {
  /* case `@@Response/kcsapi/api_req_ranking/${apiMap.api}`:
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
    break */
  case RATE_TIME_UP:
    return {
      ...state,
      isTimeUp: true,
      isUpdated: false,
      accounted: false,
      updatedList: baseDetail.timer.updatedList,
      nextAccountTime: getRefreshTime('account'),
    }
  case ACTIVE_RANK_UPDATE: {
    const isUpdated = checkIsUpdated(action.activeRank, state.updatedList)
    if (isUpdated !== state.isUpdated) {
      return {
        ...state,
        isUpdated,
        nextRefreshTime: getRefreshTime('next'),
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
      let nextRefreshTime = state.nextRefreshTime
      if (isUpdated) {
        nextRefreshTime = getRefreshTime('next')
      }

      return {
        ...state,
        updatedList,
        isUpdated,
        nextRefreshTime,
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

function settingReducer(state = baseState.setting, action) {
  switch (action.type) {
  case RATE_HISTORY_SHOW:
    return {
      ...state,
      historyShow: !state.historyShow,
      customShow: false,
      filterShow: false,
    }
  case RATE_CUSTOM_SHOW:
    return {
      ...state,
      historyShow: false,
      customShow: !state.customShow,
      filterShow: false,
    }
  case RATE_FILTER_SHOW:
    return {
      ...state,
      historyShow: false,
      customShow: false,
      filterShow: !state.filterShow,
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
  custom: customReducer,
  setting: settingReducer,
})
