import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const Canvas = forwardRef(function Canvas(
  { color, brushSize, tool, onDrawingComplete, onDrawingStart },
  ref
) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const startPoint = useRef(null);
  const previewSnapshot = useRef(null);

  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState(null);

  // Convert hex color (#ff0000) to RGB
  const hexToRgb = (hex) => {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    };
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 1000;
    canvas.height = 600;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Get mouse position relative to canvas
  const getMousePosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY),
    };
  };

  // =========================
  // FLOOD FILL
  // =========================

  const floodFill = (startX, startY) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const imageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const pixels = imageData.data;

    const width = canvas.width;
    const height = canvas.height;

    // Index of clicked pixel
    const startIndex = (startY * width + startX) * 4;

    const targetR = pixels[startIndex];
    const targetG = pixels[startIndex + 1];
    const targetB = pixels[startIndex + 2];
    const targetA = pixels[startIndex + 3];

    // Selected color
    const { r, g, b } = hexToRgb(color);

    // If clicked color is already selected color
    if (
      targetR === r &&
      targetG === g &&
      targetB === b &&
      targetA === 255
    ) {
      return;
    }

    // Convert x,y into pixel-array index
    const getIndex = (x, y) => {
      return (y * width + x) * 4;
    };

    // Check whether pixel has original color
    const matchesTarget = (x, y) => {
      const index = getIndex(x, y);

      return (
        pixels[index] === targetR &&
        pixels[index + 1] === targetG &&
        pixels[index + 2] === targetB &&
        pixels[index + 3] === targetA
      );
    };

    // BFS queue
    const queue = [[startX, startY]];

    while (queue.length > 0) {
      const [x, y] = queue.shift();

      // Outside canvas
      if (
        x < 0 ||
        x >= width ||
        y < 0 ||
        y >= height
      ) {
        continue;
      }

      // Not the original color
      if (!matchesTarget(x, y)) {
        continue;
      }

      const index = getIndex(x, y);

      // Change pixel color
      pixels[index] = r;
      pixels[index + 1] = g;
      pixels[index + 2] = b;
      pixels[index + 3] = 255;

      // Add neighbors
      queue.push([x + 1, y]);
      queue.push([x - 1, y]);
      queue.push([x, y + 1]);
      queue.push([x, y - 1]);
    }

    // Put modified pixels back onto canvas
    ctx.putImageData(imageData, 0, 0);
  };

  const drawText = () => {
    if (!textInput || !textPosition) {
      setTextPosition(null);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = color;
    ctx.font = `${brushSize * 5}px Arial`;

    ctx.fillText(
      textInput,
      textPosition.x,
      textPosition.y
    );

    setTextInput("");
    setTextPosition(null);

    if (onDrawingComplete) {
      onDrawingComplete();
    }
  };

  // =========================
  // START DRAWING
  // =========================

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const { x, y } = getMousePosition(e);

    if (tool === "text") {
      setTextPosition({ x, y });
      setTextInput("");
      return;
    }

    // =========================
    // FILL TOOL
    // =========================

    if (tool === "fill") {
      if (onDrawingStart) {
        onDrawingStart();
      }

      floodFill(x, y);

      if (onDrawingComplete) {
        onDrawingComplete();
      }

      return;
    }

    // Start drawing
    isDrawing.current = true;

    // Save state before drawing
    if (onDrawingStart) {
      onDrawingStart();
    }

    // =========================
    // SHAPE TOOLS
    // =========================

    if (
      tool === "line" ||
      tool === "rectangle" ||
      tool === "circle" ||
      tool === "triangle"
    ) {
      startPoint.current = { x, y };

      // Save current canvas for preview
      previewSnapshot.current = canvas.toDataURL();

      return;
    }

    // =========================
    // BRUSH / ERASER
    // =========================

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // =========================
  // DRAW / PREVIEW
  // =========================

  const draw = (e) => {
    if (!isDrawing.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const { x, y } = getMousePosition(e);

    // =========================
    // SHAPE PREVIEW
    // =========================

    if (
      tool === "line" ||
      tool === "rectangle" ||
      tool === "circle" ||
      tool === "triangle"
    ) {
      const start = startPoint.current;

      const image = new Image();

      image.onload = () => {
        // Restore original canvas
        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        ctx.drawImage(image, 0, 0);

        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = color;

        // =========================
        // LINE
        // =========================

        if (tool === "line") {
          ctx.beginPath();

          ctx.moveTo(start.x, start.y);
          ctx.lineTo(x, y);

          ctx.stroke();
        }

        // =========================
        // RECTANGLE
        // =========================

        if (tool === "rectangle") {
          ctx.beginPath();

          ctx.strokeRect(
            start.x,
            start.y,
            x - start.x,
            y - start.y
          );
        }

        // =========================
        // CIRCLE
        // =========================

        if (tool === "circle") {
          const radius = Math.sqrt(
            Math.pow(x - start.x, 2) +
              Math.pow(y - start.y, 2)
          );

          ctx.beginPath();

          ctx.arc(
            start.x,
            start.y,
            radius,
            0,
            Math.PI * 2
          );

          ctx.stroke();
        }

        // =========================
        // TRIANGLE
        // =========================

        if (tool === "triangle") {
          const width = x - start.x;

          const topX =
            start.x + width / 2;

          ctx.beginPath();

          ctx.moveTo(
            topX,
            start.y
          );

          ctx.lineTo(
            start.x,
            y
          );

          ctx.lineTo(
            x,
            y
          );

          ctx.closePath();

          ctx.stroke();
        }
      };

      image.src = previewSnapshot.current;

      return;
    }

    // =========================
    // BRUSH / ERASER
    // =========================

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.strokeStyle = "white";
    } else {
      ctx.strokeStyle = color;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // =========================
  // STOP DRAWING
  // =========================

  const stopDrawing = (e) => {
    if (!isDrawing.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // =========================
    // SHAPES
    // =========================

    if (
      tool === "line" ||
      tool === "rectangle" ||
      tool === "circle" ||
      tool === "triangle"
    ) {
      const { x, y } = getMousePosition(e);
      const start = startPoint.current;

      const image = new Image();

      image.onload = () => {
        // Restore original canvas
        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        ctx.drawImage(image, 0, 0);

        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = color;

        // LINE
        if (tool === "line") {
          ctx.beginPath();

          ctx.moveTo(start.x, start.y);
          ctx.lineTo(x, y);

          ctx.stroke();
        }

        // RECTANGLE
        if (tool === "rectangle") {
          ctx.beginPath();

          ctx.strokeRect(
            start.x,
            start.y,
            x - start.x,
            y - start.y
          );
        }

        // CIRCLE
        if (tool === "circle") {
          const radius = Math.sqrt(
            Math.pow(x - start.x, 2) +
              Math.pow(y - start.y, 2)
          );

          ctx.beginPath();

          ctx.arc(
            start.x,
            start.y,
            radius,
            0,
            Math.PI * 2
          );

          ctx.stroke();
        }

        // TRIANGLE
        if (tool === "triangle") {
          const width = x - start.x;

          const topX =
            start.x + width / 2;

          ctx.beginPath();

          ctx.moveTo(
            topX,
            start.y
          );

          ctx.lineTo(
            start.x,
            y
          );

          ctx.lineTo(
            x,
            y
          );

          ctx.closePath();

          ctx.stroke();
        }
      };

      image.src = previewSnapshot.current;

      startPoint.current = null;
      previewSnapshot.current = null;

      isDrawing.current = false;

      if (onDrawingComplete) {
        onDrawingComplete();
      }

      return;
    }

    // =========================
    // BRUSH / ERASER
    // =========================

    isDrawing.current = false;

    ctx.closePath();

    if (onDrawingComplete) {
      onDrawingComplete();
    }
  };

  // =========================
  // FUNCTIONS ACCESSIBLE FROM APP
  // =========================

  useImperativeHandle(ref, () => ({
    // Get actual canvas
    getCanvas: () => canvasRef.current,

    // Clear canvas
    clearCanvas: () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.fillStyle = "white";

      ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    },

    // Get canvas snapshot
    getSnapshot: () => {
      const canvas = canvasRef.current;

      return canvas.toDataURL();
    },

    // Restore canvas snapshot
    restoreSnapshot: (snapshot) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const image = new Image();

      image.onload = () => {
        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        ctx.drawImage(
          image,
          0,
          0
        );
      };

      image.src = snapshot;
    },
  }));

  // =========================
  // CANVAS JSX
  // =========================

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      {textPosition && (
        <input
          type="text"
          value={textInput}
          autoFocus
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              drawText();
            }
          }}
          style={{
            position: "absolute",
            left: textPosition.x,
            top: textPosition.y,
          }}
        />
      )}
    </div>
  );
});

export default Canvas;