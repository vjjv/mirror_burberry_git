/**
 * Camera Kit Web Demo Settings
 * Centralized configuration for the application
 */

export const Settings = {
  //Camera kit config
  config: {
    apiToken: "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzM4MjM2Njg5LCJzdWIiOiJmYWMzYWZjOS0zOTEyLTRlNTUtYTdiZS03MjJlOGRmYWY4ZjV-UFJPRFVDVElPTn5lOGQ0OTM1NS00YmNlLTRiYWEtODkzNC1lMWNlNmU0ZDM5M2IifQ.6sZB_6aFPL8OW-UO3Y37P7Rev7mzjS9IhNRFk7NelBI",
    lensID: "e11e9688-3d96-4804-af23-c5b040f3c4c4",
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
    recordCaptureRenderTarget: false,
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
