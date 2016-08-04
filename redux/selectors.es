import { createSelector } from 'reselect'
import { extensionSelectorFactory } from 'views/utils/selectors'

const REDUCER_EXTENSION_KEY = 'poi-plugin-senka-calc'

export const expSelector = (state) => ({ exp: state.info.basic.api_experience })

export const customSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ custom: state.custom || { baseExp: 0 } })
)


export const historySelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ history: state.history || { historyShow: false, historyData: [] } })
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
  state => ({ rank: state.rank || [] })
)

const emptyAccount = {
  accounted: false,
  accountTimeString: '',
  nextAccountTime: -1
}
export const accountSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ account: state.account || emptyAccount })
)

const emptyRefresh = {
  refreshTimeString: '',
  nextRefreshTime: -1
}
export const refreshSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ refresh: state.refresh || { baseExp: 0 } })
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
