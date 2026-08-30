function Toolbar({ 
    tool, 
    setTool, 
    brushSize, 
    setBrushSize, 
    color, 
    setColor,
    onUndo,
    onRedo,
    onClear,
    onDownload,
    onReset,
}) {
    return (
        <div className="toolbar">

            <button
            className={tool === "brush" ? "active" : ""}
            onClick={() => setTool("brush")}
            >
            🖌️ Brush
            </button>

            <button
            className={tool === "eraser" ? "active" : ""}
            onClick={() => setTool("eraser")}
            >
            🧹 Eraser
            </button>

            <button
            className={tool === "line" ? "active" : ""}
            onClick={() => setTool("line")}
            >
            📏 Line
            </button>

            <button
            className={tool === "rectangle" ? "active" : ""}
            onClick={() => setTool("rectangle")}
            >
            ▭ Rectangle
            </button>

            <button
            className={tool === "circle" ? "active" : ""}
            onClick={() => setTool("circle")}
            >
            ⭕ Circle
            </button>

            <button
            className={tool === "triangle" ? "active" : ""}
            onClick={() => setTool("triangle")}
            >
            🔺 Triangle
            </button>

            <button
            className={tool === "fill" ? "active" : ""}
            onClick={() => setTool("fill")}
            >
            🪣 Fill
            </button>

            <button
            className={tool === "text" ? "active" : ""}
            onClick={() => setTool("text")}
            >
            📝 Text
            </button>

            <button onClick={onUndo}>
            ↩️ Undo
            </button>

            <button onClick={onRedo}>
            ↪️ Redo
            </button>

            <button onClick={onClear}>
            🗑️ Clear
            </button>

            <button onClick={onDownload}>
            💾 Save
            </button>

            <button onClick={onReset}>
            🔄 Reset
            </button>

           

            <label>
                Brush Size:
                <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(e.target.value)} 
                />
            </label>

            <label>
                Color:
                <input 
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
            </label>
        </div>
    );

}

export default Toolbar