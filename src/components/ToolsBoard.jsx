function ToolButton({ id, label, icon, selectedTool, onSelectTool }) {
  const active = selectedTool === id

  return (
    <li
      className={`mb-2 flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition-all duration-200 ${
        active
          ? 'border-blue-400/60 bg-blue-500/10 shadow-[0_8px_24px_rgba(59,130,246,0.24)]'
          : 'border-slate-200 bg-white/70 hover:border-blue-200 hover:bg-white'
      }`}
      onClick={() => onSelectTool(id)}
    >
      <img
        src={icon}
        alt=""
        className={`h-[18px] w-[18px] ${
          active
            ? 'filter-[invert(17%)_sepia(90%)_saturate(3000%)_hue-rotate(900deg)_brightness(100%)_contrast(100%)]'
            : 'opacity-70'
        }`}
      />
      <span
        className={`cursor-pointer text-sm font-medium ${
          active ? 'text-blue-700' : 'text-slate-700'
        }`}
      >
        {label}
      </span>
    </li>
  )
}

function ColorOption({
  color,
  isSelected,
  isFirst,
  onClick,
  children,
}) {
  return (
    <li
      onClick={onClick}
      className={`relative mt-[3px] h-[28px] w-[28px] cursor-pointer rounded-full border transition-transform hover:scale-110 ${
        isFirst ? 'border-slate-300' : 'border-white/60'
      }`}
      style={{ backgroundColor: color }}
    >
      {isSelected ? (
        <span
          className={`absolute left-1/2 top-1/2 h-[16px] w-[16px] -translate-x-1/2 -translate-y-1/2 rounded-[inherit] border-2 ${
            isFirst ? 'border-slate-400' : 'border-white'
          }`}
          style={{ backgroundColor: color }}
        />
      ) : null}
      {children}
    </li>
  )
}

function ToolsBoard({
  selectedTool,
  onSelectTool,
  fillColor,
  onToggleFillColor,
  strokeWidth,
  onChangeStrokeWidth,
  strokeColor,
  onChangeStrokeColor,
  colors,
  selectedColor,
  selectedColorIndex,
  onSelectColor,
  onPickColor,
  onClearCanvas,
  onSaveImage,
  hasSelection,
  canFillSelection,
}) {
  return (
    <section className="flex h-full min-h-0 w-full flex-col rounded-2xl border border-white/20 bg-white/70 px-3 pb-3 pt-3 shadow-[0_18px_55px_rgba(15,23,42,0.22)] backdrop-blur-xl sm:px-4 lg:w-[300px] lg:shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Canvas Craft</p>
          <h1 className="text-lg font-semibold text-slate-800">Tools</h1>
        </div>
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Kid Mode</div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="mb-3 rounded-xl border border-slate-200/80 bg-white/70 p-2.5">
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Step 1: Draw or Select</label>
          <ul className="mt-2 list-none">
          <ToolButton
            id="select"
            label="Select and Move"
            icon="/icons/brush.svg"
            selectedTool={selectedTool}
            onSelectTool={onSelectTool}
          />
          <ToolButton
            id="pen"
            label="Pen (free draw)"
            icon="/icons/brush.svg"
            selectedTool={selectedTool}
            onSelectTool={onSelectTool}
          />
          <ToolButton
            id="rectangle"
            label="Rectangle"
            icon="/icons/rectangle.svg"
            selectedTool={selectedTool}
            onSelectTool={onSelectTool}
          />
          <ToolButton
            id="circle"
            label="Circle"
            icon="/icons/circle.svg"
            selectedTool={selectedTool}
            onSelectTool={onSelectTool}
          />
          <ToolButton
            id="triangle"
            label="Triangle"
            icon="/icons/triangle.svg"
            selectedTool={selectedTool}
            onSelectTool={onSelectTool}
          />
          <ToolButton
            id="eraser"
            label="Eraser"
            icon="/icons/eraser.svg"
            selectedTool={selectedTool}
            onSelectTool={onSelectTool}
          />
            <li className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onToggleFillColor(true)}
                disabled={!hasSelection || !canFillSelection}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                  fillColor
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-700'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                Add Color
              </button>
              <button
                type="button"
                onClick={() => onToggleFillColor(false)}
                disabled={!hasSelection || !canFillSelection}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                  !fillColor
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-slate-300 bg-white text-slate-700'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                Remove Color
              </button>
            </li>
          </ul>
        </div>

        <div className="mb-3 rounded-xl border border-slate-200/80 bg-white/70 p-2.5">
          <div className="group relative inline-flex">
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Step 2: Border Settings
            </label>
            {!hasSelection || !canFillSelection ? (
              <span className="pointer-events-none absolute left-0 top-full z-10 mt-1 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                First add shape
              </span>
            ) : null}
          </div>
          <ul className="mt-2 list-none">
            <li className="mb-1 mt-2">
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-600">
                <span>Border thickness</span>
                <span>{strokeWidth}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={strokeWidth}
                onChange={(e) => onChangeStrokeWidth(Number(e.target.value))}
                disabled={!hasSelection}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </li>
            <li className="mt-3">
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Border color (outline)</label>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => onChangeStrokeColor(e.target.value)}
                disabled={!hasSelection}
                className="h-9 w-full cursor-pointer rounded-lg border border-slate-300 bg-white p-1 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </li>
          </ul>
        </div>

        <div className="mb-3 rounded-xl border border-slate-200/80 bg-white/70 p-2.5">
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Step 3: Fill Color</label>
          <ul className="mt-2 flex list-none justify-between gap-2">
          {colors.map((color, index) => (
            <ColorOption
              key={color + index}
              color={index === 4 ? selectedColor : color}
              isSelected={selectedColorIndex === index}
              isFirst={index === 0}
              onClick={() => {
                if (!hasSelection || !canFillSelection) return
                onSelectColor(index === 4 ? selectedColor : color, index)
              }}
            >
              {index === 4 ? (
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => onPickColor(e.target.value)}
                  disabled={!hasSelection || !canFillSelection}
                  className="h-[28px] w-[28px] cursor-pointer opacity-0 disabled:cursor-not-allowed"
                />
              ) : null}
            </ColorOption>
          ))}
          </ul>
        </div>
      </div>

      <div className="mt-2">
        <button
          type="button"
          onClick={onClearCanvas}
          className="mb-3 w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all duration-200 hover:border-slate-400 hover:bg-slate-50"
        >
          Clear Canvas
        </button>
        <button
          type="button"
          onClick={onSaveImage}
          className="w-full cursor-pointer rounded-xl border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white outline-none transition-all duration-200 hover:border-blue-700 hover:bg-blue-700"
        >
          Save As Image
        </button>
      </div>
    </section>
  )
}

export default ToolsBoard
