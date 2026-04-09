import { useEffect, useMemo, useRef, useState } from 'react'
import ToolsBoard from './ToolsBoard'
import DrawingBoard from './DrawingBoard'

const COLORS = ['#fff', '#000', '#E02020', '#6DD400', '#4A98F7']
const SHAPE_TOOLS = ['rectangle', 'circle', 'triangle']
const CLOSE_THRESHOLD = 24

function DrawingApp() {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const elementIdRef = useRef(0)
  const interactionRef = useRef({
    pointerDown: false,
    isDrawing: false,
    isDragging: false,
    dragTargetId: null,
    dragLastX: 0,
    dragLastY: 0,
    startX: 0,
    startY: 0,
    previewElement: null,
    drawingPathId: null,
  })

  const [selectedTool, setSelectedTool] = useState('pen')
  const [fillColorEnabled, setFillColorEnabled] = useState(false)
  const [fillColor, setFillColor] = useState('#4A98F7')
  const [strokeColor, setStrokeColor] = useState('#000')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [selectedColorIndex, setSelectedColorIndex] = useState(4)
  const [elements, setElements] = useState([])
  const [selectedElementId, setSelectedElementId] = useState(null)

  const setCanvasBackground = (context) => {
    if (!canvasRef.current || !context) return
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    ctxRef.current = context
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    setCanvasBackground(context)
  }, [])

  const getPenPath2D = (points, isClosed) => {
    const path = new Path2D()
    if (!points.length) return path
    path.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i += 1) {
      path.lineTo(points[i].x, points[i].y)
    }
    if (isClosed) path.closePath()
    return path
  }

  const drawPenElement = (context, element, isSelected) => {
    const path = getPenPath2D(element.points, element.isClosed)
    context.save()
    context.lineWidth = element.strokeWidth
    context.strokeStyle = element.strokeColor
    context.lineCap = 'round'
    context.lineJoin = 'round'
    if (element.isClosed && element.fillColor !== 'transparent') {
      context.fillStyle = element.fillColor
      context.fill(path)
    }
    context.stroke(path)

    if (isSelected) {
      const bounds = getPenBounds(element.points)
      context.setLineDash([6, 4])
      context.lineWidth = 2
      context.strokeStyle = '#2563eb'
      context.strokeRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8)
      context.setLineDash([])
    }
    context.restore()
  }

  const drawShapeElement = (context, element, isSelected = false) => {
    const { x, y } = element.position
    const { width, height } = element.dimensions

    context.save()
    context.lineWidth = element.strokeWidth
    context.strokeStyle = element.strokeColor
    context.fillStyle = element.fillColor

    if (element.type === 'rectangle') {
      if (element.fillColor !== 'transparent') context.fillRect(x, y, width, height)
      context.strokeRect(x, y, width, height)
    } else if (element.type === 'circle') {
      const centerX = x + width / 2
      const centerY = y + height / 2
      const radius = Math.max(Math.min(width, height) / 2, 1)
      context.beginPath()
      context.arc(centerX, centerY, radius, 0, Math.PI * 2)
      if (element.fillColor !== 'transparent') context.fill()
      context.stroke()
    } else {
      context.beginPath()
      context.moveTo(x + width / 2, y)
      context.lineTo(x, y + height)
      context.lineTo(x + width, y + height)
      context.closePath()
      if (element.fillColor !== 'transparent') context.fill()
      context.stroke()
    }

    if (isSelected) {
      context.setLineDash([6, 4])
      context.lineWidth = 2
      context.strokeStyle = '#2563eb'
      context.strokeRect(x - 4, y - 4, width + 8, height + 8)
      context.setLineDash([])
    }

    context.restore()
  }

  const drawElement = (context, element, isSelected = false) => {
    if (element.type === 'pen') drawPenElement(context, element, isSelected)
    else drawShapeElement(context, element, isSelected)
  }

  const redraw = (previewElement = null) => {
    const ctx = ctxRef.current
    if (!ctx) return
    setCanvasBackground(ctx)
    elements.forEach((element) => drawElement(ctx, element, element.id === selectedElementId))
    if (previewElement) drawElement(ctx, previewElement, true)
  }

  useEffect(() => {
    redraw(interactionRef.current.previewElement)
  }, [elements, selectedElementId])

  const createShapeElement = (type, startX, startY, endX, endY) => {
    const x = Math.min(startX, endX)
    const y = Math.min(startY, endY)
    const width = Math.abs(endX - startX)
    const height = Math.abs(endY - startY)
    if (!width || !height) return null

    return {
      id: `element-${elementIdRef.current++}`,
      type,
      position: { x, y },
      dimensions: { width, height },
      fillColor: fillColorEnabled ? fillColor : 'transparent',
      strokeColor,
      strokeWidth,
    }
  }

  const triangleArea = (a, b, c) =>
    Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2)

  const getPenBounds = (points) => {
    if (!points.length) return { x: 0, y: 0, width: 0, height: 0 }
    let minX = points[0].x
    let minY = points[0].y
    let maxX = points[0].x
    let maxY = points[0].y
    points.forEach((point) => {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    })
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
  }

  const isPointInShape = (shape, x, y) => {
    const { x: sx, y: sy } = shape.position
    const { width, height } = shape.dimensions

    if (shape.type === 'rectangle') {
      return x >= sx && x <= sx + width && y >= sy && y <= sy + height
    }

    if (shape.type === 'circle') {
      const centerX = sx + width / 2
      const centerY = sy + height / 2
      const radius = Math.max(Math.min(width, height) / 2, 1)
      return (x - centerX) ** 2 + (y - centerY) ** 2 <= radius ** 2
    }

    const p1 = { x: sx + width / 2, y: sy }
    const p2 = { x: sx, y: sy + height }
    const p3 = { x: sx + width, y: sy + height }
    const total = triangleArea(p1, p2, p3)
    const a1 = triangleArea({ x, y }, p2, p3)
    const a2 = triangleArea(p1, { x, y }, p3)
    const a3 = triangleArea(p1, p2, { x, y })
    return Math.abs(total - (a1 + a2 + a3)) < 0.8
  }

  const isPointInPenElement = (element, x, y) => {
    const ctx = ctxRef.current
    if (!ctx || !element.points.length) return false
    const path = getPenPath2D(element.points, element.isClosed)
    ctx.save()
    ctx.lineWidth = element.strokeWidth + 6
    const insideStroke = ctx.isPointInStroke(path, x, y)
    const insideFill = element.isClosed ? ctx.isPointInPath(path, x, y) : false
    ctx.restore()
    return insideStroke || insideFill
  }

  const findTopElementAtPoint = (x, y) => {
    for (let index = elements.length - 1; index >= 0; index -= 1) {
      const element = elements[index]
      if (element.type === 'pen' && isPointInPenElement(element, x, y)) return element
      if (element.type !== 'pen' && isPointInShape(element, x, y)) return element
    }
    return null
  }

  const handleMouseDown = (event) => {
    const offsetX = event.nativeEvent.offsetX
    const offsetY = event.nativeEvent.offsetY
    interactionRef.current.pointerDown = true

    if (selectedTool === 'eraser') {
      const targetElement = findTopElementAtPoint(offsetX, offsetY)
      if (!targetElement) return
      setElements((prev) => prev.filter((element) => element.id !== targetElement.id))
      if (selectedElementId === targetElement.id) {
        setSelectedElementId(null)
      }
      return
    }

    if (selectedTool === 'pen') {
      const newPath = {
        id: `element-${elementIdRef.current++}`,
        type: 'pen',
        points: [{ x: offsetX, y: offsetY }],
        isClosed: false,
        fillColor: fillColorEnabled ? fillColor : 'transparent',
        strokeColor,
        strokeWidth,
      }
      interactionRef.current.isDrawing = true
      interactionRef.current.drawingPathId = newPath.id
      setElements((prev) => [...prev, newPath])
      setSelectedElementId(newPath.id)
      return
    }

    if (SHAPE_TOOLS.includes(selectedTool)) {
      interactionRef.current.isDrawing = true
      interactionRef.current.startX = offsetX
      interactionRef.current.startY = offsetY
      interactionRef.current.previewElement = null
      setSelectedElementId(null)
      return
    }

    if (selectedTool === 'select') {
      const hitElement = findTopElementAtPoint(offsetX, offsetY)
      if (!hitElement) {
        setSelectedElementId(null)
        interactionRef.current.isDragging = false
        interactionRef.current.dragTargetId = null
        return
      }
      setSelectedElementId(hitElement.id)
      interactionRef.current.isDragging = true
      interactionRef.current.dragTargetId = hitElement.id
      interactionRef.current.dragLastX = offsetX
      interactionRef.current.dragLastY = offsetY
    }
  }

  const handleMouseMove = (event) => {
    if (!interactionRef.current.pointerDown) return
    const offsetX = event.nativeEvent.offsetX
    const offsetY = event.nativeEvent.offsetY

    if (selectedTool === 'pen' && interactionRef.current.isDrawing) {
      const pathId = interactionRef.current.drawingPathId
      if (!pathId) return
      setElements((prev) =>
        prev.map((element) =>
          element.id === pathId
            ? {
                ...element,
                points: [...element.points, { x: offsetX, y: offsetY }],
              }
            : element,
        ),
      )
      return
    }

    if (selectedTool === 'eraser') {
      const targetElement = findTopElementAtPoint(offsetX, offsetY)
      if (!targetElement) return
      setElements((prev) => prev.filter((element) => element.id !== targetElement.id))
      if (selectedElementId === targetElement.id) {
        setSelectedElementId(null)
      }
      return
    }

    if (
      selectedTool === 'select' &&
      interactionRef.current.isDragging &&
      interactionRef.current.dragTargetId
    ) {
      const deltaX = offsetX - interactionRef.current.dragLastX
      const deltaY = offsetY - interactionRef.current.dragLastY
      interactionRef.current.dragLastX = offsetX
      interactionRef.current.dragLastY = offsetY

      if (!deltaX && !deltaY) return

      setElements((prev) =>
        prev.map((element) => {
          if (element.id !== interactionRef.current.dragTargetId) return element
          if (element.type === 'pen') {
            return {
              ...element,
              points: element.points.map((point) => ({
                x: point.x + deltaX,
                y: point.y + deltaY,
              })),
            }
          }
          return {
            ...element,
            position: {
              x: element.position.x + deltaX,
              y: element.position.y + deltaY,
            },
          }
        }),
      )
      return
    }

    if (interactionRef.current.isDrawing && SHAPE_TOOLS.includes(selectedTool)) {
      const previewShape = createShapeElement(
        selectedTool,
        interactionRef.current.startX,
        interactionRef.current.startY,
        offsetX,
        offsetY,
      )
      interactionRef.current.previewElement = previewShape
      redraw(previewShape)
    }
  }

  const finalizePenElement = (element, releasePoint) => {
    if (element.type !== 'pen') return element
    const points = [...element.points, releasePoint]
    if (points.length < 3) {
      return { ...element, points, isClosed: false, fillColor: 'transparent' }
    }

    const start = points[0]
    const end = points[points.length - 1]
    const closeThreshold = Math.max(CLOSE_THRESHOLD, element.strokeWidth * 2.5)
    const distance = Math.hypot(start.x - end.x, start.y - end.y)
    const isClosed = distance <= closeThreshold

    if (!isClosed) {
      return { ...element, points, isClosed: false, fillColor: 'transparent' }
    }

    const snappedPoints = [...points]
    snappedPoints[snappedPoints.length - 1] = { x: start.x, y: start.y }
    return {
      ...element,
      points: snappedPoints,
      isClosed: true,
      fillColor: fillColorEnabled ? fillColor : 'transparent',
    }
  }

  const handleMouseUp = (event) => {
    interactionRef.current.pointerDown = false
    interactionRef.current.isDragging = false
    interactionRef.current.dragTargetId = null
    if (selectedTool === 'pen' && interactionRef.current.isDrawing) {
      const pathId = interactionRef.current.drawingPathId
      interactionRef.current.isDrawing = false
      interactionRef.current.drawingPathId = null
      if (!pathId) return

      setElements((prev) =>
        prev.map((element) => {
          if (element.id !== pathId) return element
          return finalizePenElement(element, {
            x: event.nativeEvent.offsetX,
            y: event.nativeEvent.offsetY,
          })
        }),
      )
      return
    }

    if (interactionRef.current.isDrawing && SHAPE_TOOLS.includes(selectedTool)) {
      const finalShape = createShapeElement(
        selectedTool,
        interactionRef.current.startX,
        interactionRef.current.startY,
        event.nativeEvent.offsetX,
        event.nativeEvent.offsetY,
      )
      interactionRef.current.isDrawing = false
      interactionRef.current.previewElement = null

      if (!finalShape) {
        redraw()
        return
      }

      setElements((prev) => [...prev, finalShape])
      setSelectedElementId(finalShape.id)
      setSelectedTool('select')
    }
  }

  const selectedElement = useMemo(
    () => elements.find((element) => element.id === selectedElementId) || null,
    [elements, selectedElementId],
  )

  const canFillSelected = useMemo(() => {
    if (!selectedElement) return false
    if (selectedElement.type === 'pen') return selectedElement.isClosed
    return true
  }, [selectedElement])

  const updateSelectedElement = (changes) => {
    if (!selectedElementId) return
    setElements((prev) =>
      prev.map((element) => {
        if (element.id !== selectedElementId) return element

        const hasChange = Object.entries(changes).some(
          ([key, value]) => element[key] !== value,
        )
        if (!hasChange) return element

        return { ...element, ...changes }
      }),
    )
  }

  useEffect(() => {
    if (!selectedElementId || !canFillSelected) return
    updateSelectedElement({
      fillColor: fillColorEnabled ? fillColor : 'transparent',
    })
  }, [fillColor, fillColorEnabled, selectedElementId, canFillSelected])

  useEffect(() => {
    if (!selectedElementId) return
    updateSelectedElement({ strokeColor, strokeWidth })
  }, [strokeColor, strokeWidth, selectedElementId])

  useEffect(() => {
    if (!selectedElementId) return
    const current = elements.find((element) => element.id === selectedElementId)
    if (!current) return

    const canFill = current.type !== 'pen' || current.isClosed
    const nextFillEnabled = canFill ? current.fillColor !== 'transparent' : false

    if (fillColorEnabled !== nextFillEnabled) setFillColorEnabled(nextFillEnabled)
    if (canFill && current.fillColor !== 'transparent' && fillColor !== current.fillColor) {
      setFillColor(current.fillColor)
      const paletteIndex = COLORS.findIndex((color) => color === current.fillColor)
      setSelectedColorIndex((prev) => {
        const nextIndex = paletteIndex >= 0 ? paletteIndex : 4
        return prev === nextIndex ? prev : nextIndex
      })
    }
    if (strokeColor !== current.strokeColor) setStrokeColor(current.strokeColor)
    if (strokeWidth !== current.strokeWidth) setStrokeWidth(current.strokeWidth)
    // Only sync toolbar fields when switching selected element.
    // Avoids rapid feedback loops while painting/filling.
  }, [selectedElementId])

  const clearCanvas = () => {
    setElements([])
    setSelectedElementId(null)
  }

  const saveImage = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `${Date.now()}.jpg`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  const handleColorPick = (value) => {
    if (!selectedElementId || !canFillSelected) return
    setFillColor(value)
    setSelectedColorIndex(4)
  }

  const cursorMode = useMemo(() => {
    if (SHAPE_TOOLS.includes(selectedTool)) return 'crosshair'
    if (selectedTool === 'pen') return 'crosshair'
    if (selectedTool === 'eraser') return 'not-allowed'
    if (selectedTool === 'select') return 'pointer'
    return 'default'
  }, [selectedTool])

  return (
    <main className="relative h-screen overflow-hidden bg-slate-50 p-4 sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_38%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.14),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.8),rgba(241,245,249,0.95))]" />

      <div className="relative mx-auto flex h-full w-full max-w-[1180px] min-h-0 flex-col gap-4 lg:flex-row">
        <ToolsBoard
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
          fillColor={fillColorEnabled}
          onToggleFillColor={setFillColorEnabled}
          strokeWidth={strokeWidth}
          onChangeStrokeWidth={setStrokeWidth}
          strokeColor={strokeColor}
          onChangeStrokeColor={setStrokeColor}
          colors={COLORS}
          selectedColor={fillColor}
          selectedColorIndex={selectedColorIndex}
          onSelectColor={(color, index) => {
            if (!selectedElementId || !canFillSelected) return
            setFillColor(color)
            setSelectedColorIndex(index)
          }}
          onPickColor={handleColorPick}
          onClearCanvas={clearCanvas}
          onSaveImage={saveImage}
          hasSelection={Boolean(selectedElementId)}
          canFillSelection={canFillSelected}
        />

        <DrawingBoard
          canvasRef={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          cursorMode={cursorMode}
        />
      </div>
    </main>
  )
}

export default DrawingApp
