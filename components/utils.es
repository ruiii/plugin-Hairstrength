import fs from 'fs-extra'
import { join } from 'path-extra'
import CSON from 'cson'
import { reduce, uniqBy } from 'lodash'
import FileWriter from 'views/utils/fileWriter'

const { APPDATA_PATH, i18n } = window
export const storePath = 'plugin-senka'
export const __ = i18n["poi-plugin-senka-calc"].__.bind(i18n["poi-plugin-senka-calc"])

const fileWriter = new FileWriter()
export function saveHistoryData(historyData) {
  fileWriter.write(
    getFilePath(true),
    CSON.stringify(uniqBy(historyData, 'time'))
  )
}

export function loadHistoryData() {
  let historyData = []
  try {
    fs.ensureDirSync(getFilePath())
    historyData = CSON.parseCSONFile(getFilePath(true))
    if (!(historyData instanceof Array)) {
      historyData = []
    }
  } catch (e) {
    historyData = []
  }
  return historyData
}

export function estimateSenka(exp, baseExp) {
  return (exp - baseExp) / 1428 - 0.0499
}

export function getRate(rankNo, obfsRate, memberId) {
  const MAGIC_R_NUMS = [ 8831, 1201, 1175, 555, 4569, 4732, 3779, 4568, 5695, 4619, 4912, 5669, 6569 ]
  const MAGIC_L_NUMS = [ 20, 39, 33, 79, 29, 40, 25, 56, 54, 26 ]
  const rate = obfsRate / MAGIC_R_NUMS[rankNo % 13] / MAGIC_L_NUMS[memberId % 10] - 73 - 18
  return rate > 0 ? rate : 0
}

export function getMemberId() {
  return window.getStore('info.basic.api_member_id')
}

export function getUserNickname() {
  return window.getStore('info.basic.api_nickname')
}

export function getFilePath(filename = false) {
  const userPath = join(APPDATA_PATH, 'senka-calc', getMemberId().toString())
  return filename
         ? join(userPath, timeToString(getRefreshTime(), true))
         : userPath
}

export function getFinalTime(type) {
  const finalDate = new Date()
  finalDate.setUTCHours(finalDate.getUTCHours() + 9)    // mapping Tokyo(00:00) to UTC(00:00)
  finalDate.setUTCDate(1)                               // in case next month's day less than this month
  finalDate.setUTCMonth(finalDate.getUTCMonth() + 1)
  finalDate.setUTCDate(0)

  switch (type) {
  case 'eo':
    finalDate.setUTCHours(15)
    break
  case 'exp':
    finalDate.setUTCHours(13)
    break
  default:
    finalDate.setUTCHours(6)
  }

  finalDate.setUTCMinutes(0)
  finalDate.setUTCSeconds(0)
  finalDate.setUTCMilliseconds(0)

  return finalDate.getTime()
}

export function isLastDay() {
  const today = new Date()
  today.setUTCHours(today.getUTCHours() + 9)    // mapping Tokyo(00:00) to UTC(00:00)
  const tomorrow = new Date(today)
  tomorrow.setUTCDate(today.getUTCDate() + 1)

  return today.getUTCMonth() !== tomorrow.getUTCMonth()
}

export function getRefreshTime(type) {
  const date = new Date()
  const hour = date.getUTCHours()
  const offset =
    type === 'next' ? 12 :
    type === 'account' ? 12 - 1 :
    0
  const freshHour =
    hour < 6 ? -6 :
    hour < 18 ? 6 :
    18

  date.setUTCHours(freshHour + offset)
  date.setUTCMinutes(0)
  date.setUTCSeconds(0)
  date.setUTCMilliseconds(0)

  return date.getTime()
}

export function timeToString(time, isFilename = false) {

  const date = new Date(time || 0)

  return isFilename
         ? `${date.getFullYear()}-${date.getMonth() + 1}`
         : `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`
}

export function getStatusStyle(flag) {
  return flag ? {} : { opacity: 0.4 }
}

export function dateToString(time) {
  if (!time) {
    time = 0
  }
  const date = new Date(time)
  return `${date.getMonth() + 1}-${date.getDate()}`
}

export function checkIsUpdated(updatedDetail, updatedList) {
  return !reduce(updatedDetail, function(sum, data, key) {
    if (data.active && !updatedList[key]) sum++
    return sum
  }, 0)
}

export function accountTimeout(timerState) {
  let { finalTimes, nextAccountTime } = timerState
  let { accounted, expAccounted, eoAccounted } = timerState
  let { accountString } = timerState

  const now = Date.now()
  // some logic to determine account Stage
  if (now >= finalTimes.eo) {
    eoAccounted = true
    accounted = true
  } else if (now >= finalTimes.exp) {
    expAccounted = true
    accountString = __('EO map final time')
    nextAccountTime = finalTimes.eo
  } else if (now >= finalTimes.refresh) {
    accountString = __('Normal map final time')
    nextAccountTime = finalTimes.exp
  } else if (now >= nextAccountTime) {
    accounted = true
  } else {
    accountString = __('Account time')
    accounted = false
  }

  return {
    nextAccountTime,
    accounted,
    expAccounted,
    eoAccounted,
    accountString,
  }
}

export function refreshTimeout(timerState) {
  let { isTimeUp, isUpdated, updatedList } = timerState
  let { accounted, expAccounted, eoAccounted } = timerState
  let { accountString } = timerState
  let { nextRefreshTime, finalTimes, nextAccountTime } = timerState

  if (!isTimeUp) {
    updatedList = [false, false, false, false, false]
    isUpdated = false
  } else {
    nextRefreshTime = getRefreshTime('next')
    nextAccountTime = getRefreshTime('account')
    accounted = false
    accountString = __('Account time')
    if (eoAccounted) {
      finalTimes = {
        refresh: getFinalTime(),
        exp: getFinalTime('exp'),
        eo: getFinalTime('eo'),
      }
      expAccounted = false
      eoAccounted = false
    }
    if (Date.now() >= finalTimes.refresh) {
      accountString = __('Normal map final time')
      nextAccountTime = finalTimes.exp
    }
  }

  return {
    isUpdated,
    updatedList,
    accounted,
    expAccounted,
    eoAccounted,
    nextAccountTime,
    nextRefreshTime,
    finalTimes,
    accountString,
    isTimeUp: !isTimeUp,
  }
}
