"use strict";
(self["webpackChunkcamera_kit_demo"] = self["webpackChunkcamera_kit_demo"] || []).push([[179],{

/***/ 7365:
/***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {


// EXTERNAL MODULE: ./node_modules/@snap/camera-kit/dist/index.js + 185 modules
var dist = __webpack_require__(465);
;// CONCATENATED MODULE: ./src/settings.js
/**
 * Camera Kit Web Demo Settings
 * Centralized configuration for the application
 */

const Settings = {
  //Camera kit config
  config: {
    apiToken: "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzM4MjM2Njg5LCJzdWIiOiJmYWMzYWZjOS0zOTEyLTRlNTUtYTdiZS03MjJlOGRmYWY4ZjV-UFJPRFVDVElPTn5lOGQ0OTM1NS00YmNlLTRiYWEtODkzNC1lMWNlNmU0ZDM5M2IifQ.6sZB_6aFPL8OW-UO3Y37P7Rev7mzjS9IhNRFk7NelBI",
    // lensID: "ce201dac-8be0-4d81-9ce1-860d28b58052", //MIRROR_BURBERRY
    // lensID: "2e78fb1c-0abb-48f7-9b6f-b6be6c98512e", //MIRROR_BURBERRY_02
    lensID: "57d2b1e3-f701-4e5d-94d0-75c8cb7f47c4", //MIRROR_BURBERRY_03
    groupID: "f7f4e367-f4b3-4de5-8e81-e9c842f2bf0b",
    remoteAPISpecId: "YOUR_REMOTE_API_SPEC_ID_HERE", // From my lenses API section
    useRemoteAPI: false, // Set to true to enable using remote API
    
  },
  // Camera settings
  camera: {
    fps: 25,
    constraints: {
      front: {
        video: {
          facingMode: "user",
        },
        audio: true,
      },
      back: {
        video: {
          facingMode: "environment",
        },
        audio: true,
      },
      desktop: {
        video: {
          facingMode: "user",
        },
        audio: true,
      },
    },
  },

  // Recording settings
  recording: {
    mimeType: "video/mp4",
    fps: 25,
    outputFileName: "recording.mp4",
    recordVideoBitsPerSecond: 2500000,
    recordAudioBitsPerSecond: 128000,
    recordLensAudio: true,
    recordMicAudio: true,
    recordCaptureRenderTarget: true,
  },

  // FFmpeg settings
  ffmpeg: {
    baseURL: "/ffmpeg",
    coreURL: "ffmpeg-core.js",
    wasmURL: "ffmpeg-core.wasm",
    outputOptions: ["-movflags", "faststart", "-c", "copy", "-c:a", "aac"],
  },

  // UI settings
  ui: {
    recordButton: {
      startImage: "./assets/RecordButton.png",
      stopImage: "./assets/RecordStop.png",
    },
    assets: {
      poweredBySnap: "./assets/Powered_bysnap.png",
      recordOutline: "./assets/RecordOutline.png",
      shareButton: "./assets/ShareButton.png",
      downloadButton: "./assets/DownloadButton.png",
      backButton: "./assets/BackButton.png",
      loadingIcon: "./assets/LoadingIcon.png",
    },
    displayPreview: true,
  },

  //remote API settings
  remoteAPI: {
    isEnabled: false,
  },
}

;// CONCATENATED MODULE: ./src/remoteAPI.js



//Credits to @bastiensaro (https://www.filtre-experience.fr/) for the code below
const lensRemoteAPIHandler = {
  apiSpecId: Settings.config.remoteAPISpecId, //spec ID needs to be the same as the spec ID from Mylenses API

  //Below is the code that will run once any remote API request with the specs ID above is detected from the lens
  getRequestHandler(request) {
    if (request.endpointId !== "button_pressed") return //change to your EndPoint or Reference ID from Mylenses
    console.log("REMOTE API :" + request.parameters.yourParameter)
    //parameter can be used to differentiate between different buttons or events from your lens
    //you can setup your own parameter in Mylenses API, below are just example
    if (request.parameters.button_id === "12345") {
      //run code for button 1
      console.log("button 12345 is pressed")
    } else if (request.parameters.button_id === "67890") {
      //run code for button 2
    }

    //gives a reply to the lens request, you can use it to check that the webapp has received the request
    return async (reply) => {
      reply({
        status: "success",
        metadata: {},
        body: new TextEncoder().encode(request.parameters.yourParameter + " responded"),
      })
    }
  },
}

// use this boostrapCameraKit function to inform the lens to run the code you setup above whenever there is any remote API requested
const bootstrapCameraKitWithRemoteAPI = async (apiToken) => {
  return await (0,dist/* bootstrapCameraKit */.FY)(
    {
      apiToken: Settings.config.apiToken,
      logger: "console",
    },
    (container) => {
      return container.provides(
        (0,dist/* Injectable */.GS)(dist/* remoteApiServicesFactory.token */.Yy.token, [dist/* remoteApiServicesFactory.token */.Yy.token], (existing) => [...existing, lensRemoteAPIHandler])
      )
    }
  )
}

;// CONCATENATED MODULE: ./src/camera.js



class CameraManager {
  constructor() {
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    this.isBackFacing = false
    this.mediaStream = null
  }

  async initializeCamera() {
    if (!this.isMobile) {
      document.body.classList.add("desktop")
    }

    this.mediaStream = await navigator.mediaDevices.getUserMedia(this.getConstraints())
    return this.mediaStream
  }

  async updateCamera(session) {
    this.isBackFacing = !this.isBackFacing

    if (this.mediaStream) {
      session.pause()
      this.mediaStream.getTracks().forEach((track) => {
        track.stop()
      })
      this.mediaStream = null
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia(this.getConstraints())
      const source = (0,dist/* createMediaStreamSource */.$A)(this.mediaStream, {
        cameraType: this.isBackFacing ? "environment" : "user",
        disableSourceAudio: false,
      })

      await session.setSource(source)
      if (!this.isBackFacing) {
        source.setTransform(dist/* Transform2D.MirrorX */.A.MirrorX)
      }
      await session.play()
      return source
    } catch (error) {
      console.error("Failed to get media stream:", error)
      throw error
    }
  }

  getConstraints() {
    return this.isMobile ? (this.isBackFacing ? Settings.camera.constraints.back : Settings.camera.constraints.front) : Settings.camera.constraints.desktop
  }
}

;// CONCATENATED MODULE: ./src/recorder.js

class MediaRecorderManager {
  constructor(videoProcessor, uiManager, audioStreams) {
    this.mediaRecorder = null
    this.recordedChunks = []
    this.videoProcessor = videoProcessor
    this.uiManager = uiManager
    this.audioVideoStream = null
    this.canvasStream = null
    this.mixDestination = null
    this.audioContexts = []
    this.monitorNodes = []
    this.monitoredStreams = []
    this.userMediaStream = null

    // prepare audio streams and connect to this.mixDestination
    let mixAudioContext = new AudioContext()
    this.mixDestination = mixAudioContext.createMediaStreamDestination()
    for (let i = 0; i < audioStreams.length; i++) {
      if (audioStreams[i]) {
        let newStream = mixAudioContext.createMediaStreamSource(audioStreams[i])
        newStream.connect(this.mixDestination)
      }
    }

    let audioTracks = []
    for (let i = 0; i < audioStreams.length; i++) {
      if (audioStreams[i]) {
        audioTracks.push(...audioStreams[i].getAudioTracks())
      }
    }
  }

  async startRecording(session) {
    try {
      const recordStream = new MediaStream()
      if (Settings.recording.recordCaptureRenderTarget) {
        this.canvasStream = session.output.capture.captureStream(Settings.recording.fps)
      } else {
        this.canvasStream = session.output.live.captureStream(Settings.recording.fps)
      }
      recordStream.addTrack(this.canvasStream.getVideoTracks()[0])
      recordStream.addTrack(this.mixDestination.stream.getAudioTracks()[0])

      this.mediaRecorder = new MediaRecorder(recordStream, {
        mimeType: Settings.recording.mimeType,
        videoBitsPerSecond: Settings.recording.recordVideoBitsPerSecond,
        audioBitsPerSecond: Settings.recording.recordAudioBitsPerSecond,
      })
      this.recordedChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        console.log("start record")
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = async () => {
        console.log("stop record")
        this.uiManager.showLoading(true)
        const blob = new Blob(this.recordedChunks, { type: Settings.recording.mimeType })
        // const fixedBlob = await this.videoProcessor.fixVideoDuration(blob)
        // const url = URL.createObjectURL(fixedBlob)
        const url = URL.createObjectURL(blob)
        this.uiManager.showLoading(false)
        // this.uiManager.displayPostRecordButtons(url, fixedBlob)
        this.uiManager.displayPostRecordButtons(url, blob)
      }

      this.mediaRecorder.start()
      return true
    } catch (error) {
      console.error("Error accessing media devices:", error)
      return false
    }
  }

  resetRecordingVariables() {
    this.mediaRecorder = null
    this.recordedChunks = []
    // Stop all tracks in the audio/video stream
    if (this.audioVideoStream) {
      this.audioVideoStream.getTracks().forEach((track) => {
        track.stop()
      })
      this.audioVideoStream = null
    }

    // Stop all tracks in the canvas stream
    if (this.canvasStream) {
      this.canvasStream.getTracks().forEach((track) => {
        track.stop()
      })
      this.canvasStream = null
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop()
    }
  }
}

;// CONCATENATED MODULE: ./src/ui.js


class UIManager {
  constructor() {
    this.recordButton = document.getElementById("record-button")
    this.recordOutline = document.getElementById("outline")
    // --- Hide capture button and outline if allowCapture param is false ---
    function getQueryParam(name) {
      const url = new URL(window.location.href);
      return url.searchParams.get(name);
    }
    const allowCaptureParam = getQueryParam('allowCapture');
    const allowCapture = allowCaptureParam === null ? true : (allowCaptureParam !== 'false');
    if (!allowCapture) {
      if (this.recordButton) this.recordButton.style.display = 'none';
      if (this.recordOutline) this.recordOutline.style.display = 'none';
    }
    this.recordOutline = document.getElementById("outline")
    this.actionButton = document.getElementById("action-buttons")
    this.switchButton = document.getElementById("switch-button")
    this.loadingIcon = document.getElementById("loading")
    this.backButton = document.getElementById("back-button") // Retry button
    this.recordPressedCount = 0

    // --- Tap to take photo, long press to record ---
    this.longPressTimeout = null
    this.isRecording = false
    this.longPressDuration = 400 // ms
    
    // Detect Android version for video recording capability
    const userAgent = navigator.userAgent
    const androidMatch = userAgent.match(/Android (\d+)/)
    const androidVersion = androidMatch ? parseInt(androidMatch[1]) : null
    this.supportsVideoRecording = !androidVersion || androidVersion > 13
    
    console.log('Device capabilities:', {
      userAgent: userAgent.substring(0, 100),
      androidVersion,
      supportsVideoRecording: this.supportsVideoRecording
    })

    // Remove any existing click listeners (main.js should not add its own)
    this.recordButton.onclick = null
    this.recordButton.onmousedown = null
    this.recordButton.onmouseup = null
    this.recordButton.ontouchstart = null
    this.recordButton.ontouchend = null

    // Prevent context menu on long press (Chrome save image behavior)
    this.recordButton.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      return false
    })
    
    // Prevent drag and select behaviors
    this.recordButton.addEventListener('dragstart', (e) => {
      e.preventDefault()
      return false
    })
    this.recordButton.addEventListener('selectstart', (e) => {
      e.preventDefault()
      return false
    })
    
    // Set CSS properties to prevent dragging and selection
    this.recordButton.style.userSelect = 'none'
    this.recordButton.style.webkitUserSelect = 'none'
    this.recordButton.style.mozUserSelect = 'none'
    this.recordButton.style.msUserSelect = 'none'
    this.recordButton.style.webkitTouchCallout = 'none'
    this.recordButton.style.webkitUserDrag = 'none'
    this.recordButton.style.webkitTapHighlightColor = 'transparent'
    this.recordButton.draggable = false
    
    // Mouse events
    this.recordButton.addEventListener('mousedown', (e) => this._handlePressStart(e))
    this.recordButton.addEventListener('mouseup', (e) => this._handlePressEnd(e))
    this.recordButton.addEventListener('mouseleave', (e) => this._handlePressCancel(e))
    // Touch events
    this.recordButton.addEventListener('touchstart', (e) => this._handlePressStart(e), { passive: false })
    this.recordButton.addEventListener('touchend', (e) => this._handlePressEnd(e), { passive: false })
    this.recordButton.addEventListener('touchcancel', (e) => this._handlePressCancel(e), { passive: false })
    
    // Bind the context menu prevention method
    this._preventContextMenu = this._preventContextMenu.bind(this)
  }
  
  _preventContextMenu(e) {
    e.preventDefault()
    e.stopPropagation()
    return false
  }

  _handlePressStart(e) {
    if (this.isRecording) return
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    
    // Prevent any default behaviors (drag, context menu, etc.)
    if (e.type === 'mousedown') {
      e.target.ondragstart = () => false
    }
    
    // For iOS, prevent long press context menu with additional techniques
    if (e.type === 'touchstart') {
      // Prevent iOS callout/context menu
      document.addEventListener('contextmenu', this._preventContextMenu, { passive: false, once: true })
      // Clear any existing selection
      if (window.getSelection) {
        window.getSelection().removeAllRanges()
      }
    }
    // Check if device supports video recording
    if (!this.supportsVideoRecording) {
      // For Android 13 and lower: immediately take photo on any press
      console.log('Video recording not supported - taking photo immediately')
      this.recordButton.dispatchEvent(new CustomEvent('photo-capture', {bubbles:true}))
      return
    }
    
    // Animate outline scale up and reduce opacity for visual feedback during long press
    this.recordOutline.style.transition = 'transform 0.2s cubic-bezier(0.4,0,0.2,1), opacity 0.2s cubic-bezier(0.4,0,0.2,1)'
    this.recordOutline.style.transformOrigin = 'center center'
    this.recordOutline.style.transform = 'translateX(-50%) scale(1.3)'
    this.recordOutline.style.opacity = '0.5'
    this.longPressTimeout = setTimeout(() => {
      console.log('Long press timeout fired - starting recording')
      this.isRecording = true
      this.updateRecordButtonState(true)
      // Dispatch custom event for start recording
      this.recordButton.dispatchEvent(new CustomEvent('record-start', {bubbles:true}))
    }, this.longPressDuration)
  }

  _handlePressEnd(e) {
    e.preventDefault()
    e.stopPropagation()
    
    // If device doesn't support video recording, the photo was already taken in _handlePressStart
    if (!this.supportsVideoRecording) {
      return
    }
    
    console.log('Press end:', {
      type: e.type,
      hasTimeout: !!this.longPressTimeout,
      isRecording: this.isRecording
    })
    
    // Clean up context menu prevention
    document.removeEventListener('contextmenu', this._preventContextMenu)
    
    // Revert outline animation
    this.recordOutline.style.transform = 'translateX(-50%) scale(1)'
    this.recordOutline.style.opacity = '1'
    
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout)
      this.longPressTimeout = null
      if (!this.isRecording) {
        // Tap: take photo
        console.log('Tap detected - taking photo')
        this.recordButton.dispatchEvent(new CustomEvent('photo-capture', {bubbles:true}))
      } else {
        // End recording
        console.log('Ending recording')
        this.isRecording = false
        this.updateRecordButtonState(false)
        this.recordButton.dispatchEvent(new CustomEvent('record-stop', {bubbles:true}))
      }
    } else if (this.isRecording) {
      // End recording (timeout already fired)
      console.log('Ending recording (timeout fired)')
      this.isRecording = false
      this.updateRecordButtonState(false)
      this.recordButton.dispatchEvent(new CustomEvent('record-stop', {bubbles:true}))
    }
  }

  _handlePressCancel(e) {
    // If device doesn't support video recording, no cleanup needed
    if (!this.supportsVideoRecording) {
      return
    }
    
    // Clean up context menu prevention
    document.removeEventListener('contextmenu', this._preventContextMenu)
    
    // Revert outline animation
    this.recordOutline.style.transform = 'translateX(-50%) scale(1)'
    this.recordOutline.style.opacity = '1'
    
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout)
      this.longPressTimeout = null
    }
    if (this.isRecording) {
      this.isRecording = false
      this.updateRecordButtonState(false)
      this.recordButton.dispatchEvent(new CustomEvent('record-stop', {bubbles:true}))
    }
  }

  toggleRecordButton(isVisible) {
    if (isVisible) {
      this.recordOutline.style.display = "block"
      this.recordButton.style.display = "block"
    } else {
      this.recordOutline.style.display = "none"
      this.recordButton.style.display = "none"
    }
  }

  updateRecordButtonState(isRecording) {
    this.recordButton.style.backgroundImage = isRecording
      ? `url('${Settings.ui.recordButton.stopImage}')`
      : `url('${Settings.ui.recordButton.startImage}')`
    this.recordPressedCount++
  }

  showLoading(show) {
    this.loadingIcon.style.display = show ? "block" : "none"
  }

  displayPostRecordButtons(url, fixedBlob) {
    // Device detection
    const isAndroid = /Android/i.test(navigator.userAgent)
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isDesktop = !isAndroid && !isIOS
    
    const shareButton = document.getElementById("share-button")
    const downloadButton = document.getElementById("download-button")
    
    if (shareButton && downloadButton) {
      if (isAndroid) {
        // Android: show both buttons
        shareButton.style.display = "inline-flex"
        downloadButton.style.display = "inline-flex"
      } else if (isIOS) {
        // iOS: only share button
        shareButton.style.display = "inline-flex"
        downloadButton.style.display = "none"
      } else {
        // Desktop: only download button
        shareButton.style.display = "none"
        downloadButton.style.display = "inline-flex"
      }
    }

    // backButton (Retry) is already positioned correctly in HTML below button-row
    // No need to move or apply inline styles

    this.actionButton.style.display = "block"
    this.switchButton.style.display = "none"

    if (Settings.ui.displayPreview) {
      this.displayPreview(url)
    }

    // Determine if this is an image or video
    const isImage = typeof url === 'string' && url.startsWith('data:image/')
    const imageFileName = 'photo.png'
    const imageMimeType = 'image/png'
    const videoFileName = Settings.recording.outputFileName
    const videoMimeType = Settings.recording.mimeType

    document.getElementById("download-button").onclick = () => {
      const a = document.createElement("a")
      a.href = url
      a.download = isImage ? imageFileName : videoFileName
      a.click()
      a.remove()
    }

    document.getElementById("share-button").onclick = async () => {
      try {
        const file = new File([fixedBlob], isImage ? imageFileName : videoFileName, {
          type: isImage ? imageMimeType : videoMimeType,
        })

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: isImage ? "Photo" : "Recorded Video",
            text: isImage ? "Check out this photo!" : "Check out this recording!",
          })
          console.log("File shared successfully")
        } else {
          console.error("Sharing files is not supported on this device.")
        }
      } catch (error) {
        console.error("Error while sharing:", error)
      }
    }

    document.getElementById("back-button").onclick = async () => {
      // Retry logic: hide action buttons, show record button and switch button
      this.actionButton.style.display = "none"
      this.switchButton.style.display = "block"
      this.toggleRecordButton(true)
      if (Settings.ui.displayPreview) {
        this.removePreview()
      }
    }
  }

  updateRenderSize(source, renderTarget) {
    const width = window.innerWidth
    const height = window.innerHeight

    renderTarget.style.width = `${width}px`
    renderTarget.style.height = `${height}px`
    source.setRenderSize(width, height)
  }

  displayPreview(dataURL) {
    // Create a fullscreen background div with bg.png
    const bg = document.createElement("div")
    bg.id = "preview-bg"
    bg.style = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: url('./assets/bg.png') center center / cover no-repeat, black;
      z-index: 998;
      display: flex;
      align-items: flex-start;
      justify-content: center;
    `
    document.body.appendChild(bg)

    // Create a container for the canvas to size it responsively
    const container = document.createElement("div")
    container.id = "preview-container"
    container.style = `
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
      background: black;
      overflow: hidden;
      max-width: 76.5vw;
      max-height: 76.5vh;
      margin-top: 5vh;
    `
    bg.appendChild(container)

    let preview
    if (typeof dataURL === 'string' && dataURL.startsWith('data:image/')) {
      // Show image in preview
      preview = document.createElement('img')
      preview.src = dataURL
      preview.id = 'preview'
      preview.style = `
        display: block;
        max-width: 100%;
        max-height: calc(100% - 18px);
        margin: 0 auto;
        background: transparent;
        border: none;
      `
      container.appendChild(preview)
    } else {
      // Show video as a normal video element in the preview container
      preview = document.createElement("video")
      preview.src = dataURL
      preview.id = "preview"
      preview.controls = true
      preview.autoplay = true
      preview.loop = true
      preview.playsInline = true
      preview.muted = false // Allow audio to play
      preview.volume = 1.0
      preview.style = `
        display: block;
        max-width: 100%;
        max-height: calc(100% - 18px);
        margin: 0 auto;
        border-radius: 50px;
        background: black;
        border: 8px solid white;
      `
      container.appendChild(preview)
      // Add error handling for video load/playback
      preview.addEventListener('error', (e) => {
        console.error('Preview video failed to load:', e, preview.error)
      })
      preview.addEventListener('stalled', (e) => {
        console.error('Preview video stalled:', e)
      })
      preview.addEventListener('abort', (e) => {
        console.error('Preview video aborted:', e)
      })
      preview.addEventListener('emptied', (e) => {
        console.error('Preview video emptied:', e)
      })
    }
    // No canvas preview logic remains
  }

  removePreview() {
    // Remove the preview text if present
    const previewText = document.getElementById("preview-lorem")
    if (previewText) previewText.remove()
    
    // Retry button is already positioned correctly in HTML structure
    // No need to restore position
    
    const preview = document.getElementById("preview")
    if (preview) preview.remove()
    const bg = document.getElementById("preview-bg")
    if (bg) bg.remove()
    if (preview || bg) {
      console.log("Preview removed")
    } else {
      console.log("No preview to remove")
    }
  }
}

// EXTERNAL MODULE: ./node_modules/@ffmpeg/ffmpeg/dist/esm/index.js + 2 modules
var esm = __webpack_require__(4435);
// EXTERNAL MODULE: ./node_modules/@ffmpeg/util/dist/esm/index.js + 1 modules
var dist_esm = __webpack_require__(2994);
;// CONCATENATED MODULE: ./src/videoProcessor.js




class VideoProcessor {
  constructor() {
    this.ffmpeg = new esm/* FFmpeg */.C()
  }

  async fixVideoDuration(blob) {
    try {
      console.log("Loading FFmpeg...")
      const { baseURL, coreURL, wasmURL, outputOptions } = Settings.ffmpeg

      const fullCoreURL = `${baseURL}/${coreURL}`
      const fullWasmURL = `${baseURL}/${wasmURL}`

      console.log("Loading FFmpeg with URLs:", {
        coreURL: fullCoreURL,
        wasmURL: fullWasmURL,
      })

      await this.ffmpeg.load({
        coreURL: fullCoreURL,
        wasmURL: fullWasmURL,
      })

      console.log("FFmpeg loaded successfully")

      await this.ffmpeg.writeFile("input.mp4", await (0,dist_esm/* fetchFile */.dc)(blob))
      await this.ffmpeg.exec(["-i", "input.mp4", ...outputOptions, "output.mp4"])
      const fixedData = await this.ffmpeg.readFile("output.mp4")
      return new Blob([fixedData.buffer], { type: Settings.recording.mimeType })
    } catch (error) {
      console.error("Error in fixVideoDuration:", error)
      throw error
    }
  }
}

;// CONCATENATED MODULE: ./src/launchParams.js
/*You can pass parameters of type:
Strings
Arrays of Strings
Numbers
Arrays of Numbers */
const launchParams = { launchParams: { testParam: "text from web app" } }

/*
In Lens Studio, you can use the following typescript code to obtain the data when Lens launch.
You can change the testParam name but make sure to use the same in the Lens Studio code
You can also add more data to send to lens as long as it is lesser than or equal to 3kb

@component
export class LaunchParams extends BaseScriptComponent {
  @input debugText: Text

  public launchDataStore: any = null
  onAwake() {
    this.launchDataStore = global.launchParams
    this.debugText.text = this.launchDataStore.getString("testParam") || "no launch data"
  }
}

Although mutiple types of data are supported, only string type seems to be working (or at least I haven't figure out how to use other type).
So I recommend using string to pass all your data to the lens instead. 

For example, on camera kit's side: 
let myNumber = 10
let myData = [10, 20, 40]
export const launchParams = { launchParams: { testNum: myNumber.toString(), testData: JSON.stringify(myData) } }

On Lens Studio's side:
this.launchDataStore = global.launchParams
this.myNum = parse.int(this.launchDataStore.getString("testNum"))
this.myData = JSON.parse(this.launchDataStore.getString("testData"))
*/

;// CONCATENATED MODULE: ./src/main.js
/**
 * Camera Kit Web Demo with Recording Feature
 * Created by gowaaa (https://www.gowaaa.com)
 * A creative technology studio specializing in AR experiences
 *
 * @copyright 2025 GOWAAA
 */










// --- LensID override from URL param ---
function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

const lensIDFromURL = getQueryParam('lensID');
if (lensIDFromURL) {
  Settings.config.lensID = lensIDFromURL;
  console.log('[CameraKit] Overriding lensID from URL param:', lensIDFromURL);
}

// Desktop detection functions
function isDesktop() {
  // Check if it's a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  // Check for touch capability (but not exclusive, as some laptops have touch)
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  // Check screen size - desktop typically has larger screens
  const isLargeScreen = window.screen.width >= 1024 && window.screen.height >= 768
  
  // Consider it desktop if it's not mobile AND has large screen
  // OR if it's large screen without mobile user agent
  return (!isMobile && isLargeScreen) || (!isMobile && !hasTouch)
}

function generateQRCode(text, size = 200) {
  // Using QR Server API to generate QR codes
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`
}

