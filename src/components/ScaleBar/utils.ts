import type { ViewState } from '../PictureInPictureViewer/PictureInPictureViewer.types';

const PADDING = 10;
const BORDER_RADIUS = 12;
const BAR_LINE_WIDTH = 2;
const CAP_HEIGHT = 8;
const FONT_SIZE = 16;
const SPACING = 6;

export function makeBoundingBox(viewState: ViewState) {
  const { target, zoom, width, height } = viewState;
  const scale = Math.pow(2, zoom);
  const worldWidth = width / scale;
  const worldHeight = height / scale;
  const halfWidth = worldWidth / 2;
  const halfHeight = worldHeight / 2;

  const left = target[0] - halfWidth;
  const top = target[1] - halfHeight;
  const right = target[0] + halfWidth;
  const bottom = target[1] + halfHeight;

  return [
    [left, top],
    [right, top],
    [right, bottom],
    [left, bottom]
  ];
}

export function range(length: number): number[] {
  return [...Array(length).keys()];
}

export function drawScaleBarOnCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  viewState: ViewState,
  loader: any[]
) {
  const physicalSize = loader[0]?.meta?.physicalSizes?.x;
  if (!viewState || !physicalSize) return;

  const boundingBox = makeBoundingBox(viewState);
  const barLength = (boundingBox[2][0] - boundingBox[0][0]) * 0.05;
  const barWidthInPixels = barLength * Math.pow(2, viewState.zoom);
  const text = `${parseFloat((barLength * (physicalSize.size || 1)).toPrecision(5)).toFixed(1)} ${physicalSize.unit || 'μm'}`;

  ctx.font = `${FONT_SIZE}px Roboto, sans-serif`;
  const boxWidth = Math.max(barWidthInPixels, ctx.measureText(text).width) + PADDING * 2;
  const boxHeight = CAP_HEIGHT + FONT_SIZE + SPACING + PADDING * 2;
  const x = canvas.width - 55 - boxWidth;
  const y = canvas.height - 50 - boxHeight;

  // Draw background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.roundRect(x, y, boxWidth, boxHeight, BORDER_RADIUS);
  ctx.fill();

  // Draw scale bar with end caps
  const barX = x + (boxWidth - barWidthInPixels) / 2;
  const barY = y + PADDING + CAP_HEIGHT / 2;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = BAR_LINE_WIDTH;
  ctx.lineCap = 'butt';

  // Draw horizontal bar
  ctx.beginPath();
  ctx.moveTo(barX, barY);
  ctx.lineTo(barX + barWidthInPixels, barY);
  ctx.stroke();

  // Draw end caps
  ctx.beginPath();
  ctx.moveTo(barX, barY - CAP_HEIGHT / 2);
  ctx.lineTo(barX, barY + CAP_HEIGHT / 2);
  ctx.moveTo(barX + barWidthInPixels, barY - CAP_HEIGHT / 2);
  ctx.lineTo(barX + barWidthInPixels, barY + CAP_HEIGHT / 2);
  ctx.stroke();

  // Draw text
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, x + boxWidth / 2, y + PADDING + CAP_HEIGHT + SPACING + FONT_SIZE);
}
