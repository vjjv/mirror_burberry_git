import { domLog } from "./debugDomLog"

const LENS_REMOTE_API_EVENT = "lens-remote-api"

const FILTER_SELECTION_EVENT = "analytics:filter_selection"
const CAPTURE_BUTTON_EVENT = "analytics:capture_button"
const SHARE_SAVE_EVENT = "analytics:share_save"

const SKU_ID_PLACEHOLDER_1 = "SKU_ID_PLACEHOLDER_1"
const SKU_ID_PLACEHOLDER_2 = "SKU_ID_PLACEHOLDER_2"
const SKU_ID_PLACEHOLDER_3 = "SKU_ID_PLACEHOLDER_3"
const SKU_ID_PLACEHOLDER_4 = "SKU_ID_PLACEHOLDER_4"

let currentSKU = SKU_ID_PLACEHOLDER_1
let currentPickerValue = 1

const resolveSkuFromPicker = (pickerValue) => {
  switch (Number(pickerValue)) {
    case 1:
      return SKU_ID_PLACEHOLDER_1
    case 2:
      return SKU_ID_PLACEHOLDER_2
    case 3:
      return SKU_ID_PLACEHOLDER_3
    case 4:
      return SKU_ID_PLACEHOLDER_4
    default:
      return currentSKU
  }
}

const emitAnalyticsEvent = (eventName, detail) => {
  window.dispatchEvent(new CustomEvent(eventName, { detail }))
  domLog(`[Analytics] ${eventName}`, detail)
}

window.ANALYTICS_EVENTS = {
  FILTER_SELECTION_EVENT,
  CAPTURE_BUTTON_EVENT,
  SHARE_SAVE_EVENT,
}

window.addEventListener(LENS_REMOTE_API_EVENT, (event) => {
  const detail = event?.detail ?? {}
  const action = detail?.action
  const pickerValue = Number(detail?.value)

  if (action !== "picker" || !Number.isFinite(pickerValue)) {
    return
  }

  currentPickerValue = pickerValue
  currentSKU = resolveSkuFromPicker(pickerValue)

  emitAnalyticsEvent(FILTER_SELECTION_EVENT, {
    pickerValue: currentPickerValue,
    sku: currentSKU,
  })
})

const bindCaptureButtonEvent = () => {
  const recordButton = document.getElementById("record-button")
  if (!recordButton || recordButton.dataset.analyticsCaptureBound === "1") {
    return
  }

  recordButton.dataset.analyticsCaptureBound = "1"
  recordButton.addEventListener("photo-capture", () => {
    emitAnalyticsEvent(CAPTURE_BUTTON_EVENT, {
      pickerValue: currentPickerValue,
      sku: currentSKU,
    })
  })
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", bindCaptureButtonEvent, { once: true })
} else {
  bindCaptureButtonEvent()
}

document.addEventListener(
  "click",
  (event) => {
    const button = event?.target?.closest ? event.target.closest("#save-share-button") : null
    if (!button) {
      return
    }

    emitAnalyticsEvent(SHARE_SAVE_EVENT, {
      pickerValue: currentPickerValue,
      sku: currentSKU,
    })
  },
  true
)
