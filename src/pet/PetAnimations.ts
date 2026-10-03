import gsap from 'gsap';

export class PetAnimationController {
  private element: HTMLElement | null = null;
  private timeline: gsap.core.Timeline | null = null;
  private idleTimeout: ReturnType<typeof setTimeout> | null = null;

  public init(element: HTMLElement) {
    this.element = element;
    this.startBreathing();
  }

  // ── Idle breathing: gentle bob + subtle scale ──
  public startBreathing() {
    if (!this.element) return;
    this.killTimeline();
    gsap.set(this.element, { rotation: 0, x: 0 });

    this.timeline = gsap.timeline({ repeat: -1, yoyo: true });
    this.timeline.to(this.element, {
      y: -5,
      scaleY: 1.018,
      scaleX: 0.988,
      duration: 2.2,
      ease: 'sine.inOut'
    });
  }

  // ── Sleep: slow heavy breathing ──
  public startSleeping() {
    if (!this.element) return;
    this.killTimeline();
    gsap.set(this.element, { rotation: 0, x: 0 });

    this.timeline = gsap.timeline({ repeat: -1, yoyo: true });
    this.timeline.to(this.element, {
      y: -3,
      scaleY: 1.01,
      scaleX: 0.995,
      duration: 3.5,
      ease: 'sine.inOut'
    });
  }

  // ── Perky jump (click feedback) ──
  public triggerJump() {
    if (!this.element) return;
    this.killTimeline();

    const tl = gsap.timeline({ onComplete: () => this.startBreathing() });
    tl.to(this.element, { y: -28, scaleY: 1.14, scaleX: 0.90, duration: 0.22, ease: 'power2.out' })
      .to(this.element, { y: 0, scaleY: 0.94, scaleX: 1.08, duration: 0.14, ease: 'power2.in' })
      .to(this.element, { scaleY: 1, scaleX: 1, duration: 0.18, ease: 'elastic.out(1, 0.5)' });

    this.timeline = tl;
  }

  // ── Celebration: spin + bounce ──
  public triggerCelebrate() {
    if (!this.element) return;
    this.killTimeline();

    const tl = gsap.timeline({ onComplete: () => this.startBreathing() });
    tl.to(this.element, { rotation: -15, scale: 1.12, duration: 0.18 })
      .to(this.element, { rotation: 15, scale: 1.12, duration: 0.18 })
      .to(this.element, { rotation: -10, duration: 0.15 })
      .to(this.element, { rotation: 0, scale: 1, duration: 0.15 })
      .to(this.element, { y: -32, duration: 0.28, ease: 'back.out(2.5)' })
      .to(this.element, { y: 0, duration: 0.32, ease: 'bounce.out' });

    this.timeline = tl;
  }

  // ── Worried: nervous jitter ──
  public triggerWorry() {
    if (!this.element) return;
    this.killTimeline();

    this.timeline = gsap.timeline({ repeat: 5, yoyo: true, onComplete: () => this.startBreathing() });
    this.timeline.to(this.element, {
      x: -5,
      rotation: -2,
      duration: 0.07,
      ease: 'power1.inOut'
    });
  }

  // ── Walking step: subtle horizontal wobble ──
  public triggerWalkStep(direction: 'left' | 'right') {
    if (!this.element) return;
    const tl = gsap.timeline();
    const sign = direction === 'left' ? -1 : 1;
    tl.to(this.element, { scaleX: -sign, duration: 0 }) // flip to face direction
      .to(this.element, { y: -6, rotation: sign * 3, duration: 0.18, ease: 'power1.out' })
      .to(this.element, { y: 0, rotation: 0, duration: 0.18, ease: 'power1.in' });
  }

  public killTimeline() {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
    if (this.element) {
      // Reset transforms cleanly
      gsap.set(this.element, { y: 0, scaleY: 1, scaleX: 1, rotation: 0, x: 0 });
    }
  }

  public destroy() {
    this.killTimeline();
    this.element = null;
  }
}
