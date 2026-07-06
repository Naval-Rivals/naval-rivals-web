/**
 * ShipSvg - Componente SVG genérico de navio visto de cima.
 * Formato cápsula/submarino com proa arredondada e popa achatada.
 * Escala automaticamente para o número de células.
 *
 * Props:
 * - size: número de células que o navio ocupa (2-5)
 * - orientation: "horizontal" | "vertical"
 * - color: cor do navio (default: "currentColor")
 * - className: classes CSS adicionais
 * - cellSize: tamanho de cada célula em px (default: 33)
 */
function ShipSvg({
  size = 3,
  orientation = "horizontal",
  color = "currentColor",
  className = "",
  cellSize = 33,
}) {
  // Dimensions based on orientation
  const length = cellSize * size;
  const width = cellSize;
  const isVertical = orientation === "vertical";

  const svgWidth = isVertical ? width : length;
  const svgHeight = isVertical ? length : width;

  // Padding inside the cell
  const pad = 4;
  const bodyWidth = width - pad * 2;
  const bodyLength = length - pad * 2;

  // Radius for the bow (front) - more pointed
  const bowRadius = bodyWidth / 2;
  // Radius for the stern (back) - slightly rounded
  const sternRadius = bodyWidth / 4;

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {isVertical ? (
        <VerticalShip
          bodyWidth={bodyWidth}
          bodyLength={bodyLength}
          bowRadius={bowRadius}
          sternRadius={sternRadius}
          pad={pad}
          color={color}
          svgWidth={svgWidth}
          svgHeight={svgHeight}
          size={size}
          cellSize={cellSize}
        />
      ) : (
        <HorizontalShip
          bodyWidth={bodyWidth}
          bodyLength={bodyLength}
          bowRadius={bowRadius}
          sternRadius={sternRadius}
          pad={pad}
          color={color}
          svgWidth={svgWidth}
          svgHeight={svgHeight}
          size={size}
          cellSize={cellSize}
        />
      )}
    </svg>
  );
}

function HorizontalShip({ bodyWidth, bodyLength, bowRadius, sternRadius, pad, color, svgWidth, svgHeight, size, cellSize }) {
  const cx = pad;
  const cy = pad;
  const h = bodyWidth;
  const w = bodyLength;

  // Ship hull path - pointed bow (right), rounded stern (left)
  const path = `
    M ${cx + sternRadius} ${cy}
    L ${cx + w - bowRadius} ${cy}
    Q ${cx + w} ${cy} ${cx + w} ${cy + h / 2}
    Q ${cx + w} ${cy + h} ${cx + w - bowRadius} ${cy + h}
    L ${cx + sternRadius} ${cy + h}
    Q ${cx} ${cy + h} ${cx} ${cy + h - sternRadius}
    L ${cx} ${cy + sternRadius}
    Q ${cx} ${cy} ${cx + sternRadius} ${cy}
    Z
  `;

  // Deck line (center line)
  const deckY = cy + h / 2;
  const deckX1 = cx + sternRadius + 2;
  const deckX2 = cx + w - bowRadius - 2;

  // Bridge/cabin position (roughly 30% from stern)
  const bridgeX = cx + w * 0.25;
  const bridgeW = cellSize * 0.5;
  const bridgeH = h * 0.5;
  const bridgeY = cy + (h - bridgeH) / 2;

  return (
    <g>
      {/* Hull */}
      <path d={path} fill={color} opacity={0.3} />
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} />

      {/* Center deck line */}
      <line
        x1={deckX1}
        y1={deckY}
        x2={deckX2}
        y2={deckY}
        stroke={color}
        strokeWidth={0.8}
        opacity={0.5}
        strokeDasharray="3 2"
      />

      {/* Bridge/cabin */}
      <rect
        x={bridgeX}
        y={bridgeY}
        width={bridgeW}
        height={bridgeH}
        rx={3}
        fill={color}
        opacity={0.4}
      />

      {/* Bow detail (small triangle) */}
      <circle
        cx={cx + w - bowRadius * 0.5}
        cy={cy + h / 2}
        r={2}
        fill={color}
        opacity={0.6}
      />
    </g>
  );
}

function VerticalShip({ bodyWidth, bodyLength, bowRadius, sternRadius, pad, color, svgWidth, svgHeight, size, cellSize }) {
  const cx = pad;
  const cy = pad;
  const w = bodyWidth;
  const h = bodyLength;

  // Ship hull path - pointed bow (bottom), rounded stern (top)
  const path = `
    M ${cx} ${cy + sternRadius}
    Q ${cx} ${cy} ${cx + sternRadius} ${cy}
    L ${cx + w - sternRadius} ${cy}
    Q ${cx + w} ${cy} ${cx + w} ${cy + sternRadius}
    L ${cx + w} ${cy + h - bowRadius}
    Q ${cx + w} ${cy + h} ${cx + w / 2} ${cy + h}
    Q ${cx} ${cy + h} ${cx} ${cy + h - bowRadius}
    Z
  `;

  // Deck line (center line)
  const deckX = cx + w / 2;
  const deckY1 = cy + sternRadius + 2;
  const deckY2 = cy + h - bowRadius - 2;

  // Bridge/cabin position
  const bridgeY = cy + h * 0.2;
  const bridgeH = cellSize * 0.5;
  const bridgeW = w * 0.5;
  const bridgeX = cx + (w - bridgeW) / 2;

  return (
    <g>
      {/* Hull */}
      <path d={path} fill={color} opacity={0.3} />
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} />

      {/* Center deck line */}
      <line
        x1={deckX}
        y1={deckY1}
        x2={deckX}
        y2={deckY2}
        stroke={color}
        strokeWidth={0.8}
        opacity={0.5}
        strokeDasharray="3 2"
      />

      {/* Bridge/cabin */}
      <rect
        x={bridgeX}
        y={bridgeY}
        width={bridgeW}
        height={bridgeH}
        rx={3}
        fill={color}
        opacity={0.4}
      />

      {/* Bow detail */}
      <circle
        cx={cx + w / 2}
        cy={cy + h - bowRadius * 0.5}
        r={2}
        fill={color}
        opacity={0.6}
      />
    </g>
  );
}

export default ShipSvg;
