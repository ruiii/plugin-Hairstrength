import { createSelector } from 'reselect'
import { extensionSelectorFactory, basicSelector } from 'views/utils/selectors'

const REDUCER_EXTENSION_KEY = 'poi-plugin-senka-calc'

export const expSelector = createSelector(
  basicSelector,
  basic => ({ exp: basic.api_experience })
)

export const customSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ custom: state.custom })
)

export const historyShowSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ historyShow: state.setting.historyShow })
)

export const filterShowSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ filterShow: state.setting.filterShow })
)

export const customShowSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ customShow: state.setting.customShow })
)

export const historySelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ history: state.history })
)

export const historyDataSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => {
    return (state.history && state.history.historyData)
          ? { historyData: state.history.historyData }
          : { historyData: {} }
  }
)

export const rankSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ rank: state.rank })
)

export const updatedRateSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ updatedRate: state.rank.updatedRate })
)

export const timerSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ timer: state.timer })
)

export const baseDetailSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({
    custom: state.custom,
    rank: state.rank,
    timer: state.timer,
  })
)
