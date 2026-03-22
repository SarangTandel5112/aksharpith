'use client'

import { useEffect, useRef } from 'react'

type BackgroundBeamsProps = {
  className?: string
}

export function BackgroundBeams(props: BackgroundBeamsProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas  = canvasRef.current
    if (canvas === null) return
    const ctx     = canvas.getContext('2d')
    if (ctx === null) return
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    let frame = 0
    let animId: number

    function draw() {
      if (ctx === null || canvas === null) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height, 0,
        canvas.width / 2, canvas.height, canvas.width * 0.8,
      )
      gradient.addColorStop(0, `rgba(59, 130, 246, ${0.15 + Math.sin(frame * 0.02) * 0.05})`)
      gradient.addColorStop(0.5, `rgba(6, 182, 212, ${0.08 + Math.cos(frame * 0.015) * 0.03})`)
      gradient.addColorStop(1, 'rgba(3, 7, 18, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      frame++
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${props.className ?? ''}`}
      aria-hidden="true"
    />
  )
}
