import React, { useEffect, useRef, useState } from 'react';
import { CakeSpec, GlazeFlavor } from '../types/game';

interface CakeCanvasProps {
  spec: CakeSpec;
  size?: number; // width/height in px
  colorblindMode?: boolean;
  className?: string;
  animateAddition?: boolean; // Only triggers merge animation AFTER child answers!
}

const GLAZE_COLORS: Record<GlazeFlavor, { primary: string; secondary: string; border: string }> = {
  strawberry: { primary: '#f43f5e', secondary: '#fb7185', border: '#e11d48' },
  cyan_frost: { primary: '#06b6d4', secondary: '#22d3ee', border: '#0891b2' },
  lemon: { primary: '#eab308', secondary: '#facc15', border: '#ca8a04' },
  grape: { primary: '#a855f7', secondary: '#c084fc', border: '#9333ea' },
  chocolate: { primary: '#92400e', secondary: '#b45309', border: '#78350f' },
  caramel: { primary: '#d97706', secondary: '#f59e0b', border: '#b45309' },
};

/**
 * Checks if a CakeSpec is an addition of two cakes whose sum of parts is <= 1 whole cake.
 */
export function isAdditionUnderOne(spec: CakeSpec): boolean {
  if (!spec.multiCakes || spec.multiCakes.length !== 2) return false;
  if (spec.operator === 'vs' || spec.isComparison) return false;
  const c1 = spec.multiCakes[0];
  const c2 = spec.multiCakes[1];
  if (!c1.totalParts || !c2.totalParts) return false;
  const f1 = (c1.activeParts || 0) / c1.totalParts;
  const f2 = (c2.activeParts || 0) / c2.totalParts;
  const sum = f1 + f2;
  return sum > 0 && sum <= 1.0001;
}

/**
 * Checks if a CakeSpec is a comparison of two cakes.
 */
export function isComparisonVisual(spec: CakeSpec): boolean {
  if (spec.isComparison) return true;
  if (
    spec.multiCakes &&
    spec.multiCakes.length === 2 &&
    (spec.operator === 'vs' || spec.operator === 'ou')
  ) {
    return true;
  }
  return false;
}

/**
 * Checks if a CakeSpec represents fraction equivalence (dynamic subdivision into equal parts).
 */
export function isEquivalenceVisual(spec: CakeSpec): boolean {
  return Boolean(spec.isEquivalence || spec.equivalenceInfo);
}

