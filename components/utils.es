import Promise from 'bluebird'
import fs from 'fs-extra'
import { join } from 'path-extra'
import CSON from 'cson'
import { reduce, uniqBy, forEach, pick, omit } from 'lodash'
import FileWriter from 'views/utils/file-writer'

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

export function pickStoreData(storeData, initialData) {
  const pickedData = {
    ...pick(storeData, Object.keys(initialData)),
    ...omit(initialData, Object.keys(storeData)),
  }
  forEach(pickedData, (value, key) => {
    if (Object.prototype.toString.call(value) !== Object.prototype.toString.call(initialData[key])) {
      pickedData[key] = initialData[key]
    }
  })
  return pickedData
}

export function estimateSenka(exp, baseExp) {
  return (exp - baseExp) / 1428 - 0.0499
}

export const requestAsyncMagicNums = async () => {
  const requestAsync = Promise.promisify(
    Promise.promisifyAll(require('request')),
    { multiArgs: true }
  )
  let response
  let body
  try {
    [response, body] = await requestAsync('https://rui.ai/poi/data/tutu.json', {
      method: 'GET',
      json: true,
    })
  } catch (e) {
    error(e.stack)
    console.warn('Check update error.')
  }
  localStorage.setItem(`${storePath}.MAGIC_NUMS`, JSON.stringify(body))
  return body
}

export function getRate(rankNo, obfsRate, memberId, MAGIC_NUMS) {
  const [ MAGIC_R_NUMS, MAGIC_L_NUMS ] = MAGIC_NUMS

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

export function getFinalTime(type, nextMonth) {
  const offset = nextMonth ? 2 : 1
  const finalDate = new Date()
  finalDate.setUTCHours(finalDate.getUTCHours() + 9)    // mapping Tokyo(00:00) to UTC(00:00)
  finalDate.setUTCDate(1)                               // in case next month's day less than this month
  finalDate.setUTCMonth(finalDate.getUTCMonth() + offset)
  finalDate.setUTCDate(0)

  switch (type) {
  case 'pm':
    finalDate.setUTCHours(13)
    break
  case 'am':
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

export function isNewMonth(time) {
  const updatedDay = new Date(time)
  const today = new Date()
  today.setUTCHours(today.getUTCHours() + 9)
  updatedDay.setUTCHours(updatedDay.getUTCHours() + 9)

  return today.getUTCMonth() !== updatedDay.getUTCMonth()
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

// return true if all true
export function checkIsUpdated(activeRank, updatedList) {
  return !reduce(activeRank, function(sum, data, key) {
    if (data.active && !updatedList[key]) sum++
    return sum
  }, 0)
}

export function accountTimeout(timerState) {
  const { counter, updateTime, finalTimes } = timerState
  let { status, str, nextTime } = counter.accounted

  const now = Date.now()
  // some logic to determine account Stage
  if (now >= finalTimes.pm) {
    status = true
  } else if (now >= finalTimes.am) {
    str = __('Normal map final time')
    nextTime = finalTimes.pm
  } else if (now >= updateTime + 11 * 3600 * 1000) {
    status = true
  } else {
    str = __('Account time')
    status = false
  }

  return {
    counter: {
      ...counter,
      accounted: {
        ...counter.accounted,
        status,
        str,
        nextTime,
      },
    },
  }
}

export function refreshTimeout(timerState) {
  const { updatedList, counter, isTimeUp } = timerState
  let { finalTimes } = timerState
  const { accounted, refreshed } = counter

  if (!isTimeUp) {
    forEach(updatedList, (value, key) => {
      updatedList[key] = false
    })
  } else {
    refreshed.nextTime = getRefreshTime('next')
    accounted.nextTime = getRefreshTime('account')
    accounted.status = false
    accounted.str = __('Account time')
    if (Date.now() >= finalTimes.pm) {
      finalTimes = {
        am: getFinalTime('am', true),
        pm: getFinalTime('pm', true),
      }
    } else if (Date.now() >= finalTimes.am) {
      accounted.str = __('Normal map final time')
      accounted.nextTime = finalTimes.pm
    }
  }

  return {
    updatedList,
    finalTimes,
    isTimeUp: !isTimeUp,
    counter: {
      ...counter,
      accounted,
      refreshed,
    },
  }
}
