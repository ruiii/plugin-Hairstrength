import { combineReducers } from 'redux'

/*
*    api_req_ranking/getlist	：ランキング
*    	api_count			：最大読み込み可能数？
*    	api_page_count		：最大ページ数
*    	api_disp_page		：表示中のページ
*    	api_list			：提督リスト
******************************************
*    		api_no			：順位
*    		api_rank		：階級
*    		api_nickname	：提督名
*    		api_comment		：コメント
*    		api_rate		：戦果　暗号化されている
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

const emptyRank = {
  api_no: -1,
  api_rate: -1,
  rate: -1,
  api_nickname: ''
}

function rankListReducer(state = emptyRank, { type, body, postBody }) {
  switch (type) {
  case '@@Response/kcsapi/api_req_ranking/getlist':
    const { api_no, api_rate, api_nickname } = body
    if (!getActiveRank().indexOf(api_no)) {
      return state
    }
    const memberId = getMemberId()
    const rate = getRate(api_no, api_rate, memberId)
    return {
      ...state,
      api_no,
      api_rate,
      rate,
      api_nickname
    }
  }
}

const activeRank = {
  '1': false,
  '5': false,
  '20': false,
  '100': false,
  '500': false
}

function activeRankReducer(state = activeRank, action) {

}

const initialState = {
  memberId: -1,
  nickname: ''
}

function rootReducer(state = initialState, action) {

}

export default combineReducers({
  root: rootReducer,
  rankList: rankListReducer,
  activeRank: activeRankReducer
})
