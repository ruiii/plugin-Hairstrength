import { join } from 'path-extra'
import { reduce } from 'lodash'

const { APPDATA_PATH, i18n } = window

export const __ = i18n["poi-plugin-senka-calc"].__.bind(i18n["poi-plugin-senka-calc"])

export function estimateSenka(exp, baseExp) {
  return (exp - baseExp) / 1428 - 0.0499
}

export function getRate(rankNo, obfsRate, memberId) {
  const MAGIC_R_NUMS = [ 8831, 1201, 1175, 555, 4569, 4732, 3779, 4568, 5695, 4619, 4912, 5669, 6569 ]
  const MAGIC_L_NUMS = [ 21, 58, 78, 29, 71, 32, 15, 64, 91, 91 ]
  const rate = obfsRate / MAGIC_R_NUMS[rankNo % 13] / MAGIC_L_NUMS[memberId % 10] - 73 - 18
  return rate > 0 ? rate : 0
}

export function getActiveRank() {
  //return [true, true, true, true, true]
  return [ 1, 5, 20, 100, 500 ]
  //window.getStore('ext["poi-plugin-senka-calc"].activeRank')
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
  if (!time) {
    return
  }

  const date = new Date(time)

  return isFilename
         ? `${date.getFullYear()}-${date.getMonth() + 1}`
         : `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`
}

export function getStatusStyle(flag) {
  return flag ? {} : { opacity: 0.4 }
}

export function dateToString(time) {
  if (!time) {
    return
  }
  const date = new Date(time)
  return `${date.getMonth() + 1}-${date.getDate()}`
}

export function checkIsUpdated(activeRank, updatedList) {
  return !reduce(activeRank, function(sum, active, i) {
    if (active && !updatedList[i]) sum++
    return sum
  }, 0)
}
