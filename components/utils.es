import { join } from 'path-extra'

const { APPDATA_PATH } = window

export function estimateSenka(base, now) {
  
}
export function getRate(no, rate, id) {
  const MAGIC = [2, 5, 7, 2, 7, 3, 1, 6, 9, 9]
  return rate / MAGIC[id % 10] / no
}

export function getActiveRank() {
  return window.getStore('ext["poi-plugin-senka-calc"].activeRank')
}

export function getMemberId() {
  return window.getStore('info.basic.api_member_id')
}

export function getFilePath(filename = false) {
  const userPath = join(APPDATA_PATH, 'senka-calc', getMemberId())
  return filename
         ? join(userPath, timeToString(getRefreshTime(), true))
         : userPath
}

export function getFinalTime(type) {
  let finalDate = new Date()
  finalDate.setUTCHours(finalDate.getUTCHours() + 9)    // mapping Tokyo(00:00) to UTC(00:00)
  finalDate.setUTCDate(1)                               // in case next month's day less than this month
  finalDate.setUTCMonth(finalDate.getUTCMonth() + 1)
  finalDate.setUTCDate(0)

  switch (type) {
  case 'eo':
    finalDate.setUTCHours(15)
    break;
  case 'exp':
    finalDate.setUTCHours(13)
    break;
  default:
    finalDate.setUTCHours(6)
  }

  finalDate.setUTCMinutes(0)
  finalDate.setUTCSeconds(0)
  finalDate.setUTCMilliseconds(0)

  return finalDate.getTime()
}

export function isLastDay() {
  const today = new Date().setUTCHours(today.getUTCHours() + 9)    // mapping Tokyo(00:00) to UTC(00:00)
  const tomorrow = new Date(today).setUTCDate(today.getUTCDate() + 1)

  return today.getUTCMonth() !== tomorrow.getUTCMonth()
}

export function getRefreshTime(type) {
  let date = new Date()
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
  return flag ? { opacity: 0.4 } : {}
}

export function dateToString(time) {
  if (!time) {
    return
  }
  const date = new Data(time)
  return `${date.getMonth() + 1}-${date.getDate()}`
}
