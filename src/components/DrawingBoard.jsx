function DrawingBoard({ canvasRef, onMouseDown, onMouseMove, onMouseUp, cursorMode }) {
  return (
    <section className="relative h-full min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 shadow-[0_18px_55px_rgba(15,23,42,0.14)] backdrop-blur-xl">
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-medium tracking-wide text-slate-700">
        Canvas
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={onMouseDown}
        onPointerMove={onMouseMove}
        onPointerUp={onMouseUp}
        onPointerLeave={onMouseUp}
        className="h-full w-full bg-white"
        style={{ cursor: cursorMode }}
      />
    </section>
  )
}

export default DrawingBoard
