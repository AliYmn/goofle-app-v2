import {
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  type WithSpringConfig,
  type WithTimingConfig,
} from 'react-native-reanimated';

export const SPRING: Record<string, WithSpringConfig> = {
  gentle:  { damping: 20, stiffness: 150 },
  bouncy:  { damping: 12, stiffness: 200 },
  snappy:  { damping: 20, stiffness: 300 },
  slow:    { damping: 20, stiffness: 80 },
};

export const TIMING: Record<string, WithTimingConfig> = {
  fast:   { duration: 150, easing: Easing.out(Easing.ease) },
  normal: { duration: 250, easing: Easing.out(Easing.ease) },
  slow:   { duration: 400, easing: Easing.out(Easing.ease) },
  fade:   { duration: 200, easing: Easing.inOut(Easing.ease) },
};

export const pressIn = (scale = 0.97) =>
  withSpring(scale, SPRING.snappy);

export const pressOut = () =>
  withSpring(1, SPRING.bouncy);

export const fadeIn = (delay = 0) =>
  withDelay(delay, withTiming(1, TIMING.normal));

export const fadeOut = (delay = 0) =>
  withDelay(delay, withTiming(0, TIMING.normal));

export const scaleIn = (delay = 0) =>
  withDelay(delay, withSpring(1, SPRING.bouncy));

export const scaleOut = () =>
  withSpring(0.8, SPRING.snappy);

export const heartPop = () =>
  withSequence(
    withSpring(1.4, SPRING.bouncy),
    withSpring(1, SPRING.gentle),
  );

export const slideUp = (delay = 0) =>
  withDelay(delay, withSpring(0, SPRING.snappy));

export const staggerDelay = (index: number, baseDelay = 50) =>
  index * baseDelay;
