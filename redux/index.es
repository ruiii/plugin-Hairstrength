import { combineReducers } from 'redux'
import { observer, observe } from 'redux-observers'
import { store } from 'views/createStore'
import { basicSelector } from 'views/utils/selectors'
import { getRate, getMemberId, getFilePath } from '../components/utils'
import { ACTIVE_RANK_UPDATE, HISTORY_SHOW, HISTORY_HIDE } from './actions'

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
  api: 'mxltvkpyuklh'
  api_no: 'api_mxltvkpyuklh',
  api_rate: 'api_wuhnhojjxmke',
  api_nickname: 'api_mtjmdcwtvhdr'
}
const emptyRank = {
  api_no: -1,
  api_rate: -1,
  rate: -1
}

function rankListReducer(state = emptyRank, { type, body, postBody }) {
  switch (type) {
  // case '@@Response/kcsapi/api_req_ranking/getlist':
  case `@@Response/kcsapi/api_req_ranking/${apiMap.api}`
    // const { api_no, api_rate } = body
    const api_no = body[apiMap.api_no]
    const api_rate = body[apiMap.api_rate]

    if (!getActiveRank().indexOf(api_no)) {
      return state
    }

    const memberId = getMemberId()
    const rate = getRate(api_no, api_rate, memberId)

    return {
      ...state,
      api_no,
      api_rate,
      rate
    }
  }
}

// [1, 5, 20, 100, 500]
const activeRank = [
  true,
  true,
  true,
  true,
  true
]

function activeRankReducer(state = activeRank, action) {
  switch (action.type) {
  case ACTIVE_RANK_UPDATE:
    return action.activeRank
  }
  return state
}

function histroyReducer(state = { historyShow: false }, action) {
  switch (action.type) {
  case HISTORY_SHOW:
    return {
      historyShow: action.show
    }
  }
  return state
}

const initialState = {
  plugin_senka_calc: {

  }
  memberId: -1,
  nickname: ''
}

function rootReducer(state = initialState, action) {
  return {
    plugin_senka_calc: initialState
  }
}

const detailPath = 'plugin-senka-detail'
const customPath = 'plugin-senka-custom'
const storePath = state.plugin.poi_plugin_senka_calc
const dataPath = join(APPDATA_PATH, 'senka-calc')

observe(store, [observer(
  (state) =>
    storePath.detail,
  (dispatch, current, previous) =>
    localStorage.setItem(detailPath, JSON.stringify(current))
)])

observe(store, [observer(
  (state) =>
    storePath.custom,
  (dispatch, current, previous) =>
    localStorage.setItem(customPath, JSON.stringify(current))
)])

// setImmediate dispatch
function getHistoryData(state, action) {
  if (!state) {
    const historyData = readJsonSync(getFilePath(true))
    return {
      historyData: historyData,
    }
  }
  return state
}

function saveHistoryData(historyData) {
  fileWriter.write(getFilePath(true), CSON.stringify({
    ...historyData
  }))
}
observe(store, [observer(
  (state) =>
    storePath.historyData
  (dispatch, current, previous) =>
    saveHistoryData(current)
)])

export default combineReducers({
  root: rootReducer,
  rankList: rankListReducer,
  activeRank: activeRankReducer
})