function showDesktopOverlay() {
  // Create the overlay
  const overlay = document.createElement('div')
  overlay.id = 'desktop-overlay'
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #000000;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `

  // Create the text
  const text = document.createElement('h1')
  text.textContent = 'Open this link on mobile to start'
  text.style.cssText = `
    font-size: 3rem;
    font-weight: 600;
    margin: 0 0 2rem 0;
    text-align: center;
    max-width: 80%;
  `

  // Create QR code container
  const qrContainer = document.createElement('div')
  qrContainer.style.cssText = `
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  `

  // Create QR code image
  const qrCode = document.createElement('img')
  const currentUrl = window.location.href
  qrCode.src = generateQRCode(currentUrl, 300)
  qrCode.alt = 'QR Code to open on mobile'
  qrCode.style.cssText = `
    display: block;
    width: 300px;
    height: 300px;
  `

  // Create URL text below QR code
  const urlText = document.createElement('p')
  urlText.textContent = currentUrl
  urlText.style.cssText = `
    font-size: 1rem;
    margin: 1rem 0 0 0;
    text-align: center;
    word-break: break-all;
    max-width: 80%;
  `

  // Assemble the overlay
  qrContainer.appendChild(qrCode)
  overlay.appendChild(text)
  overlay.appendChild(qrContainer)
  overlay.appendChild(urlText)

  // Add to document
  document.body.appendChild(overlay)

  // Hide other UI elements
  document.body.style.overflow = 'hidden'
}

