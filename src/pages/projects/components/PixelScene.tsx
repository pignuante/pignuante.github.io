import { type ReactElement } from "react";
import {
  PIXEL_PALETTE,
  PIXEL_SCENE_HEIGHT,
  PIXEL_SCENE_WIDTH,
  PIXEL_SCENES,
  type PixelLayerMotion,
  type PixelSceneId,
} from "../pixelScenes";

const MOTION_CLASS: Record<PixelLayerMotion, string> = {
  "flicker-a": "pixel-flicker-a",
  "flicker-b": "pixel-flicker-b",
  twinkle: "pixel-twinkle",
};

interface PixelSceneProps {
  label: string;
  scene: PixelSceneId;
}

/** A pixel-art scene that fills its (positioned) parent, cropping to fit. */
export function PixelScene({ label, scene }: PixelSceneProps): ReactElement {
  return (
    <svg
      aria-label={label}
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      shapeRendering="crispEdges"
      viewBox={`0 0 ${PIXEL_SCENE_WIDTH} ${PIXEL_SCENE_HEIGHT}`}
    >
      {PIXEL_SCENES[scene].map((layer, layerIndex) => (
        <g
          className={layer.motion ? MOTION_CLASS[layer.motion] : undefined}
          key={layerIndex}
          style={
            layer.delay === undefined
              ? undefined
              : { animationDelay: `${layer.delay}s` }
          }
        >
          {layer.rects.map(([x, y, width, height, color], rectIndex) => (
            <rect
              fill={PIXEL_PALETTE[color]}
              height={height}
              key={rectIndex}
              width={width}
              x={x}
              y={y}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
