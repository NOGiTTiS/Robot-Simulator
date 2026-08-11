import {
  ASTNode,
  ProgramNode,
  FunctionDeclNode,
  VarDeclNode,
  BlockStatementNode,
  IfStatementNode,
  WhileStatementNode,
  ForStatementNode,
  ExpressionStatementNode,
  BinaryExpressionNode,
  UnaryExpressionNode,
  CallExpressionNode,
  MemberExpressionNode,
  AssignmentExpressionNode,
  IdentifierNode,
  LiteralNode,
  ReturnStatementNode
} from './ast'
import { Environment } from './environment'

export class ReturnSignal {
  value: any
  constructor(value: any) {
    this.value = value
  }
}

export class BreakSignal {}
export class ContinueSignal {}

export class Evaluator {
  private globalEnv: Environment
  private isStopped: boolean = false

  constructor() {
    this.globalEnv = new Environment()
  }

  public registerFunction(name: string, fn: (...args: any[]) => any): void {
    this.globalEnv.define(name, fn)
  }

  public registerVariable(name: string, value: any): void {
    this.globalEnv.define(name, value)
  }

  public getGlobalEnv(): Environment {
    return this.globalEnv
  }

  public stop(): void {
    this.isStopped = true
  }

  public reset(): void {
    this.isStopped = false
  }

  public async evaluateProgram(program: ProgramNode): Promise<void> {
    this.isStopped = false
    const env = this.globalEnv

    for (const node of program.body) {
      if (this.isStopped) break
      await this.evaluate(node, env)
    }
  }

  public async evaluate(node: ASTNode, env: Environment): Promise<any> {
    if (this.isStopped) return undefined

    switch (node.type) {
      case 'Program':
        for (const stmt of node.body) {
          if (this.isStopped) break
          await this.evaluate(stmt, env)
        }
        return

      case 'FunctionDecl':
        env.define(node.name, node)
        return

      case 'VarDecl': {
        const val = node.initializer ? await this.evaluate(node.initializer, env) : 0
        env.define(node.name, val)
        return val
      }

      case 'BlockStatement': {
        const blockEnv = env.createChild()
        for (const stmt of node.body) {
          if (this.isStopped) break
          await this.evaluate(stmt, blockEnv)
        }
        return
      }

      case 'IfStatement': {
        const cond = await this.evaluate(node.test, env)
        if (cond) {
          await this.evaluate(node.consequent, env)
        } else if (node.alternate) {
          await this.evaluate(node.alternate, env)
        }
        return
      }

      case 'WhileStatement': {
        let whileIter = 0
        while (!this.isStopped && (await this.evaluate(node.test, env))) {
          whileIter++
          if (whileIter % 20 === 0) {
            await new Promise((r) => setTimeout(r, 0))
          }
          try {
            await this.evaluate(node.body, env)
          } catch (signal) {
            if (signal instanceof BreakSignal) break
            if (signal instanceof ContinueSignal) continue
            throw signal
          }
        }
        return
      }

      case 'ForStatement': {
        const forEnv = env.createChild()
        if (node.init) {
          await this.evaluate(node.init, forEnv)
        }
        let forIter = 0
        while (!this.isStopped) {
          forIter++
          if (forIter % 20 === 0) {
            await new Promise((r) => setTimeout(r, 0))
          }
          if (node.test) {
            const cond = await this.evaluate(node.test, forEnv)
            if (!cond) break
          }
          try {
            await this.evaluate(node.body, forEnv)
          } catch (signal) {
            if (signal instanceof BreakSignal) break
            if (signal instanceof ContinueSignal) {
              if (node.update) await this.evaluate(node.update, forEnv)
              continue
            }
            throw signal
          }
          if (node.update) {
            await this.evaluate(node.update, forEnv)
          }
        }
        return
      }

      case 'ExpressionStatement':
        return await this.evaluate(node.expression, env)

      case 'BinaryExpression': {
        const left = await this.evaluate(node.left, env)
        const right = await this.evaluate(node.right, env)
        return this.evalBinary(node.operator, left, right)
      }

      case 'UnaryExpression': {
        if (node.prefix) {
          if (node.operator === '!') return !(await this.evaluate(node.argument, env))
          if (node.operator === '-') return -(await this.evaluate(node.argument, env))
          if (node.operator === '++' && node.argument.type === 'Identifier') {
            const current = env.get(node.argument.name) || 0
            env.set(node.argument.name, current + 1)
            return current + 1
          }
          if (node.operator === '--' && node.argument.type === 'Identifier') {
            const current = env.get(node.argument.name) || 0
            env.set(node.argument.name, current - 1)
            return current - 1
          }
        } else {
          if (node.operator === '++' && node.argument.type === 'Identifier') {
            const current = env.get(node.argument.name) || 0
            env.set(node.argument.name, current + 1)
            return current
          }
          if (node.operator === '--' && node.argument.type === 'Identifier') {
            const current = env.get(node.argument.name) || 0
            env.set(node.argument.name, current - 1)
            return current
          }
        }
        return await this.evaluate(node.argument, env)
      }

      case 'AssignmentExpression': {
        const val = await this.evaluate(node.right, env)
        if (node.left.type === 'Identifier') {
          if (node.operator === '=') {
            env.set(node.left.name, val)
          } else if (node.operator === '+=') {
            const cur = env.get(node.left.name) || 0
            env.set(node.left.name, cur + val)
          } else if (node.operator === '-=') {
            const cur = env.get(node.left.name) || 0
            env.set(node.left.name, cur - val)
          }
        }
        return val
      }

      case 'CallExpression': {
        const callee = await this.evaluate(node.callee, env)
        const args: any[] = []
        for (const argNode of node.arguments) {
          args.push(await this.evaluate(argNode, env))
        }

        if (typeof callee === 'function') {
          return await callee(...args)
        }

        if (callee && typeof callee === 'object' && callee.type === 'FunctionDecl') {
          const fnDecl = callee as FunctionDeclNode
          const fnEnv = this.globalEnv.createChild()
          fnDecl.params.forEach((param, index) => {
            fnEnv.define(param.name, args[index] !== undefined ? args[index] : 0)
          })

          try {
            await this.evaluate(fnDecl.body, fnEnv)
          } catch (signal) {
            if (signal instanceof ReturnSignal) {
              return signal.value
            }
            throw signal
          }
          return undefined
        }

        throw new Error(`Execution Error: ${node.callee.type === 'Identifier' ? node.callee.name : 'Target'} is not a callable function`)
      }

      case 'MemberExpression': {
        const obj = await this.evaluate(node.object, env)
        if (obj && typeof obj === 'object') {
          return obj[node.property]
        }
        return undefined
      }

      case 'Identifier':
        return env.get(node.name)

      case 'Literal':
        return node.value

      case 'ReturnStatement': {
        const val = node.argument ? await this.evaluate(node.argument, env) : undefined
        throw new ReturnSignal(val)
      }

      case 'BreakStatement':
        throw new BreakSignal()

      case 'ContinueStatement':
        throw new ContinueSignal()

      default:
        return undefined
    }
  }

  private evalBinary(op: string, left: any, right: any): any {
    switch (op) {
      case '+': return left + right
      case '-': return left - right
      case '*': return left * right
      case '/': return right !== 0 ? left / right : 0
      case '%': return left % right
      case '==': return left == right
      case '!=': return left != right
      case '<': return left < right
      case '>': return left > right
      case '<=': return left <= right
      case '>=': return left >= right
      case '&&': return Boolean(left) && Boolean(right)
      case '||': return Boolean(left) || Boolean(right)
      case ',': return right
      default: return 0
    }
  }
}
