import { createSelector } from 'reselect'
import { extensionSelectorFactory } from 'views/utils/selectors'

const REDUCER_EXTENSION_KEY = 'poi-plugin-senka-calc'

export const initStatusSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ init: (state.initStatus || {init: false}).init })
)

export const expSelector = (state) => ({ exp: state.info.basic.api_experience })

export const userInitInfoSelector = (state) => {
  const { api_nickname, api_rank } = state.info.basic
  return { api_nickname, api_rank }
}

export const customSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ custom: state.custom })
)

export const settingSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ setting: state.setting })
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
  state => ({ historyData: state.history.historyData })
)

export const rankSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ rank: state.rank })
)

export const updatedRateSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ updatedRate: state.rank.updatedDetail.rate.value })
)

export const updateTimeSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ updateTime: state.timer.updateTime })
)

export const userDetailInitSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ updatedDetail: this.state.rank.updatedDetail })
)

export const eoRateSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ eoRate: state.rank.eoRate })
)

export const timerSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ timer: state.timer })
)

export const timerCounterSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ counter: state.timer.counter })
)

export const activeRankSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({ activeRank: this.state.rank.activeRank })
)

export const updateTimerDetailSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => {
    const { updatedList, counter } = state.timer
    return { updatedList, isUpdated: counter.refreshed.status }
  }
)

export const baseDetailSelector = createSelector(
  extensionSelectorFactory(REDUCER_EXTENSION_KEY),
  state => ({
    custom: state.custom,
    rank: state.rank,
    timer: state.timer,
  })
)