function getCommonDenominator(c1: CakeSpec, c2: CakeSpec, parentSpec?: CakeSpec): number {
  if (parentSpec && parentSpec.totalParts && parentSpec.totalParts > 1) {
    return parentSpec.totalParts;
  }
  const d1 = c1.totalParts || 1;
  const d2 = c2.totalParts || 1;
  if (d1 === d2) return d1;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  return (d1 * d2) / gcd(d1, d2);
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export const CakeCanvas: React.FC<CakeCanvasProps> = ({
  spec,
  size = 180,
  colorblindMode = false,
  className = '',
  animateAddition = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const isAddition = isAdditionUnderOne(spec);
  const isComparison = isComparisonVisual(spec);
  const isEquivalence = isEquivalenceVisual(spec);
  const isMulti = (spec.multiCakes && spec.multiCakes.length > 1) || isComparison;
  const numMulti = spec.multiCakes ? spec.multiCakes.length : 2;
  const isBar = spec.shape === 'bar';

  const cakeGap = Math.max(52, Math.round(size * 0.40));

  // Height sizing for canvas: comparison & equivalence include cakes + badges + 2-line large explanation
  const canvasWidth = isComparison || isEquivalence
    ? Math.max(340, size * 2 + 50)
    : isMulti
    ? size * numMulti + (numMulti - 1) * cakeGap + 20
    : isBar
    ? Math.max(360, size >= 240 ? size : size * 2.5)
    : size;
  const canvasHeight = isComparison || isEquivalence
    ? (isBar ? 190 : size + 115)
    : isAddition
    ? size + 50
    : isBar
    ? Math.round(Math.min(94, Math.max(68, canvasWidth * 0.12)))
    : size;

  const c1 = isAddition ? spec.multiCakes![0] : null;
  const c2 = isAddition ? spec.multiCakes![1] : null;
  const commonDen = c1 && c2 ? getCommonDenominator(c1, c2, spec) : spec.totalParts || 1;
  const k1 = c1 ? Math.round(((c1.activeParts || 0) / (c1.totalParts || 1)) * commonDen) : 0;
  const k2 = c2 ? Math.round(((c2.activeParts || 0) / (c2.totalParts || 1)) * commonDen) : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    // 1. COMPARISON CASE (TRANSFORM TO SAME DENOMINATOR WITH EXPLANATION)
    if (isComparison) {
      if (!animateAddition) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        renderAnimatedComparisonCakes(
          ctx,
          spec,
          canvasWidth,
          canvasHeight,
          size,
          0,
          colorblindMode
        );
        return;
      }

      let startTime: number | null = null;
      const COMPARISON_DURATION = 2400;

      const animate = (time: number) => {
        if (startTime === null) startTime = time;
        const elapsed = time - startTime;
        const norm = Math.min(1, elapsed / COMPARISON_DURATION);

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        renderAnimatedComparisonCakes(
          ctx,
          spec,
          canvasWidth,
          canvasHeight,
          size,
          norm,
          colorblindMode
        );

        animFrameRef.current = requestAnimationFrame(animate);
      };

      animFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
        }
      };
    }

    // 1b. EQUIVALENCE CASE (DYNAMIC SUBDIVISION TO EQUIVALENT DENOMINATOR WITH EXPLANATION)
    if (isEquivalence) {
      if (!animateAddition) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        renderAnimatedEquivalenceCakes(
          ctx,
          spec,
          canvasWidth,
          canvasHeight,
          size,
          0,
          colorblindMode
        );
        return;
      }

      let startTime: number | null = null;
      const EQUIVALENCE_DURATION = 2500;

      const animate = (time: number) => {
        if (startTime === null) startTime = time;
        const elapsed = time - startTime;
        const norm = Math.min(1, elapsed / EQUIVALENCE_DURATION);

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        renderAnimatedEquivalenceCakes(
          ctx,
          spec,
          canvasWidth,
          canvasHeight,
          size,
          norm,
          colorblindMode
        );

        animFrameRef.current = requestAnimationFrame(animate);
      };

      animFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
        }
      };
    }

    // 2. STANDARD STATIC CAKE OR REGULAR MULTI-CAKE
    if (!isAddition) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      if (isMulti && spec.multiCakes) {
        const subSize = size;
        const cakeGap = Math.max(52, Math.round(subSize * 0.40));
        const spacing = subSize + cakeGap;
        const startX = 10 + subSize / 2;
        spec.multiCakes.forEach((subSpec, idx) => {
          const cx = startX + idx * spacing;
          const cy = canvasHeight / 2;
          const glaze = subSpec.glaze || spec.glaze || 'strawberry';
          const colors = GLAZE_COLORS[glaze];
          const radius = Math.floor(subSize / 2) - 4;
          renderSingleRoundCake(ctx, subSpec, cx, cy, radius, colors, colorblindMode);

          // Operator "+" between cakes with generous breathing room
          if (idx < spec.multiCakes!.length - 1) {
            const plusX = cx + subSize / 2 + cakeGap / 2;
            ctx.save();
            ctx.fillStyle = '#facc15';
            ctx.font = `bold ${Math.max(26, Math.floor(subSize * 0.30))}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
            ctx.shadowBlur = 8;
            ctx.fillText(spec.operator || '+', plusX, cy);
            ctx.restore();
          }
        });
      } else {
        const glaze = spec.glaze || 'strawberry';
        const colors = GLAZE_COLORS[glaze];
        if (spec.shape === 'round') {
          const radius = Math.floor(Math.min(canvasWidth, canvasHeight) / 2) - 4;
          renderSingleRoundCake(
            ctx,
            spec,
            canvasWidth / 2,
            canvasHeight / 2,
            radius,
            colors,
            colorblindMode
          );
        } else {
          renderBarCake(ctx, spec, canvasWidth, canvasHeight, colors, colorblindMode);
        }
      }
      return;
    }

    // 3. ADDITION CASE:
    // 1. BEFORE THE CHILD ANSWERS (animateAddition === false):
    // Purely static two cakes side by side with '+' in between. No merge animation!
    if (!animateAddition) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      renderAnimatedAdditionCakes(
        ctx,
        spec,
        c1!,
        c2!,
        canvasWidth,
        canvasHeight,
        size,
        0, // Progress 0: purely separate cakes with "+" sign
        colorblindMode,
        commonDen,
        k1,
        k2
      );
      return;
    }

    // 2. AFTER THE CHILD GIVES THEIR ANSWER (animateAddition === true):
    // Smoothly animate the two cakes merging into 1 single cake!
    let startTime: number | null = null;
    const MERGE_DURATION = 1800; // 1.8 seconds to smoothly assemble into 1 single cake

    const animate = (time: number) => {
      if (startTime === null) startTime = time;
      const elapsed = time - startTime;

      // Smoothly progress from separate (0) to unified single cake (0.65), then hold!
      const norm = Math.min(1, elapsed / MERGE_DURATION);
      const progress = norm * 0.65;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      renderAnimatedAdditionCakes(
        ctx,
        spec,
        c1!,
        c2!,
        canvasWidth,
        canvasHeight,
        size,
        progress,
        colorblindMode,
        commonDen,
        k1,
        k2
      );

      // Keep animation frame running to animate glowing pulse on the unified cake
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    spec,
    size,
    colorblindMode,
    isMulti,
    canvasWidth,
    canvasHeight,
    isAddition,
    isComparison,
    isEquivalence,
    isBar,
    animateAddition,
    c1,
    c2,
    commonDen,
    k1,
    k2,
  ]);

  return (
    <div
      className={`inline-flex flex-col items-center justify-center select-none bg-transparent ${
        isBar ? 'w-full max-w-full' : ''
      } ${className}`}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          maxWidth: '100%',
          aspectRatio: `${canvasWidth} / ${canvasHeight}`,
        }}
        className="block bg-transparent"
      />

      {spec.label && !isAddition && !isComparison && !isEquivalence && (
        <span className="mt-1 text-sm font-black text-white tracking-wide font-display drop-shadow">
          {spec.label}
        </span>
      )}
    </div>
  );
};

/**
 * High-performance 60 FPS animation that smoothly merges two addition cakes
 * into a single unified cake showing all parts together.
 */
function renderAnimatedAdditionCakes(
  ctx: CanvasRenderingContext2D,
  parentSpec: CakeSpec,
  c1: CakeSpec,
  c2: CakeSpec,
  width: number,
  height: number,
  subSize: number,
  progress: number, // 0.0 to 1.0
  colorblindMode: boolean,
  commonDen: number,
  k1: number,
  k2: number
) {
  const colors1 = GLAZE_COLORS[c1.glaze || 'strawberry'];
  const colors2 = GLAZE_COLORS[c2.glaze || 'cyan_frost'];

  const radius = Math.floor(subSize / 2) - 8;
  const cy = Math.floor(subSize / 2) + 2;
  const cxCenter = Math.floor(width / 2);
  const cx1 = 10 + Math.floor(subSize / 2);
  const cx2 = width - 10 - Math.floor(subSize / 2);

  // Timeline Phases:
  // 0.00 -> 0.22: Separate (2 cakes side by side)
  // 0.22 -> 0.46: Merging (Cakes slide to center, Cake 2 slices slot in right after Cake 1)
  // 0.46 -> 0.85: Unified Single Cake (1 single cake showing both sets of slices combined!)
  // 0.85 -> 1.00: Resetting back to separate

  let e = 0; // 0 = fully separate, 1 = fully unified on 1 single cake
  let phase: 'split' | 'merging' | 'merged' | 'resetting' = 'split';

  if (progress < 0.22) {
    phase = 'split';
    e = 0;
  } else if (progress < 0.46) {
    phase = 'merging';
    e = easeInOutCubic((progress - 0.22) / 0.24);
  } else if (progress < 0.85) {
    phase = 'merged';
    e = 1;
  } else {
    phase = 'resetting';
    e = 1 - easeInOutCubic((progress - 0.85) / 0.15);
  }

  const curCx1 = cx1 + (cxCenter - cx1) * e;
  const curCx2 = cx2 + (cxCenter - cx2) * e;

  // 1. Draw '+' between cakes if visible
  const plusAlpha = Math.max(0, 1 - e * 2.2);
  if (plusAlpha > 0.02) {
    ctx.save();
    ctx.globalAlpha = plusAlpha;
    ctx.fillStyle = '#facc15';
    ctx.font = `bold ${Math.max(26, Math.floor(subSize * 0.32))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 6;
    ctx.fillText('+', cxCenter, cy);
    ctx.restore();
  }

  // 2. Draw Base Pastry Dough
  // Cake 1 dough (persists and becomes the unified single cake!)
  ctx.save();
  ctx.beginPath();
  ctx.arc(curCx1, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#fed7aa';
  ctx.fill();
  ctx.restore();

  // Cake 2 dough (fades out as it merges so only its glazed slices enter the unified cake)
  const sponge2Alpha = Math.max(0, 1 - e * 1.5);
  if (sponge2Alpha > 0.02) {
    ctx.save();
    ctx.globalAlpha = sponge2Alpha;
    ctx.beginPath();
    ctx.arc(curCx2, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fed7aa';
    ctx.fill();
    ctx.restore();
  }

  // 3. Slice calculations
  const sliceAngle = (Math.PI * 2) / commonDen;

  // When e = 1 (unified single cake):
  if (e >= 0.99) {
    // UNIFIED SINGLE CAKE DRAWING
    // Draw all commonDen slices
    for (let i = 0; i < commonDen; i++) {
      const start = -Math.PI / 2 + i * sliceAngle;
      const end = -Math.PI / 2 + (i + 1) * sliceAngle;
      const isFromCake1 = i < k1;
      const isFromCake2 = i >= k1 && i < k1 + k2;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cxCenter, cy);
      ctx.arc(cxCenter, cy, radius, start, end);
      ctx.closePath();

      if (isFromCake1) {
        ctx.fillStyle = i % 2 === 0 ? colors1.primary : colors1.secondary;
        ctx.fill();
        if (colorblindMode) drawHatchingPattern(ctx, cxCenter, cy, radius, start, end, 0);
      } else if (isFromCake2) {
        ctx.fillStyle = i % 2 === 0 ? colors2.primary : colors2.secondary;
        ctx.fill();
        if (colorblindMode) drawHatchingPattern(ctx, cxCenter, cy, radius, start, end, 1);
      } else {
        // Unglazed empty portion
        ctx.fillStyle = i % 2 === 0 ? '#ffedd5' : '#fed7aa';
        ctx.fill();
      }
      ctx.restore();

      // Number badge on each active slice (1, 2, 3...) so the child can count!
      if (isFromCake1 || isFromCake2) {
        const midA = (start + end) / 2;
        const bDist = radius * 0.65;
        const bx = cxCenter + Math.cos(midA) * bDist;
        const by = cy + Math.sin(midA) * bDist;
        const bRad = Math.max(8, radius * 0.12);

        ctx.save();
        ctx.beginPath();
        ctx.arc(bx, by, bRad, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = isFromCake1 ? colors1.border : colors2.border;
        ctx.font = `bold ${Math.max(11, Math.floor(bRad * 1.3))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i + 1}`, bx, by);
        ctx.restore();
      }
    }

    // Dividers on unified single cake
    drawSliceDividers(ctx, cxCenter, cy, radius, commonDen);

    // Center candy button
    drawCenterButton(ctx, cxCenter, cy, radius);

    // Subtle golden glow pulse around the assembled single cake
    const pulse = Math.sin(progress * 15) * 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cxCenter, cy, radius + 2 + pulse, 0, Math.PI * 2);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.restore();
  } else {
    // SEPARATE OR MERGING TRANSITION
    // 1. Draw Cake 1 active slices
    const c1Den = c1.totalParts || commonDen;
    const c1SliceAngle = (Math.PI * 2) / c1Den;
    // Interpolate slice angle towards commonDen slice angle during merge
    const activeC1Angle = c1SliceAngle * (1 - e) + sliceAngle * e;

    for (let i = 0; i < c1Den; i++) {
      const start = -Math.PI / 2 + i * activeC1Angle;
      const end = -Math.PI / 2 + (i + 1) * activeC1Angle;
      const isActive = i < (c1.activeParts || 0);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(curCx1, cy);
      ctx.arc(curCx1, cy, radius, start, end);
      ctx.closePath();

      if (isActive) {
        ctx.fillStyle = i % 2 === 0 ? colors1.primary : colors1.secondary;
        ctx.fill();
        if (colorblindMode) drawHatchingPattern(ctx, curCx1, cy, radius, start, end, 0);

        // Candy pearl
        const midA = (start + end) / 2;
        const tx = curCx1 + Math.cos(midA) * (radius * 0.68);
        const ty = cy + Math.sin(midA) * (radius * 0.68);
        ctx.beginPath();
        ctx.arc(tx, ty, Math.max(3, radius * 0.07), 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      } else {
        ctx.fillStyle = i % 2 === 0 ? '#ffedd5' : '#fed7aa';
        ctx.fill();
      }
      ctx.restore();
    }
    drawSliceDividers(ctx, curCx1, cy, radius, c1Den);
    drawCenterButton(ctx, curCx1, cy, radius);

    // 2. Draw Cake 2 active slices (smoothly gliding & slotting in right after Cake 1!)
    const c2Den = c2.totalParts || commonDen;
    const c2SliceAngle = (Math.PI * 2) / c2Den;
    const activeC2Angle = c2SliceAngle * (1 - e) + sliceAngle * e;

    // In separate state: starts at -PI/2
    // In merged state: starts at -PI/2 + k1 * sliceAngle
    const targetOffsetAngle = k1 * sliceAngle;
    const startOffsetAngle = targetOffsetAngle * e;

    for (let j = 0; j < c2Den; j++) {
      const isActive = j < (c2.activeParts || 0);
      const start = -Math.PI / 2 + startOffsetAngle + j * activeC2Angle;
      const end = -Math.PI / 2 + startOffsetAngle + (j + 1) * activeC2Angle;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(curCx2, cy);
      ctx.arc(curCx2, cy, radius, start, end);
      ctx.closePath();

      if (isActive) {
        ctx.fillStyle = j % 2 === 0 ? colors2.primary : colors2.secondary;
        ctx.fill();
        if (colorblindMode) drawHatchingPattern(ctx, curCx2, cy, radius, start, end, 1);

        // Candy pearl
        const midA = (start + end) / 2;
        const tx = curCx2 + Math.cos(midA) * (radius * 0.68);
        const ty = cy + Math.sin(midA) * (radius * 0.68);
        ctx.beginPath();
        ctx.arc(tx, ty, Math.max(3, radius * 0.07), 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      } else if (sponge2Alpha > 0.05) {
        ctx.globalAlpha = sponge2Alpha;
        ctx.fillStyle = j % 2 === 0 ? '#ffedd5' : '#fed7aa';
        ctx.fill();
      }
      ctx.restore();
    }

    if (sponge2Alpha > 0.05) {
      drawSliceDividers(ctx, curCx2, cy, radius, c2Den, sponge2Alpha);
      drawCenterButton(ctx, curCx2, cy, radius, sponge2Alpha);
    }

    // Sparkles during transition
    if (phase === 'merging') {
      const sparkleAlpha = Math.sin(((progress - 0.22) / 0.24) * Math.PI);
      drawSparkles(ctx, cxCenter, cy, radius, sparkleAlpha);
    }
  }

  // 4. BOTTOM PILL BADGES & FORMULA INDICATOR
  const badgeY = height - 18;

  if (e >= 0.85) {
    // UNIFIED TOTAL FORMULA BADGE (Glowing Emerald - Enlarged)
    const formulaText = `${c1.activeParts}/${c1.totalParts} + ${c2.activeParts}/${c2.totalParts} = ${k1 + k2}/${commonDen}`;
    drawPillBadge(
      ctx,
      cxCenter,
      badgeY,
      formulaText,
      'rgba(16, 185, 129, 0.96)',
      '#34d399',
      '#ffffff',
      Math.max(15, Math.floor(subSize * 0.12))
    );
  } else if (e <= 0.15) {
    // SEPARATE FRACTIONS UNDER EACH CAKE
    drawPillBadge(
      ctx,
      cx1,
      badgeY,
      `${c1.activeParts}/${c1.totalParts}`,
      'rgba(244, 63, 94, 0.92)',
      '#fb7185',
      '#ffffff',
      Math.max(14, Math.floor(subSize * 0.11))
    );

    drawPillBadge(
      ctx,
      cx2,
      badgeY,
      `${c2.activeParts}/${c2.totalParts}`,
      'rgba(6, 182, 212, 0.92)',
      '#22d3ee',
      '#ffffff',
      Math.max(14, Math.floor(subSize * 0.11))
    );
  } else {
    // MERGING HINT
    drawPillBadge(
      ctx,
      cxCenter,
      badgeY,
      `⚡ Assemblage : ${c1.activeParts}/${c1.totalParts} + ${c2.activeParts}/${c2.totalParts}...`,
      'rgba(245, 158, 11, 0.92)',
      '#fcd34d',
      '#0f172a',
      Math.max(13, Math.floor(subSize * 0.10))
    );
  }
}

/**
 * 60 FPS animation for comparing two fractions with dynamic subdivision to a common denominator
 * and clear explanation of the mathematical operation.
 */
function renderAnimatedComparisonCakes(
  ctx: CanvasRenderingContext2D,
  parentSpec: CakeSpec,
  width: number,
  height: number,
  subSize: number,
  progress: number, // 0.0 to 1.0
  colorblindMode: boolean
) {
  const cakes = parentSpec.multiCakes || [];
  const c1Spec = cakes[0] || { shape: 'round', totalParts: 4, activeParts: 3, glaze: 'strawberry' };
  const c2Spec = cakes[1] || { shape: 'round', totalParts: 8, activeParts: 5, glaze: 'cyan_frost' };

  const info = parentSpec.comparisonInfo || {
    n1: c1Spec.activeParts || 3,
    d1: c1Spec.totalParts || 4,
    n2: c2Spec.activeParts || 5,
    d2: c2Spec.totalParts || 8,
    m1: 2,
    m2: 1,
    k1: 6,
    k2: 5,
    commonDen: 8,
    largerIndex: 0,
    operationText: `On multiplie par 2 : 3/4 = (3×2)/(4×2) = 6/8`,
    resultText: `6/8 > 5/8  →  3/4 est plus grande !`,
  };

  const colors1 = GLAZE_COLORS[c1Spec.glaze || 'strawberry'];
  const colors2 = GLAZE_COLORS[c2Spec.glaze || 'cyan_frost'];

  const radius = Math.floor(subSize / 2) - 8;
  const cy = Math.floor(subSize / 2) + 6;
  const cx1 = Math.floor(subSize / 2) + 12;
  const cx2 = width - Math.floor(subSize / 2) - 12;
  const cxCenter = Math.floor(width / 2);

  // Subdivision laser knife progress (0.05 to 0.45)
  const cutProgress1 = info.m1 > 1 ? Math.min(1, Math.max(0, (progress - 0.05) / 0.40)) : 1;
  const cutProgress2 = info.m2 > 1 ? Math.min(1, Math.max(0, (progress - 0.05) / 0.40)) : 1;

  // 1. VICTORY HALO AROUND WINNING CAKE (progress >= 0.60)
  if (progress >= 0.60) {
    const victoryAlpha = Math.min(1, (progress - 0.60) / 0.25);
    const winX = info.largerIndex === 0 ? cx1 : info.largerIndex === 1 ? cx2 : null;
    if (winX !== null) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(winX, cy, radius + 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 12 * victoryAlpha;
      ctx.globalAlpha = victoryAlpha * 0.95;
      ctx.stroke();
      ctx.restore();

      drawSparkles(ctx, winX, cy, radius, victoryAlpha);
    }
  }

  // 2. RENDER CAKE 1
  renderSubdividingCake(
    ctx,
    cx1,
    cy,
    radius,
    info.d1,
    info.n1,
    info.commonDen,
    info.k1,
    info.m1,
    cutProgress1,
    colors1,
    colorblindMode
  );

  // 3. RENDER CAKE 2
  renderSubdividingCake(
    ctx,
    cx2,
    cy,
    radius,
    info.d2,
    info.n2,
    info.commonDen,
    info.k2,
    info.m2,
    cutProgress2,
    colors2,
    colorblindMode
  );

  // 3b. SYNCHRONIZATION HARMONIZATION (when cakes reach the same denominator)
  if (progress >= 0.40) {
    const syncAlpha = Math.min(1, (progress - 0.40) / 0.20);
    // Connecting equalizer beam between cakes
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx1 + radius, cy);
    ctx.lineTo(cx2 - radius, cy);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 8 * syncAlpha;
    ctx.globalAlpha = syncAlpha * 0.75;
    ctx.stroke();
    ctx.restore();

    // Equalizer pulsing aura around BOTH cakes indicating identical slice sizes
    [cx1, cx2].forEach((x) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, cy, radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 8 * syncAlpha;
      ctx.globalAlpha = syncAlpha * 0.7;
      ctx.stroke();
      ctx.restore();
    });
  }

  // 4. CENTER OPERATOR BADGE (vs -> > / < / =)
  const isTransformed = progress >= 0.35;
  let opSymbol = 'vs';
  let opBg = 'rgba(234, 179, 8, 0.95)'; // amber
  let opBorder = '#facc15';
  let opColor = '#0f172a';

  if (isTransformed) {
    if (info.largerIndex === 0) opSymbol = '>';
    else if (info.largerIndex === 1) opSymbol = '<';
    else opSymbol = '=';
    opBg = 'rgba(16, 185, 129, 0.95)';
    opBorder = '#34d399';
    opColor = '#ffffff';
  }

  const opScale = isTransformed
    ? Math.min(1.25, 1 + Math.sin(Math.min(Math.PI, (progress - 0.35) * 8)) * 0.25)
    : 1;
  drawCircleBadge(ctx, cxCenter, cy, opSymbol, opBg, opBorder, opColor, 16, opScale);

  // 5. PILL BADGES UNDER EACH CAKE
  const badgeY = subSize + 16;

  // Cake 1 Badge
  const c1Text = isTransformed
    ? info.m1 > 1
      ? `${info.n1}/${info.d1} = ${info.k1}/${info.commonDen}`
      : `${info.k1}/${info.commonDen}`
    : `${info.n1}/${info.d1}`;

  const c1IsWinner = isTransformed && info.largerIndex === 0;
  drawPillBadge(
    ctx,
    cx1,
    badgeY,
    c1IsWinner ? `⭐ ${c1Text}` : c1Text,
    c1IsWinner ? 'rgba(16, 185, 129, 0.95)' : 'rgba(244, 63, 94, 0.9)',
    c1IsWinner ? '#34d399' : '#fb7185',
    '#ffffff',
    Math.max(12, Math.floor(subSize * 0.088))
  );

  // Cake 2 Badge
  const c2Text = isTransformed
    ? info.m2 > 1
      ? `${info.n2}/${info.d2} = ${info.k2}/${info.commonDen}`
      : `${info.k2}/${info.commonDen}`
    : `${info.n2}/${info.d2}`;

  const c2IsWinner = isTransformed && info.largerIndex === 1;
  drawPillBadge(
    ctx,
    cx2,
    badgeY,
    c2IsWinner ? `⭐ ${c2Text}` : c2Text,
    c2IsWinner ? 'rgba(16, 185, 129, 0.95)' : 'rgba(6, 182, 212, 0.9)',
    c2IsWinner ? '#34d399' : '#22d3ee',
    '#ffffff',
    Math.max(12, Math.floor(subSize * 0.088))
  );

  // 6. BOTTOM EXPLANATION CARDS (Operation & Result)
  if (progress >= 0.35) {
    const alpha1 = Math.min(1, (progress - 0.35) / 0.22);
    ctx.save();
    ctx.globalAlpha = alpha1;

    // Operation explanation badge (enlarged font & padding)
    const opBadgeY = subSize + 48;
    drawExplanationBadge(
      ctx,
      cxCenter,
      opBadgeY,
      `⚙️ ${info.operationText}`,
      'rgba(15, 23, 42, 0.96)',
      '#38bdf8',
      '#f0f9ff',
      width - 12,
      Math.max(14, Math.floor(subSize * 0.11))
    );
    ctx.restore();
  }

  if (progress >= 0.55) {
    const alpha2 = Math.min(1, (progress - 0.55) / 0.22);
    ctx.save();
    ctx.globalAlpha = alpha2;

    // Conclusion comparison badge (enlarged font & padding)
    const resBadgeY = subSize + 82;
    drawExplanationBadge(
      ctx,
      cxCenter,
      resBadgeY,
      `🎯 ${info.resultText}`,
      'rgba(6, 78, 59, 0.96)',
      '#34d399',
      '#ecfdf5',
      width - 12,
      Math.max(14, Math.floor(subSize * 0.11))
    );
    ctx.restore();
  }
}

/**
 * 60 FPS animation for fraction equivalence:
 * - Before answer (progress === 0): clean single cake in the center with its fraction badge (e.g. 1/2).
 * - During solution (progress > 0): smoothly duplicates/slides the cake, cuts each slice with an animated
 *   laser knife into the new denominator (e.g. 2/4), illuminates the equal sign and equalizer beam,
 *   and displays the full mathematical operation and conclusion badges!
 */
function renderAnimatedEquivalenceCakes(
  ctx: CanvasRenderingContext2D,
  spec: CakeSpec,
  width: number,
  height: number,
  subSize: number,
  progress: number, // 0.0 to 1.0
  colorblindMode: boolean
) {
  if (spec.shape === 'bar') {
    renderAnimatedEquivalenceBar(ctx, spec, width, height, subSize, progress, colorblindMode);
    return;
  }

  const info = spec.equivalenceInfo || {
    baseNum: spec.activeParts || 1,
    baseDen: spec.totalParts || 2,
    eqNum: (spec.activeParts || 1) * 2,
    eqDen: (spec.totalParts || 2) * 2,
    multiplier: 2,
    operationText: `On coupe chaque part en 2 : ${spec.activeParts || 1}/${spec.totalParts || 2} = (${spec.activeParts || 1}×2)/(${spec.totalParts || 2}×2) = ${(spec.activeParts || 1) * 2}/${(spec.totalParts || 2) * 2}`,
    resultText: `Même portion de gâteau : ${spec.activeParts || 1}/${spec.totalParts || 2} = ${(spec.activeParts || 1) * 2}/${(spec.totalParts || 2) * 2} !`,
  };

  const colors = GLAZE_COLORS[spec.glaze || 'strawberry'];
  const radius = Math.floor(subSize / 2) - 8;
  const cy = Math.floor(subSize / 2) + 6;
  const cxCenter = Math.floor(width / 2);
  const cx1Target = Math.floor(subSize / 2) + 12;
  const cx2Target = width - Math.floor(subSize / 2) - 12;

  // 1. BEFORE ANSWER (progress <= 0): clean single cake in the center
  if (progress <= 0) {
    renderSubdividingCake(
      ctx,
      cxCenter,
      cy,
      radius,
      info.baseDen,
      info.baseNum,
      info.baseDen,
      info.baseNum,
      1,
      0,
      colors,
      colorblindMode
    );
    drawPillBadge(
      ctx,
      cxCenter,
      subSize + 16,
      `${info.baseNum}/${info.baseDen}`,
      'rgba(234, 179, 8, 0.95)',
      '#facc15',
      '#0f172a',
      Math.max(14, Math.floor(subSize * 0.1))
    );
    return;
  }

  // 2. SOLUTION TIMELINE:
  // Step A: Smooth Slide & Clone (0.0 -> 0.22)
  const slideT = Math.min(1, progress / 0.22);
  const slideEase = easeInOutCubic(slideT);
  const cx1 = cxCenter + (cx1Target - cxCenter) * slideEase;
  const cx2 = cxCenter + (cx2Target - cxCenter) * slideEase;
  const alphaClone = slideEase;

  // Step B: Laser cutter subdivides Cake 2 (0.22 -> 0.58)
  const cutProgress =
    info.multiplier > 1 ? Math.min(1, Math.max(0, (progress - 0.22) / 0.36)) : 1;

  // Step C: Victory & Equivalence Halo around both cakes (progress >= 0.60)
  if (progress >= 0.60) {
    const haloAlpha = Math.min(1, (progress - 0.60) / 0.25);
    [cx1, cx2].forEach((x) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, cy, radius + 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 12 * haloAlpha;
      ctx.globalAlpha = haloAlpha * 0.95;
      ctx.stroke();
      ctx.restore();

      drawSparkles(ctx, x, cy, radius, haloAlpha);
    });
  }

  // Step D: Render Cake 1 (Untouched original reference)
  renderSubdividingCake(
    ctx,
    cx1,
    cy,
    radius,
    info.baseDen,
    info.baseNum,
    info.baseDen,
    info.baseNum,
    1,
    0,
    colors,
    colorblindMode
  );

  // Step E: Render Cake 2 (Transforming to equivalent fraction)
  ctx.save();
  ctx.globalAlpha = alphaClone;
  renderSubdividingCake(
    ctx,
    cx2,
    cy,
    radius,
    info.baseDen,
    info.baseNum,
    info.eqDen,
    info.eqNum,
    info.multiplier,
    cutProgress,
    colors,
    colorblindMode
  );
  ctx.restore();

  // Step F: Connecting Equalizer Beam between the two cakes (progress >= 0.40)
  if (progress >= 0.40) {
    const syncAlpha = Math.min(1, (progress - 0.40) / 0.20);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx1 + radius, cy);
    ctx.lineTo(cx2 - radius, cy);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 8 * syncAlpha;
    ctx.globalAlpha = syncAlpha * 0.75;
    ctx.stroke();
    ctx.restore();

    // Equalizer pulsing aura
    [cx1, cx2].forEach((x) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, cy, radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 8 * syncAlpha;
      ctx.globalAlpha = syncAlpha * 0.7;
      ctx.stroke();
      ctx.restore();
    });
  }

  // Step G: Center Equal Badge ("=")
  const isTransformed = progress >= 0.35;
  const opSymbol = '=';
  const opBg = isTransformed ? 'rgba(16, 185, 129, 0.95)' : 'rgba(234, 179, 8, 0.95)';
  const opBorder = isTransformed ? '#34d399' : '#facc15';
  const opColor = isTransformed ? '#ffffff' : '#0f172a';
  const opScale = isTransformed
    ? Math.min(1.25, 1 + Math.sin(Math.min(Math.PI, (progress - 0.35) * 8)) * 0.25)
    : Math.max(0.7, slideEase);

  ctx.save();
  ctx.globalAlpha = alphaClone;
  drawCircleBadge(ctx, cxCenter, cy, opSymbol, opBg, opBorder, opColor, 16, opScale);
  ctx.restore();

  // Step H: Badges under each cake
  const badgeY = subSize + 16;
  const badgeSize = Math.max(12, Math.floor(subSize * 0.088));

  // Cake 1 Badge
  drawPillBadge(
    ctx,
    cx1,
    badgeY,
    `${info.baseNum}/${info.baseDen}`,
    'rgba(244, 63, 94, 0.9)',
    '#fb7185',
    '#ffffff',
    badgeSize
  );

  // Cake 2 Badge
  if (alphaClone > 0) {
    ctx.save();
    ctx.globalAlpha = alphaClone;
    const c2Text = isTransformed
      ? `⭐ ${info.eqNum}/${info.eqDen}`
      : `${info.baseNum}/${info.baseDen}`;
    drawPillBadge(
      ctx,
      cx2,
      badgeY,
      c2Text,
      isTransformed ? 'rgba(16, 185, 129, 0.95)' : 'rgba(6, 182, 212, 0.9)',
      isTransformed ? '#34d399' : '#22d3ee',
      '#ffffff',
      badgeSize
    );
    ctx.restore();
  }

  // Step I: Bottom Explanation Cards (Enlarged)
  if (progress >= 0.35) {
    const alpha1 = Math.min(1, (progress - 0.35) / 0.20);
    ctx.save();
    ctx.globalAlpha = alpha1;
    drawExplanationBadge(
      ctx,
      cxCenter,
      subSize + 48,
      `⚙️ ${info.operationText}`,
      'rgba(15, 23, 42, 0.96)',
      '#38bdf8',
      '#f0f9ff',
      width - 12,
      Math.max(14, Math.floor(subSize * 0.11))
    );
    ctx.restore();
  }

  if (progress >= 0.55) {
    const alpha2 = Math.min(1, (progress - 0.55) / 0.20);
    ctx.save();
    ctx.globalAlpha = alpha2;
    drawExplanationBadge(
      ctx,
      cxCenter,
      subSize + 82,
      `🎯 ${info.resultText}`,
      'rgba(6, 78, 59, 0.96)',
      '#34d399',
      '#ecfdf5',
      width - 12,
      Math.max(14, Math.floor(subSize * 0.11))
    );
    ctx.restore();
  }
}