// --- Desktop splash logic with allowDesktop param ---
const allowDesktop = getQueryParam('allowDesktop') === 'true';
// Check for desktop before doing anything else
if (isDesktop() && !allowDesktop) {
  showDesktopOverlay()
  // Stop execution by not running the main function
} else {
  // Only run the main app if not on desktop or if allowDesktop=true
  ;(async function () {
  let audioContexts = []
  let monitorNodes = []
  let monitoredStreams = []
  let userMediaStream = null
  let mediaRecorder = null
  let currentRenderTarget
  let cameraKit = null

  setupAudioContextMonitor()
  setupAudioNodeMonitor()

  if (!Settings.config.apiToken || !Settings.config.lensID || !Settings.config.groupID) {
    console.error("Missing required environment variables. Please check your environment settings.")
    return
  }

  // Initialize managers
  const uiManager = new UIManager()
  const cameraManager = new CameraManager()
  const videoProcessor = new VideoProcessor()

  // Initialize Camera Kit
  if (Settings.config.useRemoteAPI) {
    cameraKit = await bootstrapCameraKitWithRemoteAPI()
  } else {
    cameraKit = await (0,dist/* bootstrapCameraKit */.FY)({
      apiToken: Settings.config.apiToken,
      logger: "console", //to show lens print log on the broswer console
    })
  }
  // Get canvas element for live render target
  const liveRenderTarget = document.getElementById("canvas")
  const captureRenderTarget = document.getElementById("capture-canvas")

  // Create camera kit session
  const session = await cameraKit.createSession({ liveRenderTarget })

  //Set captureRenderTarget canvas to render out capture render target from camera kit
  //It is not rendering out anything yet until session.play('capture') is called
  //To record capture render target, set recordCaptureRenderTarget to be true in settings.js
  captureRenderTarget.replaceWith(session.output.capture)

  currentRenderTarget = liveRenderTarget

  // Initialize camera and set up source
  const mediaStream = await cameraManager.initializeCamera()

  const source = (0,dist/* createMediaStreamSource */.$A)(mediaStream, {
    cameraType: "user",
    disableSourceAudio: false,
  })
  await session.setSource(source)
  source.setTransform(dist/* Transform2D.MirrorX */.A.MirrorX)
  await source.setRenderSize(window.innerWidth, window.innerHeight)
  await session.setFPSLimit(Settings.camera.fps)
  await session.play() //plays live target by default

  // Load and apply lens
  const lens = await cameraKit.lensRepository.loadLens(Settings.config.lensID, Settings.config.groupID)
  //launchParams allow you to send data to lens at launch, giving you control to trigger different lens effect
  // such as different text, colours, objects visibility etc.
  // See launchParams.js for code sample to use in Lens Studio
  // You may remove launchParams if you have no need for it
  await session.applyLens(lens, launchParams)


  //----------------------------------
  // BABA EDIT PHOTO/VIDEO PREVIEW
  //----------------------------------
  // --- New event listeners for tap/long-press ---
  // Photo capture (tap)
  uiManager.recordButton.addEventListener("photo-capture", async () => {
    // Determine which render target to use based on settings
    let renderTargetToCapture = liveRenderTarget
    
    if (Settings.recording.recordCaptureRenderTarget) {
      // Switch to capture render target for photo
      liveRenderTarget.style.display = "none"
      await session.play("capture")
      renderTargetToCapture = session.output.capture
      // Wait for capture render target to render a few frames
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // Take a photo from the selected render target
    const canvas = document.createElement('canvas')
    canvas.width = renderTargetToCapture.width
    canvas.height = renderTargetToCapture.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(renderTargetToCapture, 0, 0, canvas.width, canvas.height)
    const dataURL = canvas.toDataURL('image/png')
    
    // Switch back to live render target if we used capture
    if (Settings.recording.recordCaptureRenderTarget) {
      liveRenderTarget.style.display = "block"
      await session.play("live")
    }
    
    // Convert dataURL to Blob for download/share
    function dataURLtoBlob(dataurl) {
      const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n)
      for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i)
      return new Blob([u8arr], { type: mime })
    }
    const photoBlob = dataURLtoBlob(dataURL)
    // Show the photo in the same preview as video, with share/download/back buttons
    uiManager.displayPostRecordButtons(dataURL, photoBlob)
    // Hide record button
    uiManager.toggleRecordButton(false)
  })

  // Start recording (long press)
  uiManager.recordButton.addEventListener("record-start", async () => {
    if (Settings.recording.recordCaptureRenderTarget) {
      liveRenderTarget.style.display = "none"
      await session.play("capture")
      currentRenderTarget = captureRenderTarget
    }
    mediaRecorder = await setupAudioStreams()
    const success = await mediaRecorder.startRecording(session)
    if (success) {
      uiManager.updateRecordButtonState(true)
    }
  })

  // Stop recording (release long press)
  uiManager.recordButton.addEventListener("record-stop", async () => {
    uiManager.updateRecordButtonState(false)
    uiManager.toggleRecordButton(false)
    if (mediaRecorder) mediaRecorder.stopRecording()
    if (Settings.recording.recordCaptureRenderTarget) {
      liveRenderTarget.style.display = "block"
      await session.play("live")
      currentRenderTarget = liveRenderTarget
    }
  })

  uiManager.switchButton.addEventListener("click", async () => {
    try {
      const source = await cameraManager.updateCamera(session)
      uiManager.updateRenderSize(source, liveRenderTarget)
      uiManager.updateRenderSize(source, captureRenderTarget)
    } catch (error) {
      console.error("Error switching camera:", error)
    }
  })
  //----------------------------------
  // END BABA EDIT PHOTO/VIDEO PREVIEW
  //----------------------------------

  // Add back button handler
  document.getElementById("back-button").addEventListener("click", async () => {
    try {
      if (mediaRecorder && typeof mediaRecorder.resetRecordingVariables === 'function') {
        mediaRecorder.resetRecordingVariables()
      }
      uiManager.updateRenderSize(source, liveRenderTarget)
      uiManager.updateRenderSize(source, captureRenderTarget)
    } catch (error) {
      console.error("Error resetting camera:", error)
    }
  })

  // Add window resize listener
  window.addEventListener("resize", () => uiManager.updateRenderSize(source, liveRenderTarget), uiManager.updateRenderSize(source, captureRenderTarget))

  // Update initial render size
  uiManager.updateRenderSize(source, liveRenderTarget)
  uiManager.updateRenderSize(source, captureRenderTarget)

  //functions for audio monitoring recording
  function setupAudioContextMonitor() {
    const originalAudioContext = window.AudioContext || window.webkitAudioContext
    let capturedAudioContext = null

    window.AudioContext = window.webkitAudioContext = function () {
      capturedAudioContext = new originalAudioContext()
      console.log("Audio context created:", capturedAudioContext)

      audioContexts.push(capturedAudioContext)

      return capturedAudioContext
    }
  }

  function setupAudioNodeMonitor() {
    // Store the original connect method
    const originalConnect = AudioNode.prototype.connect

    // Override the AudioNode.prototype.connect method
    AudioNode.prototype.connect = function (destinationNode) {
      console.log("Audio Node Connecting: " + this + " to " + destinationNode)

      // if the current node is a gainNode, create another stream node and connect it
      if (destinationNode instanceof AudioDestinationNode) {
        console.log("final node found")

        // create monitor node
        let streamNode = this.context.createMediaStreamDestination()
        monitorNodes.push(streamNode)

        // connect current node to the monitor node
        this.connect(streamNode)
      }

      // Call original connect method
      return originalConnect.apply(this, arguments)
    }
  }

  async function setupAudioStreams() {
    // Wait for monitor nodes to be ready
    await waitForMonitorNodes()

    if (Settings.recording.recordMicAudio) {
      userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          frameRate: { ideal: Settings.recording.fps },
          facingMode: cameraManager.getConstraints(),
        },
        audio: true,
      })
      monitoredStreams.push(userMediaStream)
    }

    if (Settings.recording.recordLensAudio) {
      for (let i = 0; i < monitorNodes.length; i++) {
        if (monitorNodes[i].stream) {
          monitoredStreams.push(monitorNodes[i].stream)
        }
      }
    }

    return new MediaRecorderManager(videoProcessor, uiManager, monitoredStreams)
  }

  async function waitForMonitorNodes() {
    const maxWait = 1000 // 2 seconds max
    const checkInterval = 100 // Check every 100ms
    let waited = 0

    while (waited < maxWait) {
      const allReady = monitorNodes.every((node) => node && node.stream)
      if (allReady) return

      await new Promise((resolve) => setTimeout(resolve, checkInterval))
      waited += checkInterval
    }

    console.warn("Some monitor nodes may not be ready")
  }
})()
} // End of else block for desktop check


/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, [216], () => (__webpack_exec__(7365)));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);