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

let sharedAudioCtx: AudioContext | null = null

function playBuzzerTone(frequency: number = 1000, durationMs: number = 100) {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx()
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume()
    }

    const osc = sharedAudioCtx.createOscillator()
    const gain = sharedAudioCtx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency, sharedAudioCtx.currentTime)

    gain.gain.setValueAtTime(0.12, sharedAudioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, sharedAudioCtx.currentTime + durationMs / 1000)

    osc.connect(gain)
    gain.connect(sharedAudioCtx.destination)

    osc.start()
    osc.stop(sharedAudioCtx.currentTime + durationMs / 1000)
  } catch (err) {
    // Audio autoplay policy fallback
  }
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

  // ATOM-VX / POP32 / Arduino Common Motion Commands
  registerFn('fd', (speed: number = 50) => setDrive(speed, speed))
  registerFn('fd2', (lSpeed: number = 50, rSpeed: number = 50) => setDrive(lSpeed, rSpeed))
  registerFn('bk', (speed: number = 50) => setDrive(-speed, -speed))
  registerFn('bk2', (lSpeed: number = 50, rSpeed: number = 50) => setDrive(-lSpeed, -rSpeed))
  registerFn('tl', (speed: number = 50) => setDrive(-speed, speed))
  registerFn('tr', (speed: number = 50) => setDrive(speed, -speed))
  registerFn('sl', (speed: number = 50) => setDrive(0, speed))
  registerFn('sr', (speed: number = 50) => setDrive(speed, 0))
  registerFn('ao', () => setDrive(0, 0))
  registerFn('motor', (ch: number, speed: number) => setMotor(ch, speed))
  registerFn('analog', (pin: number) => hwState.analogPins[pin] ?? 500)
  registerFn('in', (pin: number) => hwState.digitalPins[pin] ?? 0)
  registerFn('gl', (pin: number = 0) => hwState.analogPins[pin] ?? 500)
  registerFn('knob', () => hwState.knobValue)

  // POP32 / ATOM / Arduino Sound & Beep APIs
  registerFn('beep', (param1?: number, param2?: number) => {
    let freq = 1000
    let duration = 100

    if (typeof param1 === 'number' && typeof param2 === 'number') {
      freq = param1
      duration = param2
    } else if (typeof param1 === 'number') {
      duration = param1
    }

    hwState.soundFreq = freq
    hwState.soundDuration = duration
    playBuzzerTone(freq, duration)
  })

  registerFn('sound', (freq: number = 1000, duration: number = 100) => {
    hwState.soundFreq = freq
    hwState.soundDuration = duration
    playBuzzerTone(freq, duration)
  })

  registerFn('tone', (pinOrFreq: number, freqOrDur?: number, duration?: number) => {
    let freq = 1000
    let dur = 100
    if (typeof duration === 'number') {
      freq = freqOrDur || 1000
      dur = duration
    } else if (typeof freqOrDur === 'number') {
      freq = pinOrFreq
      dur = freqOrDur
    }
    hwState.soundFreq = freq
    hwState.soundDuration = dur
    playBuzzerTone(freq, dur)
  })

  registerFn('noTone', () => {
    hwState.soundFreq = 0
    hwState.soundDuration = 0
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

  // C++ / Arduino Math & Helper Functions
  registerFn('map', (x: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
    if (inMax === inMin) return outMin
    return Math.round(outMin + ((x - inMin) * (outMax - outMin)) / (inMax - inMin))
  })
  registerFn('constrain', (amt: number, low: number, high: number) => {
    return Math.max(low, Math.min(high, amt))
  })
  registerFn('abs', (x: number) => Math.abs(x))
  registerFn('min', (a: number, b: number) => Math.min(a, b))
  registerFn('max', (a: number, b: number) => Math.max(a, b))
  registerFn('sqrt', (x: number) => Math.sqrt(x))
  registerFn('pow', (base: number, exp: number) => Math.pow(base, exp))
  registerFn('random', (minOrMax: number, maxVal?: number) => {
    if (maxVal !== undefined) {
      return Math.floor(Math.random() * (maxVal - minOrMax + 1)) + minOrMax
    }
    return Math.floor(Math.random() * minOrMax)
  })
}
