function DrawingBoard({ canvasRef, onMouseDown, onMouseMove, onMouseUp, cursorMode }) {
  return (
    <section className="relative h-full min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/20 bg-white/70 shadow-[0_18px_55px_rgba(15,23,42,0.28)] backdrop-blur-xl">
      <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-medium tracking-wide text-white">
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
