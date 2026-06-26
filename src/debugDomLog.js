const MAX_LINES = 5
const pendingEntries = []
let logContainer = null
const isDomLogEnabled = new URL(window.location.href).searchParams.get("log") === "true"

const stringifyPayload = (payload) => {
  if (payload == null) {
    return ""
  }

  if (typeof payload === "string") {
    return payload
  }

  try {
    return JSON.stringify(payload)
  } catch {
    return String(payload)
  }
}

const createContainer = () => {
  if (!isDomLogEnabled) {
    return
  }

  if (!document.body || logContainer) {
    return
  }

  logContainer = document.createElement("div")
  logContainer.id = "dom-debug-log"
  logContainer.style.cssText =
    "position:fixed;left:8px;right:8px;bottom:8px;max-height:132px;overflow-y:auto;overflow-x:hidden;z-index:10001;background:rgba(0,0,0,0.78);color:#d1fae5;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:8px;font:12px/1.35 Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-word;"
  document.body.appendChild(logContainer)

  while (pendingEntries.length > 0) {
    appendLine(pendingEntries.shift())
  }
}

const appendLine = (line) => {
  if (!logContainer) {
    pendingEntries.push(line)
    return
  }

  const row = document.createElement("div")
  row.textContent = line
  logContainer.appendChild(row)

  while (logContainer.childElementCount > MAX_LINES) {
    logContainer.removeChild(logContainer.firstElementChild)
  }

  logContainer.scrollTop = logContainer.scrollHeight
}

if (isDomLogEnabled) {
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", createContainer, { once: true })
  } else {
    createContainer()
  }
}

export const domLog = (message, payload) => {
  if (!isDomLogEnabled) {
    return
  }

  const time = new Date().toISOString().slice(11, 19)
  const serializedPayload = stringifyPayload(payload)
  const line = serializedPayload ? `[${time}] ${message} ${serializedPayload}` : `[${time}] ${message}`

  createContainer()
  appendLine(line)
}
