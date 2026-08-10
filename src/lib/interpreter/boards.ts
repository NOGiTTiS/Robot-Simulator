export interface HardwareState {
  motors: { [channel: number]: number } // speed -100..100
  leftMotorSpeed: number // -100..100
  rightMotorSpeed: number // -100..100
  digitalPins: { [pin: number]: number } // 0 or 1
  analogPins: { [pin: number]: number } // 0..1023 (or 4095)
  pinModes: { [pin: number]: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP' }
  knobValue: number // 0..1023
  soundFreq: number
  soundDuration: number
}

export function createInitialHardwareState(): HardwareState {
  return {
    motors: { 1: 0, 2: 0, 3: 0, 4: 0 },
    leftMotorSpeed: 0,
    rightMotorSpeed: 0,
    digitalPins: {},
    analogPins: { 0: 500, 1: 500, 2: 500, 3: 500, 4: 500, 5: 500 },
    pinModes: {},
    knobValue: 512,
    soundFreq: 0,
    soundDuration: 0
  }
}

export function resetHardwareState(hwState: HardwareState) {
  hwState.motors[1] = 0
  hwState.motors[2] = 0
  hwState.motors[3] = 0
  hwState.motors[4] = 0
  hwState.leftMotorSpeed = 0
  hwState.rightMotorSpeed = 0
  hwState.knobValue = 512
  hwState.soundFreq = 0
  hwState.soundDuration = 0
  hwState.digitalPins = {}
  hwState.analogPins = { 0: 500, 1: 500, 2: 500, 3: 500, 4: 500, 5: 500 }
  hwState.pinModes = {}
}

export function bindBoardApis(
  boardType: string,
  registerFn: (name: string, fn: (...args: any[]) => any) => void,
  hwState: HardwareState
) {
  // Common Movement Helper Functions
  const setDrive = (left: number, right: number) => {
    hwState.leftMotorSpeed = Math.max(-100, Math.min(100, left))
    hwState.rightMotorSpeed = Math.max(-100, Math.min(100, right))
    hwState.motors[1] = hwState.leftMotorSpeed
    hwState.motors[2] = hwState.rightMotorSpeed
  }

  const setMotor = (ch: number, speed: number) => {
    const clamped = Math.max(-100, Math.min(100, speed))
    hwState.motors[ch] = clamped
    if (ch === 1) hwState.leftMotorSpeed = clamped
    if (ch === 2) hwState.rightMotorSpeed = clamped
  }

  // Universal Movement & Control Bindings (Works across all boards)
  registerFn('fd', (speed: number = 50) => setDrive(speed, speed))
  registerFn('bk', (speed: number = 50) => setDrive(-speed, -speed))
  registerFn('tl', (speed: number = 50) => setDrive(0, speed))
  registerFn('tr', (speed: number = 50) => setDrive(speed, 0))
  registerFn('sl', (speed: number = 50) => setDrive(-speed, speed))
  registerFn('sr', (speed: number = 50) => setDrive(speed, -speed))
  registerFn('ao', () => setDrive(0, 0))
  registerFn('motor', (ch: number, speed: number) => setMotor(ch, speed))
  registerFn('analog', (pin: number) => hwState.analogPins[pin] ?? 500)
  registerFn('in', (pin: number) => hwState.digitalPins[pin] ?? 0)
  registerFn('gl', (pin: number = 0) => hwState.analogPins[pin] ?? 500)
  registerFn('knob', () => hwState.knobValue)

  // POP32 Sound / Beep
  registerFn('sound', (freq: number = 1000, duration: number = 100) => {
    hwState.soundFreq = freq
    hwState.soundDuration = duration
  })
  registerFn('beep', () => {
    hwState.soundFreq = 1000
    hwState.soundDuration = 100
  })

  // Arduino Standard Functions
  registerFn('pinMode', (pin: number, mode: number | string) => {
    let modeStr: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP' = 'INPUT'
    if (mode === 1 || mode === 'OUTPUT') modeStr = 'OUTPUT'
    else if (mode === 2 || mode === 'INPUT_PULLUP') modeStr = 'INPUT_PULLUP'
    hwState.pinModes[pin] = modeStr
  })

  registerFn('digitalWrite', (pin: number, val: number) => {
    hwState.digitalPins[pin] = val ? 1 : 0
    // Smart drive fallback if user writes digitalWrite to motor pins
    if (val) {
      if (pin === 2 || pin === 3 || pin === 13) hwState.leftMotorSpeed = hwState.leftMotorSpeed || 60
      if (pin === 4 || pin === 5 || pin === 12) hwState.rightMotorSpeed = hwState.rightMotorSpeed || 60
      hwState.motors[1] = hwState.leftMotorSpeed
      hwState.motors[2] = hwState.rightMotorSpeed
    }
  })

  registerFn('digitalRead', (pin: number) => {
    return hwState.digitalPins[pin] ?? 0
  })

  registerFn('analogRead', (pin: number) => {
    return hwState.analogPins[pin] ?? 500
  })

  registerFn('analogWrite', (pin: number, val: number) => {
    const clamped = Math.max(0, Math.min(255, val))
    hwState.analogPins[pin] = clamped
    const speedPercent = (clamped / 255) * 100
    if (pin === 3 || pin === 5 || pin === 1) setMotor(1, speedPercent)
    if (pin === 6 || pin === 9 || pin === 2) setMotor(2, speedPercent)
  })
}
