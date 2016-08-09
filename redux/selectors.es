import { createSelector } from 'reselect'
import { extensionSelectorFactory, basicSelector } from 'views/utils/selectors'

const REDUCER_EXTENSION_KEY = 'poi-plugin-senka-calc'

export const expSelector = createSelector(
  basicSelector,
  basic => ({ exp: basic.api_experience })
)

export const customSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => (state.custom)
)


export const historySelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ history: state.history })
)
// export const historyStatusSelector = createSelector(
//   extensionSelectorFactory(REDUCER_EXTENSION_KEY),
//   state => ({ historyShow: state.history.historyShow || false })
// )
// export const historyDataSelector = createSelector(
//   extensionSelectorFactory(REDUCER_EXTENSION_KEY),
//   state => ({ historyData: state.history.historyData || [] })
// )

export const rankSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ rank: state.rank })
)

export const timerSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ timer: state.timer })
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