function renderAnimatedEquivalenceBar(
  ctx: CanvasRenderingContext2D,
  spec: CakeSpec,
  width: number,
  height: number,
  _subSize: number,
  progress: number,
  colorblindMode: boolean
) {
  const info = spec.equivalenceInfo || {
    baseNum: spec.activeParts || 1,
    baseDen: spec.totalParts || 2,
    eqNum: (spec.activeParts || 1) * 2,
    eqDen: (spec.totalParts || 2) * 2,
    multiplier: 2,
    operationText: `On coupe chaque part en 2 : ${spec.activeParts || 1}/${spec.totalParts || 2} = (${spec.activeParts || 1}×2)/(${spec.totalParts || 2}×2) = ${(spec.activeParts || 1) * 2}/${(spec.totalParts || 2) * 2}`,
    resultText: `Même portion : ${spec.activeParts || 1}/${spec.totalParts || 2} = ${(spec.activeParts || 1) * 2}/${(spec.totalParts || 2) * 2} !`,
  };

  const colors = GLAZE_COLORS[spec.glaze || 'strawberry'];
  const cxCenter = Math.floor(width / 2);

  const padX = Math.max(8, Math.floor(width * 0.04));
  const padY = Math.max(6, Math.floor(height * 0.06));
  const barW = width - padX * 2;
  const barH = Math.min(height - padY * 2 - 58, 64);
  const barX = padX;
  const barY = padY + 4;

  const isTransformed = progress >= 0.45;
  const currentTotal = isTransformed ? info.eqDen : info.baseDen;
  const currentActive = isTransformed ? info.eqNum : info.baseNum;

  // Render the bar cake
  const tempSpec: CakeSpec = {
    ...spec,
    totalParts: currentTotal,
    activeParts: currentActive,
  };
  renderBarCake(ctx, tempSpec, width, barH + padY * 2 + 10, colors, colorblindMode);

  // Vertical laser cutting lines during progress 0.12 -> 0.50
  if (progress > 0.12 && progress < 0.65 && info.multiplier > 1) {
    const cutP = Math.min(1, Math.max(0, (progress - 0.12) / 0.38));
    const partW = barW / info.eqDen;
    for (let i = 0; i < info.eqDen; i++) {
      if (i % info.multiplier !== 0) {
        const lx = barX + i * partW;
        const currentLy = barY + barH * cutP;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(lx, barY);
        ctx.lineTo(lx, currentLy);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(lx, currentLy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // Badge below bar
  const badgeY = barY + barH + 16;
  const badgeText = isTransformed
    ? `⭐ ${info.baseNum}/${info.baseDen} = ${info.eqNum}/${info.eqDen}`
    : `${info.baseNum}/${info.baseDen}`;
  drawPillBadge(
    ctx,
    cxCenter,
    badgeY,
    badgeText,
    isTransformed ? 'rgba(16, 185, 129, 0.95)' : 'rgba(234, 179, 8, 0.95)',
    isTransformed ? '#34d399' : '#facc15',
    isTransformed ? '#ffffff' : '#0f172a',
    14
  );

  // Explanation Cards (Enlarged)
  if (progress >= 0.35) {
    const alpha1 = Math.min(1, (progress - 0.35) / 0.20);
    ctx.save();
    ctx.globalAlpha = alpha1;
    drawExplanationBadge(
      ctx,
      cxCenter,
      badgeY + 30,
      `⚙️ ${info.operationText}`,
      'rgba(15, 23, 42, 0.96)',
      '#38bdf8',
      '#f0f9ff',
      width - 12,
      14
    );
    ctx.restore();
  }

  if (progress >= 0.55) {
    const alpha2 = Math.min(1, (progress - 0.55) / 0.20);
    ctx.save();
    ctx.globalAlpha = alpha2;
    drawExplanationBadge(
      ctx,
      cxCenter,
      badgeY + 62,
      `🎯 ${info.resultText}`,
      'rgba(6, 78, 59, 0.96)',
      '#34d399',
      '#ecfdf5',
      width - 12,
      14
    );
    ctx.restore();
  }
}

function renderSubdividingCake(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  initialDen: number,
  initialNum: number,
  commonDen: number,
  targetNum: number,
  multiplier: number,
  cutProgress: number, // 0.0 to 1.0 (if multiplier > 1)
  colors: { primary: string; secondary: string; border: string },
  colorblindMode: boolean
) {
  // Soft pastry foundation
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#fed7aa';
  ctx.fill();
  ctx.restore();

  const isSubdivided = multiplier > 1 && cutProgress >= 0.55;
  const currentTotal = isSubdivided ? commonDen : initialDen;
  const currentActive = isSubdivided ? targetNum : initialNum;

  // Slices drawing
  const sliceAngle = (Math.PI * 2) / currentTotal;
  for (let i = 0; i < currentTotal; i++) {
    const start = -Math.PI / 2 + i * sliceAngle;
    const end = -Math.PI / 2 + (i + 1) * sliceAngle;
    const isActive = i < currentActive;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, start, end);
    ctx.closePath();

    if (isActive) {
      ctx.fillStyle = i % 2 === 0 ? colors.primary : colors.secondary;
      ctx.fill();

      if (colorblindMode) {
        drawHatchingPattern(ctx, centerX, centerY, radius, start, end, i);
      }

      // Candy pearl
      const midAngle = (start + end) / 2;
      const toppingR = radius * 0.68;
      const tx = centerX + Math.cos(midAngle) * toppingR;
      const ty = centerY + Math.sin(midAngle) * toppingR;

      ctx.beginPath();
      ctx.arc(tx, ty, Math.max(2.5, radius * 0.065), 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else {
      ctx.fillStyle = i % 2 === 0 ? '#ffedd5' : '#fed7aa';
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw dividers:
  // 1. Initial base dividers (always full length)
  drawSliceDividers(ctx, centerX, centerY, radius, initialDen);

  // 2. If multiplier > 1, draw the NEW subdivision lines!
  if (multiplier > 1 && cutProgress > 0) {
    const finalAngle = (Math.PI * 2) / commonDen;
    for (let i = 0; i < commonDen; i++) {
      // If this line is NOT one of the initial lines:
      if (i % multiplier !== 0) {
        const angle = -Math.PI / 2 + i * finalAngle;
        const currentR = radius * cutProgress;
        const endX = centerX + Math.cos(angle) * currentR;
        const endY = centerY + Math.sin(angle) * currentR;

        ctx.save();
        if (cutProgress < 1) {
          // Dynamic Laser Knife Cutting Effect
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = Math.max(3, radius * 0.045);
          ctx.shadowColor = '#fde047';
          ctx.shadowBlur = 8;
          ctx.stroke();

          // Sparkle spark at knife tip
          ctx.beginPath();
          ctx.arc(endX, endY, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 6;
          ctx.fill();
        } else {
          // Standard crisp white divider
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = Math.max(3.5, radius * 0.05);
          ctx.lineCap = 'round';
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(2, radius * 0.028);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  drawCenterButton(ctx, centerX, centerY, radius);
}

function drawCircleBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  bgColor: string,
  borderColor: string,
  textColor: string,
  r = 16,
  scale = 1
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = borderColor;
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.font = `bold ${Math.round(r * 1.05)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 4;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function drawExplanationBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  bgColor: string,
  borderColor: string,
  textColor: string,
  maxWidth: number,
  fontSize = 12
) {
  ctx.save();
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const textWidth = ctx.measureText(text).width;
  const padX = 16;
  const padY = 6;
  const w = Math.min(maxWidth, textWidth + padX * 2);
  const actualFontSize = textWidth > (maxWidth - padX * 2)
    ? Math.max(12, Math.floor(fontSize * ((maxWidth - padX * 2) / textWidth)))
    : fontSize;
  ctx.font = `bold ${actualFontSize}px sans-serif`;

  const h = actualFontSize + padY * 2;
  const rx = x - w / 2;
  const ry = y - h / 2;
  const r = 9;

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(rx, ry, w, h, r);
  } else {
    ctx.rect(rx, ry, w, h);
  }
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = borderColor;
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 4;
  ctx.fillText(text, x, y, w - padX);
  ctx.restore();
}

function drawSliceDividers(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  totalParts: number,
  alpha = 1
) {
  const sliceAngle = (Math.PI * 2) / totalParts;
  for (let i = 0; i < totalParts; i++) {
    const angle = -Math.PI / 2 + i * sliceAngle;
    const endX = cx + Math.cos(angle) * radius;
    const endY = cy + Math.sin(angle) * radius;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Dark groove
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = Math.max(3.5, radius * 0.05);
    ctx.lineCap = 'round';
    ctx.stroke();

    // Crisp white divider
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(2, radius * 0.028);
    ctx.stroke();

    ctx.restore();
  }
}

function drawCenterButton(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  alpha = 1
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(5, radius * 0.1), 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#0f172a';
  ctx.stroke();
  ctx.restore();
}

function drawSparkles(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  alpha: number
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const offsets = [
    { dx: 0, dy: -radius * 0.7 },
    { dx: -radius * 0.45, dy: -radius * 0.2 },
    { dx: radius * 0.45, dy: -radius * 0.2 },
    { dx: -radius * 0.35, dy: radius * 0.4 },
    { dx: radius * 0.35, dy: radius * 0.4 },
    { dx: 0, dy: radius * 0.75 },
  ];

  offsets.forEach((pt, i) => {
    const starSize = (i % 2 === 0 ? 6 : 4) * alpha;
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(cx + pt.dx, cy + pt.dy, starSize, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawPillBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  bgColor: string,
  borderColor: string,
  textColor: string,
  fontSize = 13
) {
  ctx.save();
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const textWidth = ctx.measureText(text).width;
  const padX = 12;
  const padY = 5;
  const w = textWidth + padX * 2;
  const h = fontSize + padY * 2;
  const rx = x - w / 2;
  const ry = y - h / 2;
  const r = h / 2;

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(rx, ry, w, h, r);
  } else {
    ctx.rect(rx, ry, w, h);
  }
  ctx.fillStyle = bgColor;
  ctx.fill();

  ctx.fillStyle = textColor;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 4;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function renderSingleRoundCake(
  ctx: CanvasRenderingContext2D,
  spec: CakeSpec,
  centerX: number,
  centerY: number,
  radius: number,
  colors: { primary: string; secondary: string; border: string },
  colorblindMode: boolean
) {
  // Soft pastry dough foundation
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#fed7aa';
  ctx.fill();
  ctx.restore();

  const total = Math.max(1, spec.totalParts || 1);
  const angles: { start: number; end: number }[] = [];

  if (spec.isEqual === false && spec.cutAngles && spec.cutAngles.length > 0) {
    const custom = spec.cutAngles.map((deg) => (deg * Math.PI) / 180);
    for (let i = 0; i < custom.length; i++) {
      const start = custom[i];
      const end = i === custom.length - 1 ? custom[0] + Math.PI * 2 : custom[i + 1];
      angles.push({ start, end });
    }
  } else {
    const sliceAngle = (Math.PI * 2) / total;
    for (let i = 0; i < total; i++) {
      angles.push({
        start: -Math.PI / 2 + i * sliceAngle,
        end: -Math.PI / 2 + (i + 1) * sliceAngle,
      });
    }
  }

  const activeCount = Math.min(spec.activeParts, total);

  // Draw slices
  for (let i = 0; i < angles.length; i++) {
    const { start, end } = angles[i];
    const isActive = i < activeCount;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, start, end);
    ctx.closePath();

    if (isActive) {
      ctx.fillStyle = i % 2 === 0 ? colors.primary : colors.secondary;
      ctx.fill();

      if (colorblindMode) {
        drawHatchingPattern(ctx, centerX, centerY, radius, start, end, i);
      }

      // Candy pearl
      const midAngle = (start + end) / 2;
      const toppingR = radius * 0.68;
      const tx = centerX + Math.cos(midAngle) * toppingR;
      const ty = centerY + Math.sin(midAngle) * toppingR;

      ctx.beginPath();
      ctx.arc(tx, ty, Math.max(3, radius * 0.07), 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else {
      ctx.fillStyle = i % 2 === 0 ? '#ffedd5' : '#fed7aa';
      ctx.fill();
    }
    ctx.restore();
  }

  drawSliceDividers(ctx, centerX, centerY, radius, total);
  drawCenterButton(ctx, centerX, centerY, radius);
}

function renderBarCake(
  ctx: CanvasRenderingContext2D,
  spec: CakeSpec,
  width: number,
  height: number,
  colors: { primary: string; secondary: string; border: string },
  colorblindMode: boolean
) {
  const padX = Math.max(8, Math.floor(width * 0.015));
  const padY = Math.max(8, Math.floor(height * 0.1));
  const barW = width - padX * 2;
  const barH = height - padY * 2;
  const total = Math.max(1, spec.totalParts || 1);
  const partW = barW / total;
  const radius = Math.min(12, Math.floor(barH * 0.22));

  ctx.save();

  // 1. Subtle warm drop-shadow underneath the strip
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(padX, padY, barW, barH, radius);
  } else {
    ctx.rect(padX, padY, barW, barH);
  }
  ctx.fill();
  ctx.restore();

  // 2. Clip to rounded rectangle for clean, appetizing pastry edges
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(padX, padY, barW, barH, radius);
  } else {
    ctx.rect(padX, padY, barW, barH);
  }
  ctx.clip();

  // 3. Biscuit sponge background base
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(padX, padY, barW, barH);

  const activeCount = Math.min(spec.activeParts, total);

  // 4. Fill each part (active: glazed with gloss reflection; inactive: golden sponge)
  for (let i = 0; i < total; i++) {
    const x = padX + i * partW;
    const isActive = i < activeCount;

    if (isActive) {
      // Alternating glaze tones for distinct parts
      ctx.fillStyle = i % 2 === 0 ? colors.primary : colors.secondary;
      ctx.fillRect(x, padY, partW, barH);

      // Glossy icing highlight on top half of glazed parts
      const glossGrad = ctx.createLinearGradient(x, padY, x, padY + barH * 0.45);
      glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
      glossGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.12)');
      glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glossGrad;
      ctx.fillRect(x, padY, partW, barH * 0.45);

      // Colorblind stripes if enabled
      if (colorblindMode) {
        ctx.fillStyle = '#ffffff';
        for (let sx = x; sx < x + partW; sx += 8) {
          ctx.beginPath();
          ctx.moveTo(sx, padY);
          ctx.lineTo(Math.min(sx + 5, x + partW), padY + barH);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }
    } else {
      // Inactive parts: soft golden biscuit sponge dough
      ctx.fillStyle = i % 2 === 0 ? '#ffedd5' : '#fed7aa';
      ctx.fillRect(x, padY, partW, barH);

      // Subtle bottom crust texture
      ctx.fillStyle = 'rgba(217, 119, 6, 0.08)';
      ctx.fillRect(x, padY + barH - 6, partW, 6);
    }
  }

  // 5. Vertical dividers between parts (internal separators)
  for (let i = 1; i < total; i++) {
    const x = padX + i * partW;

    // Dark slice divider
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(x, padY);
    ctx.lineTo(x, padY + barH);
    ctx.stroke();

    // Subtle light edge highlight for crisp depth
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 1, padY);
    ctx.lineTo(x + 1, padY + barH);
    ctx.stroke();
  }

  ctx.restore(); // Undo clip

  // 6. Solid dark outer border around the whole strip
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(padX, padY, barW, barH, radius);
  } else {
    ctx.rect(padX, padY, barW, barH);
  }
  ctx.stroke();

  // Note: Aucun chiffre marqué sur les parts
  // ("les chiffres ne doivent pas être marqués")

  ctx.restore();
}

function drawHatchingPattern(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  index: number
) {
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2.5;

  const step = 8;
  for (let d = -r; d <= r; d += step) {
    ctx.beginPath();
    if (index % 2 === 0) {
      ctx.moveTo(cx - r + d, cy - r);
      ctx.lineTo(cx + r + d, cy + r);
    } else {
      ctx.moveTo(cx - r + d, cy + r);
      ctx.lineTo(cx + r + d, cy - r);
    }
    ctx.stroke();
  }
  ctx.restore();
}
