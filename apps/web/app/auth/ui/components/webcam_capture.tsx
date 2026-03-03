import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@workspace/ui/components/button'

interface WebcamCaptureProps {
  onCapture: (file: File, preview: string) => void
  onReset: () => void
  preview: string | null
}

export function WebcamCapture({ onCapture, onReset, preview }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [stream])

  async function startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)
    } catch (e) {
      console.error('Impossible d\'accéder à la webcam', e)
    }
  }

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  function stopCamera() {
    stream?.getTracks().forEach((t) => t.stop())
    setStream(null)
    setReady(false)
  }

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !ready) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], 'avatar.png', { type: 'image/png' })
      const dataUrl = canvas.toDataURL('image/png')
      onCapture(file, dataUrl)
      stopCamera()
    }, 'image/png', 1.0)
  }

  if (preview) {
    return (
      <div className="flex flex-col items-center gap-2">
        <img
          src={preview}
          alt="Avatar"
          className="w-32 h-32 rounded-full object-cover border-2 border-border"
        />
        <Button type="button" variant="outline" size="sm" onClick={onReset}>
          Reprendre
        </Button>
      </div>
    )
  }

  if (stream) {
    return (
      <div className="flex flex-col items-center gap-2">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onCanPlay={() => setReady(true)}
          className="w-40 h-32 rounded-md object-cover border"
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={capturePhoto} disabled={!ready}>
            Capturer
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={stopCamera}>
            Annuler
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={startCamera}>
      Ouvrir la webcam
    </Button>
  )
}
