
export const ACTIVE_RANK_UPDATE = 'ACTIVE_RANK_UPDATE'
export const HISTORY_SHOW = 'HISTORY_SHOW'

export function activeRankChange(activeRank) {
  return {
    type: ACTIVE_RANK_UPDATE,
    activeRank,
  }
}

export function showHistory(show) {
  return {
    type: HISTORY_SHOW,
    show
  }
}
