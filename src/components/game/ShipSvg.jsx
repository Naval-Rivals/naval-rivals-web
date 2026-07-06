/**
 * ShipSvg - Componente SVG genérico de navio visto de cima.
 * Casco afilado na proa (ponta real) e popa com "espelho de popa" reto.
 * Inclui ponte de comando, chaminé e (em navios maiores) canhão de proa.
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
  const length = cellSize * size;
  const width = cellSize;
  const isVertical = orientation === "vertical";

  const svgWidth = isVertical ? width : length;
  const svgHeight = isVertical ? length : width;

  const pad = 4;
  const bodyWidth = width - pad * 2; // espessura do casco (eixo curto)
  const bodyLength = length - pad * 2; // comprimento do casco (eixo longo)

  // Proa (ponta) mais comprida, popa mais curta - proporcional à espessura
  // do casco, mas limitada para não ficar exagerada em navios grandes.
  const bowTaper = Math.min(bodyLength * 0.32, bodyWidth * 1.7);
  const sternTaper = Math.min(bodyLength * 0.14, bodyWidth * 0.55);

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
          bowTaper={bowTaper}
          sternTaper={sternTaper}
          pad={pad}
          color={color}
          size={size}
          cellSize={cellSize}
        />
      ) : (
        <HorizontalShip
          bodyWidth={bodyWidth}
          bodyLength={bodyLength}
          bowTaper={bowTaper}
          sternTaper={sternTaper}
          pad={pad}
          color={color}
          size={size}
          cellSize={cellSize}
        />
      )}
    </svg>
  );
}

function HorizontalShip({
  bodyWidth,
  bodyLength,
  bowTaper,
  sternTaper,
  pad,
  color,
  size,
  cellSize,
}) {
  const cx = pad;
  const cy = pad;
  const h = bodyWidth; // eixo curto (largura do casco)
  const w = bodyLength; // eixo longo (proa à direita)

  const midY = cy + h / 2;

  // Casco: popa (esquerda) com espelho reto e cantos suavizados,
  // corpo reto no meio, proa (direita) afilando até uma ponta real.
  const hullPath = `
    M ${cx + sternTaper} ${cy}
    L ${cx + w - bowTaper} ${cy}
    Q ${cx + w - bowTaper * 0.35} ${cy} ${cx + w} ${midY}
    Q ${cx + w - bowTaper * 0.35} ${cy + h} ${cx + w - bowTaper} ${cy + h}
    L ${cx + sternTaper} ${cy + h}
    Q ${cx} ${cy + h} ${cx} ${cy + h - sternTaper}
    L ${cx} ${cy + sternTaper}
    Q ${cx} ${cy} ${cx + sternTaper} ${cy}
    Z
  `;

  // Ponte de comando: posicionada por volta de ~38% do comprimento
  // (a partir da popa), sempre dentro do trecho reto do casco.
  const bridgeLen = Math.min(cellSize * 0.42, w * 0.22);
  const bridgeW = h * 0.6;
  const straightStart = cx + sternTaper + 2;
  const straightEnd = cx + w - bowTaper - 2;
  const bridgeX = Math.min(
    straightStart + (straightEnd - straightStart) * 0.34,
    straightEnd - bridgeLen,
  );
  const bridgeY = midY - bridgeW / 2;

  // Chaminé: logo atrás (a ré) da ponte
  const funnelR = cellSize * 0.11;
  const funnelX = Math.max(bridgeX - funnelR * 2.2, straightStart + funnelR);

  // Canhão de proa: em navios de 3+ células, entre a ponte e a proa
  const showBowGun = size >= 3;
  const gunX =
    bridgeX + bridgeLen + (straightEnd - (bridgeX + bridgeLen)) * 0.55;
  const gunR = cellSize * 0.09;

  return (
    <g>
      {/* Casco */}
      <path d={hullPath} fill={color} opacity={0.28} />
      <path
        d={hullPath}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Chaminé */}
      <circle cx={funnelX} cy={midY} r={funnelR} fill={color} opacity={0.55} />

      {/* Ponte de comando */}
      <rect
        x={bridgeX}
        y={bridgeY}
        width={bridgeLen}
        height={bridgeW}
        rx={2.5}
        fill={color}
        opacity={0.55}
        stroke={color}
        strokeWidth={0.6}
      />
      {/* Vigias/janelas da ponte */}
      <rect
        x={bridgeX + bridgeLen * 0.2}
        y={bridgeY + bridgeW * 0.28}
        width={bridgeLen * 0.6}
        height={bridgeW * 0.16}
        fill="white"
        opacity={0.35}
      />

      {/* Canhão de proa (navios grandes) - torreta com canos */}
      {showBowGun && (
        <g>
          {/* Base da torreta */}
          <circle
            cx={gunX}
            cy={midY}
            r={gunR * 1.6}
            fill={color}
            opacity={0.5}
            stroke={color}
            strokeWidth={0.7}
          />
          {/* Cano superior */}
          <rect
            x={gunX}
            y={midY - gunR * 1.4}
            width={bowTaper * 0.3}
            height={gunR}
            rx={0.8}
            fill={color}
            opacity={0.7}
          />
          {/* Cano inferior */}
          <rect
            x={gunX}
            y={midY + gunR * 0.4}
            width={bowTaper * 0.3}
            height={gunR}
            rx={0.8}
            fill={color}
            opacity={0.7}
          />
        </g>
      )}

      {/* Ponta da proa em destaque */}
      <circle
        cx={cx + w - bowTaper * 0.15}
        cy={midY}
        r={1.6}
        fill={color}
        opacity={0.7}
      />
    </g>
  );
}

