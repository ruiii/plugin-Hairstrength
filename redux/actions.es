
export const ACTIVE_RANK_UPDATE = '@@ACTIVE_RANK_UPDATE'
export const RATE_HISTORY_SHOW = '@@RATE_HISTORY_SHOW'
export const RATE_CUSTOM_SHOW = '@@RATE_CUSTOM_SHOW'
export const RATE_FILTER_SHOW = '@@RATE_FILTER_SHOW'
export const RATE_HISTORY_UPDATE = '@@RATE_HISTORY_UPDATE'
export const RATE_TIME_UP = '@@RATE_TIME_UP'
export const RATE_UPDATED = '@@RATE_UPDATED'
export const RATE_ACCOUNTED = '@@RATE_ACCOUNTED'
export const RATE_CUSTOM_CHANGE = '@@RATE_CUSTOM_CHANGE'

export function activeRankChange(activeRank) {
  return {
    type: ACTIVE_RANK_UPDATE,
    activeRank,
  }
}

export function showHistory() {
  return {
    type: RATE_HISTORY_SHOW,
  }
}

export function showCustom() {
  return {
    type: RATE_CUSTOM_SHOW,
  }
}

export function showRankFilter() {
  return {
    type: RATE_FILTER_SHOW,
  }
}

export function rateTimeUp() {
  return {
    type: RATE_TIME_UP,
  }
}

export function rateUpdated(rankNo) {
  return {
    type: RATE_UPDATED,
    rankNo,
  }
}

export function rateAccounted() {
  return {
    type: RATE_ACCOUNTED,
  }
}

export function customChange(custom) {
  return {
    type: RATE_CUSTOM_CHANGE,
    custom,
  }
}

export function storeHistoryData() {
  return {
    type: RATE_HISTORY_UPDATE,
  }
}
