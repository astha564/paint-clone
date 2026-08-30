import { useRef, useState } from "react";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";
import "./App.css";

function App() {
  const canvasRef = useRef(null);

  const [tool, setTool] = useState("brush");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const undo = () => {
  if (undoStack.length === 0) return;

  const previousState =
    undoStack[undoStack.length - 1];

  const currentState =
    canvasRef.current.getSnapshot();

  setUndoStack((prev) => prev.slice(0, -1));

  setRedoStack((prev) => [
    ...prev,
    currentState,
  ]);

  canvasRef.current.restoreSnapshot(previousState);
};

const redo = () => {
  if (redoStack.length === 0) return;

  const nextState =
    redoStack[redoStack.length - 1];

  const currentState =
    canvasRef.current.getSnapshot();

  setRedoStack((prev) => prev.slice(0, -1));

  setUndoStack((prev) => [
    ...prev,
    currentState,
  ]);

  canvasRef.current.restoreSnapshot(nextState);
};

const clearCanvas = () => {
  if (!canvasRef.current) return;

  const currentState = canvasRef.current.getSnapshot();

  // Save current drawing so Clear can be undone
  setUndoStack((prev) => [...prev, currentState]);

  // Clear redo history
  setRedoStack([]);

  canvasRef.current.clearCanvas();
};


  const downloadCanvas = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current.getCanvas();

    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");

    link.download = "my-drawing.png";
    link.href = image;

    link.click();
  };

  const resetCanvas = () => {
    if (!canvasRef.current) return;

    canvasRef.current.clearCanvas();

    setTool("brush");
    setColor("#000000");
    setBrushSize(5);

    setUndoStack([]);
    setRedoStack([]);
  };

  const saveState = () => {
  if (!canvasRef.current) return;

  const snapshot = canvasRef.current.getSnapshot();

  setUndoStack((prev) => [...prev, snapshot]);

  // New drawing means redo history is no longer valid
  setRedoStack([]);
}; 

const saveBeforeDrawing = () => {
  if (!canvasRef.current) return;

  const snapshot = canvasRef.current.getSnapshot();

  setUndoStack((prev) => [...prev, snapshot]);

  // Once we start a new drawing,
  // redo history should disappear.
  setRedoStack([]);
};

  return (
    <div className="app">

      <h1>🎨 MS Paint</h1>

      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        onUndo={undo}
        onRedo={redo}
        onClear={clearCanvas}
        onDownload={downloadCanvas}
        onReset={resetCanvas}

      />

      <div className="canvas-container">
        <Canvas
          ref={canvasRef}
          tool={tool}
          color={color}
          brushSize={brushSize}
          onDrawingStart={saveBeforeDrawing}
          // onDrawingComplete={saveState}
        />
      </div>

    </div>
  );
}

export default App;