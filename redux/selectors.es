import { createSelector } from 'reselect'
import { extensionSelectorFactory } from 'views/utils/selectors'

const REDUCER_EXTENSION_KEY = 'poi-plugin-senka-calc'

export const historyStatusSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ historyShow: state.history.historyShow || false })
)

export const historyDataSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ historyData: state.history.historyData || [] })
)

export const rankSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ rank: state.rank || [] })
)

// export const activeRankSelector = createSelector(
//   extensionSelectorFactory(REDUCER_EXTENSION_KEY),
//   state => ({ activeRank: state.rank.activeRank || [] })
// )
//
// export const updateStatusSelector = createSelector(
//   extensionSelectorFactory(REDUCER_EXTENSION_KEY),
//   state => ({ updated: state.rank.updated || false })
// )
//
// export const rankListSelector = createSelector(
//   extensionSelectorFactory(REDUCER_EXTENSION_KEY),
//   state => ({ rankList: state.rank.rankList || [] })
// )
//
// export const rateListSelector = createSelector(
//   extensionSelectorFactory(REDUCER_EXTENSION_KEY),
//   state => ({ rateList: state.rank.rateList || [] })
// )
//
// export const rateListSelector = createSelector(
//   extensionSelectorFactory(REDUCER_EXTENSION_KEY),
//   state => ({ rateList: state.rank.rateList || [] })
// )
//
// export const updatedListSelector = createSelector(
//   extensionSelectorFactory(REDUCER_EXTENSION_KEY),
//   state => ({ updatedList: state.rank.updatedList || [] })
// )
