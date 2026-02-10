/**
 * Camera Kit Web Demo with Recording Feature
 * Created by gowaaa (https://www.gowaaa.com)
 * A creative technology studio specializing in AR experiences
 *
 * @copyright 2025 GOWAAA
 */

import { bootstrapCameraKit, createMediaStreamSource, Transform2D } from "@snap/camera-kit"
import { bootstrapCameraKitWithRemoteAPI } from "./remoteAPI"
import "./styles/index.v3.css"
import { CameraManager } from "./camera"
import { MediaRecorderManager } from "./recorder"
import { UIManager } from "./ui"
import { VideoProcessor } from "./videoProcessor"
import { Settings } from "./settings"
import { launchParams } from "./launchParams"
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
    cameraKit = await bootstrapCameraKit({
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

  const source = createMediaStreamSource(mediaStream, {
    cameraType: "user",
    disableSourceAudio: false,
  })
  await session.setSource(source)
  source.setTransform(Transform2D.MirrorX)
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
      renderTargetToCapture = captureRenderTarget
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
