export const ACTION_TARGET_WAIT_MS = 10000
const ACTION_TARGET_RETRY_MS = 100

export function getFailOnMissingActionCode(
  selector,
  failure,
  waitMs = ACTION_TARGET_WAIT_MS,
) {
  return {
    func: (selector, attempts, retryMs) => {
      const find = (remaining) => {
        if (document.querySelector(selector) !== null) {
          return Promise.resolve(true)
        }
        if (remaining === 0) {
          return Promise.resolve(false)
        }
        return new Promise((resolve) => {
          window.setTimeout(() => resolve(find(remaining - 1)), retryMs)
        })
      }
      return find(attempts)
    },
    args: [
      selector,
      Math.ceil(waitMs / ACTION_TARGET_RETRY_MS),
      ACTION_TARGET_RETRY_MS,
    ],
    resultFunc: (result) => {
      if (result === true) {
        return result
      }
      throw new Error(failure)
    },
  }
}
