import { Lexer } from './lexer'
import { Parser } from './parser'
import { Evaluator, ReturnSignal } from './evaluator'
import { FunctionDeclNode } from './ast'

export interface RunnerHooks {
  onLog?: (message: string) => void
  onStateChange?: (state: 'IDLE' | 'RUNNING' | 'PAUSED' | 'ERROR') => void
  onError?: (error: string) => void
}

export class InterpreterRunner {
  private evaluator: Evaluator
  private state: 'IDLE' | 'RUNNING' | 'PAUSED' | 'ERROR' = 'IDLE'
  private hooks: RunnerHooks
  private startTime: number = 0
  private pausedTime: number = 0
  private totalPausedDuration: number = 0
  private speedMultiplier: number = 1
  private loopPromiseResolve: (() => void) | null = null

  constructor(hooks: RunnerHooks = {}) {
    this.hooks = hooks
    this.evaluator = new Evaluator()
    this.setupBuiltins()
  }

  private setupBuiltins() {
    // Serial object simulation
    const serialObj = {
      begin: (baud: number) => {
        // Serial initialized
      },
      print: (...args: any[]) => {
        const msg = args.map(a => String(a)).join('')
        this.hooks.onLog?.(msg)
      },
      println: (...args: any[]) => {
        const msg = args.map(a => String(a)).join('') + '\n'
        this.hooks.onLog?.(msg)
      }
    }
    this.evaluator.registerVariable('Serial', serialObj)

    // Non-blocking delay function (sub-task 2.3)
    this.evaluator.registerFunction('delay', async (ms: number) => {
      if (typeof ms !== 'number' || ms <= 0) return
      const scaledMs = Math.max(1, ms / this.speedMultiplier)

      return new Promise<void>((resolve) => {
        let elapsed = 0
        const interval = 10
        const timer = setInterval(() => {
          if (this.state === 'IDLE' || this.state === 'ERROR') {
            clearInterval(timer)
            resolve()
            return
          }
          if (this.state === 'RUNNING') {
            elapsed += interval
            if (elapsed >= scaledMs) {
              clearInterval(timer)
              resolve()
            }
          }
        }, interval)
      })
    })

    // millis() function (sub-task 2.3)
    this.evaluator.registerFunction('millis', () => {
      if (this.startTime === 0) return 0
      const now = Date.now()
      const effectiveDuration = (now - this.startTime - this.totalPausedDuration) * this.speedMultiplier
      return Math.floor(Math.max(0, effectiveDuration))
    })

    // micros() function
    this.evaluator.registerFunction('micros', () => {
      const ms = this.evaluator.getGlobalEnv().get('millis')()
      return ms * 1000
    })

    // Math functions
    this.evaluator.registerFunction('abs', (x: number) => Math.abs(x))
    this.evaluator.registerFunction('min', (a: number, b: number) => Math.min(a, b))
    this.evaluator.registerFunction('max', (a: number, b: number) => Math.max(a, b))
    this.evaluator.registerFunction('map', (x: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
      return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
    })
    this.evaluator.registerFunction('constrain', (amt: number, low: number, high: number) => {
      return Math.max(low, Math.min(high, amt))
    })
    this.evaluator.registerFunction('random', (min: number, max?: number) => {
      if (max === undefined) return Math.floor(Math.random() * min)
      return Math.floor(Math.random() * (max - min)) + min
    })
  }

  public registerHardwareApi(name: string, fn: (...args: any[]) => any) {
    this.evaluator.registerFunction(name, fn)
  }

  public setSpeedMultiplier(multiplier: number) {
    this.speedMultiplier = Math.max(0.1, multiplier)
  }

  public getState(): 'IDLE' | 'RUNNING' | 'PAUSED' | 'ERROR' {
    return this.state
  }

  public async start(code: string): Promise<void> {
    this.stop()
    this.state = 'RUNNING'
    this.hooks.onStateChange?.(this.state)
    this.startTime = Date.now()
    this.totalPausedDuration = 0

    try {
      // 1. Lexing
      const lexer = new Lexer(code)
      const tokens = lexer.tokenize()

      // 2. Parsing AST
      const parser = new Parser(tokens)
      const program = parser.parse()

      // 3. Evaluate Top-Level Program & Register Functions
      await this.evaluator.evaluateProgram(program)

      // 4. Run main() if present, or setup() and loop()
      const env = this.evaluator.getGlobalEnv()
      const mainFn = env.get('main')
      const setupFn = env.get('setup')
      const loopFn = env.get('loop')

      if (mainFn && typeof mainFn === 'object' && mainFn.type === 'FunctionDecl') {
        try {
          const fnEnv = env.createChild()
          await this.evaluator.evaluate((mainFn as FunctionDeclNode).body, fnEnv)
        } catch (signal) {
          if (!(signal instanceof ReturnSignal)) throw signal
        }
      } else {
        if (setupFn && typeof setupFn === 'object' && setupFn.type === 'FunctionDecl') {
          try {
            const fnEnv = env.createChild()
            await this.evaluator.evaluate((setupFn as FunctionDeclNode).body, fnEnv)
          } catch (signal) {
            if (!(signal instanceof ReturnSignal)) throw signal
          }
        }

        if (loopFn && typeof loopFn === 'object' && loopFn.type === 'FunctionDecl') {
          this.runLoopAsync(loopFn as FunctionDeclNode)
        }
      }
    } catch (err: any) {
      this.state = 'ERROR'
      this.hooks.onStateChange?.(this.state)
      const errMsg = err?.message || String(err)
      this.hooks.onError?.(errMsg)
      this.hooks.onLog?.(`[ERROR] ${errMsg}\n`)
    }
  }

  private async runLoopAsync(loopFn: FunctionDeclNode) {
    const env = this.evaluator.getGlobalEnv()

    while (this.state === 'RUNNING' || this.state === 'PAUSED') {
      if (this.state === 'PAUSED') {
        await new Promise<void>(resolve => {
          this.loopPromiseResolve = resolve
        })
      }

      if (this.state !== 'RUNNING') break

      try {
        const fnEnv = env.createChild()
        await this.evaluator.evaluate(loopFn.body, fnEnv)
      } catch (signal) {
        if (!(signal instanceof ReturnSignal)) {
          this.state = 'ERROR'
          this.hooks.onStateChange?.(this.state)
          const errMsg = signal instanceof Error ? signal.message : String(signal)
          this.hooks.onError?.(errMsg)
          this.hooks.onLog?.(`[ERROR] ${errMsg}\n`)
          break
        }
      }

      // Yield back to event loop briefly to prevent browser freezing
      await new Promise<void>(resolve => setTimeout(resolve, 5 / this.speedMultiplier))
    }
  }

  public pause() {
    if (this.state === 'RUNNING') {
      this.state = 'PAUSED'
      this.pausedTime = Date.now()
      this.hooks.onStateChange?.(this.state)
    }
  }

  public resume() {
    if (this.state === 'PAUSED') {
      if (this.pausedTime > 0) {
        this.totalPausedDuration += Date.now() - this.pausedTime
        this.pausedTime = 0
      }
      this.state = 'RUNNING'
      this.hooks.onStateChange?.(this.state)
      if (this.loopPromiseResolve) {
        this.loopPromiseResolve()
        this.loopPromiseResolve = null
      }
    }
  }

  public stop() {
    this.state = 'IDLE'
    this.evaluator.stop()
    this.hooks.onStateChange?.(this.state)
    if (this.loopPromiseResolve) {
      this.loopPromiseResolve()
      this.loopPromiseResolve = null
    }
  }
}
