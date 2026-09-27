function ColorPalette({ color, setColor }) {
  const colors = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#ff8800",
    "#ffff00",
    "#00aa00",
    "#00aaff",
    "#0000ff",
    "#800080",
    "#ff69b4",
    "#8b4513",
    "#808080",
  ];

  return (
    <div className="color-palette">

      <span className="palette-title">
        Colors:
      </span>

      <div className="color-options">
        {colors.map((paletteColor) => (
          <button
            key={paletteColor}
            className={
              color === paletteColor
                ? "color-button selected"
                : "color-button"
            }
            style={{
              backgroundColor: paletteColor,
            }}
            onClick={() => setColor(paletteColor)}
            aria-label={`Select ${paletteColor}`}
          />
        ))}

        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="custom-color"
          title="Choose custom color"
        />
      </div>

    </div>
  );
}

export default ColorPalette;
