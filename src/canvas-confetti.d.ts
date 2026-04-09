declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    shapes?: Array<'square' | 'circle' | 'star'>;
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  type ConfettiFn = (options?: ConfettiOptions) => Promise<null | undefined>;

  interface ConfettiAPI extends ConfettiFn {
    create: (
      canvas: HTMLCanvasElement,
      options?: { resize?: boolean; useWorker?: boolean },
    ) => ConfettiFn;
    reset: () => void;
  }

  const confetti: ConfettiAPI;
  export default confetti;
}