function VerticalShip({
  bodyWidth,
  bodyLength,
  bowTaper,
  sternTaper,
  pad,
  color,
  size,
  cellSize,
}) {
  const cx = pad;
  const cy = pad;
  const w = bodyWidth; // eixo curto (largura do casco)
  const h = bodyLength; // eixo longo (proa embaixo)

  const midX = cx + w / 2;

  // Casco: popa (topo) com espelho reto, corpo reto no meio,
  // proa (embaixo) afilando até uma ponta real.
  const hullPath = `
    M ${cx} ${cy + sternTaper}
    Q ${cx} ${cy} ${cx + sternTaper} ${cy}
    L ${cx + w - sternTaper} ${cy}
    Q ${cx + w} ${cy} ${cx + w} ${cy + sternTaper}
    L ${cx + w} ${cy + h - bowTaper}
    Q ${cx + w} ${cy + h - bowTaper * 0.35} ${midX} ${cy + h}
    Q ${cx} ${cy + h - bowTaper * 0.35} ${cx} ${cy + h - bowTaper}
    Z
  `;

  const bridgeLen = Math.min(cellSize * 0.42, h * 0.22);
  const bridgeW = w * 0.6;
  const straightStart = cy + sternTaper + 2;
  const straightEnd = cy + h - bowTaper - 2;
  const bridgeY = Math.min(
    straightStart + (straightEnd - straightStart) * 0.34,
    straightEnd - bridgeLen,
  );
  const bridgeX = midX - bridgeW / 2;

  const funnelR = cellSize * 0.11;
  const funnelY = Math.max(bridgeY - funnelR * 2.2, straightStart + funnelR);

  const showBowGun = size >= 3;
  const gunY =
    bridgeY + bridgeLen + (straightEnd - (bridgeY + bridgeLen)) * 0.55;
  const gunR = cellSize * 0.09;

  return (
    <g>
      {/* Casco */}
      <path d={hullPath} fill={color} opacity={0.28} />
      <path
        d={hullPath}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Chaminé */}
      <circle cx={midX} cy={funnelY} r={funnelR} fill={color} opacity={0.55} />

      {/* Ponte de comando */}
      <rect
        x={bridgeX}
        y={bridgeY}
        width={bridgeW}
        height={bridgeLen}
        rx={2.5}
        fill={color}
        opacity={0.55}
        stroke={color}
        strokeWidth={0.6}
      />
      {/* Vigias/janelas da ponte */}
      <rect
        x={bridgeX + bridgeW * 0.28}
        y={bridgeY + bridgeLen * 0.2}
        width={bridgeW * 0.16}
        height={bridgeLen * 0.6}
        fill="white"
        opacity={0.35}
      />

      {/* Canhão de proa (navios grandes) - torreta com canos */}
      {showBowGun && (
        <g>
          {/* Base da torreta */}
          <circle
            cx={midX}
            cy={gunY}
            r={gunR * 1.6}
            fill={color}
            opacity={0.5}
            stroke={color}
            strokeWidth={0.7}
          />
          {/* Cano esquerdo */}
          <rect
            x={midX - gunR * 1.4}
            y={gunY}
            width={gunR * 0.8}
            height={bowTaper * 0.3}
            rx={0.8}
            fill={color}
            opacity={0.7}
          />
          {/* Cano direito */}
          <rect
            x={midX + gunR * 0.6}
            y={gunY}
            width={gunR * 0.8}
            height={bowTaper * 0.3}
            rx={0.8}
            fill={color}
            opacity={0.7}
          />
        </g>
      )}

      {/* Ponta da proa em destaque */}
      <circle
        cx={midX}
        cy={cy + h - bowTaper * 0.15}
        r={1.6}
        fill={color}
        opacity={0.7}
      />
    </g>
  );
}

export default ShipSvg;
