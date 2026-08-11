export interface RobotPhysicalConfig {
  wheelBase: number // mm (distance between wheels)
  wheelRadius: number // mm
  maxSpeed: number // mm/s at 100% motor power
  accelRate: number // mm/s^2 acceleration ramping
  decelRate: number // mm/s^2 deceleration ramping
  frictionCoeff: number // surface friction (0.0 to 1.0)
  bodyWidth?: number // mm (chassis width)
  bodyLength?: number // mm (chassis length)
  color?: string // hex color code
}

export interface ExtendedPhysicsState {
  x: number // Position X in map mm
  y: number // Position Y in map mm
  heading: number // Radians (0 = East/Right, Math.PI/2 = South/Down in screen space, or Math.PI/2 = North/Up)
  linearVelocity: number // mm/s
  angularVelocity: number // rad/s
  leftWheelSpeed: number // Actual current speed mm/s
  rightWheelSpeed: number // Actual current speed mm/s
  targetLeftSpeed: number // Command target speed mm/s
  targetRightSpeed: number // Command target speed mm/s
  leftEncoder: number // Cumulative mm traveled by left wheel
  rightEncoder: number // Cumulative mm traveled by right wheel
  isStuck: boolean // Boundary collision state
  slipRatio: number // Dynamic slip ratio (0.0 = full traction, >0 = slipping)
}

export const DEFAULT_PHYSICS_CONFIG: RobotPhysicalConfig = {
  wheelBase: 140, // 14 cm
  wheelRadius: 30, // 3 cm
  maxSpeed: 600, // 60 cm/s
  accelRate: 1800, // Reach top speed in ~0.33s
  decelRate: 2400, // Stop in ~0.25s
  frictionCoeff: 0.9,
  bodyWidth: 140,
  bodyLength: 160,
  color: '#06b6d4'
}

export function createInitialPhysicsState(
  startX: number = 1400,
  startY: number = 800,
  startHeadingDeg: number = 0
): ExtendedPhysicsState {
  return {
    x: startX,
    y: startY,
    heading: (startHeadingDeg * Math.PI) / 180,
    linearVelocity: 0,
    angularVelocity: 0,
    leftWheelSpeed: 0,
    rightWheelSpeed: 0,
    targetLeftSpeed: 0,
    targetRightSpeed: 0,
    leftEncoder: 0,
    rightEncoder: 0,
    isStuck: false,
    slipRatio: 0
  }
}

/**
 * Step physics state forward by delta time dt (seconds)
 */
export function stepPhysics(
  state: ExtendedPhysicsState,
  motorLeftPct: number, // -100 to 100
  motorRightPct: number, // -100 to 100
  dt: number,
  mapBounds: { widthMm: number; heightMm: number },
  config: RobotPhysicalConfig = DEFAULT_PHYSICS_CONFIG
): ExtendedPhysicsState {
  // Clamp motor percentages
  const leftPct = Math.max(-100, Math.min(100, motorLeftPct))
  const rightPct = Math.max(-100, Math.min(100, motorRightPct))

  // 1. Calculate Target Speeds (mm/s)
  const targetLeft = (leftPct / 100) * config.maxSpeed
  const targetRight = (rightPct / 100) * config.maxSpeed

  // 2. Acceleration / Deceleration Ramping (Feature 3.2)
  let currentLeft = state.leftWheelSpeed
  let currentRight = state.rightWheelSpeed

  // Left wheel ramping
  if (targetLeft > currentLeft) {
    const rate = targetLeft > 0 && currentLeft < 0 ? config.decelRate : config.accelRate
    currentLeft = Math.min(targetLeft, currentLeft + rate * dt)
  } else if (targetLeft < currentLeft) {
    const rate = targetLeft < 0 && currentLeft > 0 ? config.decelRate : config.accelRate
    currentLeft = Math.max(targetLeft, currentLeft - rate * dt)
  }

  // Right wheel ramping
  if (targetRight > currentRight) {
    const rate = targetRight > 0 && currentRight < 0 ? config.decelRate : config.accelRate
    currentRight = Math.min(targetRight, currentRight + rate * dt)
  } else if (targetRight < currentRight) {
    const rate = targetRight < 0 && currentRight > 0 ? config.decelRate : config.accelRate
    currentRight = Math.max(targetRight, currentRight - rate * dt)
  }

  // 3. Friction & Wheel Slip Model (Feature 3.3)
  // Higher differential speeds or sharp turns under high speed induce slip
  const speedDiff = Math.abs(currentLeft - currentRight)
  const avgAbsSpeed = (Math.abs(currentLeft) + Math.abs(currentRight)) / 2
  
  // Calculate slip factor based on sharp turning force vs surface friction
  let slipRatio = 0
  if (avgAbsSpeed > 100 && speedDiff > 200) {
    const rawSlip = (speedDiff / (config.maxSpeed * 2)) * (1.0 - config.frictionCoeff * 0.8)
    slipRatio = Math.min(0.25, rawSlip)
  }

  const effectiveLeft = currentLeft * (1.0 - slipRatio)
  const effectiveRight = currentRight * (1.0 - slipRatio)

  // 4. Differential Kinematics Equations (Feature 3.1)
  const linearVel = (effectiveLeft + effectiveRight) / 2
  const angularVel = (effectiveLeft - effectiveRight) / config.wheelBase

  // Update Heading
  let nextHeading = state.heading + angularVel * dt
  // Normalize heading to [-PI, PI]
  while (nextHeading > Math.PI) nextHeading -= 2 * Math.PI
  while (nextHeading < -Math.PI) nextHeading += 2 * Math.PI

  // Update Position (Map coordinates in mm)
  // Heading 0 = +X (East), Math.PI/2 = +Y (South in standard canvas coordinates)
  const dx = linearVel * Math.cos(nextHeading) * dt
  const dy = linearVel * Math.sin(nextHeading) * dt

  let nextX = state.x + dx
  let nextY = state.y + dy
  let isStuck = false

  // Robot boundary radius safety margin (e.g. 80mm)
  const margin = 80
  if (nextX < margin) {
    nextX = margin
    isStuck = true
  } else if (nextX > mapBounds.widthMm - margin) {
    nextX = mapBounds.widthMm - margin
    isStuck = true
  }

  if (nextY < margin) {
    nextY = margin
    isStuck = true
  } else if (nextY > mapBounds.heightMm - margin) {
    nextY = mapBounds.heightMm - margin
    isStuck = true
  }

  // 5. Update Wheel Encoders (cumulative distance in mm)
  const nextLeftEncoder = state.leftEncoder + Math.abs(effectiveLeft * dt)
  const nextRightEncoder = state.rightEncoder + Math.abs(effectiveRight * dt)

  return {
    x: nextX,
    y: nextY,
    heading: nextHeading,
    linearVelocity: linearVel,
    angularVelocity: angularVel,
    leftWheelSpeed: currentLeft,
    rightWheelSpeed: currentRight,
    targetLeftSpeed: targetLeft,
    targetRightSpeed: targetRight,
    leftEncoder: nextLeftEncoder,
    rightEncoder: nextRightEncoder,
    isStuck,
    slipRatio
  }
}
