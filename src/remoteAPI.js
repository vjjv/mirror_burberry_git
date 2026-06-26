import { bootstrapCameraKit, Injectable, remoteApiServicesFactory } from "@snap/camera-kit"
import { Settings } from "./settings"

export const LENS_REMOTE_API_EVENT = "lens-remote-api"

const tryParseJson = (value) => {
  if (typeof value !== "string") {
    return undefined
  }

  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

const parseRequestPayload = (request) => {
  const fromParameters = request?.parameters && typeof request.parameters === "object" ? request.parameters : {}
  const fromBody = request?.body

  if (fromBody == null) {
    return fromParameters
  }

  if (typeof fromBody === "object" && !(fromBody instanceof Uint8Array) && !(fromBody instanceof ArrayBuffer)) {
    return { ...fromParameters, ...fromBody }
  }

  if (typeof fromBody === "string") {
    const parsed = tryParseJson(fromBody)
    return parsed && typeof parsed === "object" ? { ...fromParameters, ...parsed } : fromParameters
  }

  try {
    const decoder = new TextDecoder()
    const bytes = fromBody instanceof Uint8Array ? fromBody : new Uint8Array(fromBody)
    const decodedBody = decoder.decode(bytes)
    const parsed = tryParseJson(decodedBody)
    return parsed && typeof parsed === "object" ? { ...fromParameters, ...parsed } : fromParameters
  } catch (error) {
    console.warn("REMOTE API: failed to parse request body as JSON, falling back to parameters", error)
    return fromParameters
  }
}

// Credits to @bastiensaro (https://www.filtre-experience.fr/) for the original base code
const lensRemoteAPIHandler = {
  apiSpecId: Settings.config.remoteAPISpecId, // Spec ID must match your My Lenses API spec ID

  // Triggered whenever a Remote API request is received for the matching apiSpecId.
  getRequestHandler(request) {
    const payload = parseRequestPayload(request)
    const action = String(payload?.action ?? "").toLowerCase()
    const value = Number(payload?.value)
    const hasValidValue = Number.isFinite(value)

    if (action !== "picker" || !hasValidValue) {
      return
    }

    const eventDetail = {
      action,
      value,
      endpointId: request?.endpointId,
      payload,
      receivedAt: Date.now(),
    }

    window.dispatchEvent(new CustomEvent(LENS_REMOTE_API_EVENT, { detail: eventDetail }))

    // Reply back to the lens so it can confirm delivery.
    return async (reply) => {
      reply({
        status: "success",
        metadata: {},
        body: new TextEncoder().encode(JSON.stringify({ ok: true, action, value })),
      })
    }
  },
}

// use this boostrapCameraKit function to inform the lens to run the code you setup above whenever there is any remote API requested
export const bootstrapCameraKitWithRemoteAPI = async (apiToken) => {
  return await bootstrapCameraKit(
    {
      apiToken: Settings.config.apiToken,
      logger: "console",
      lensHttpValidationStrategy: "unrestricted",
    },
    (container) => {
      return container.provides(
        Injectable(remoteApiServicesFactory.token, [remoteApiServicesFactory.token], (existing) => [...existing, lensRemoteAPIHandler])
      )
    }
  )
}
