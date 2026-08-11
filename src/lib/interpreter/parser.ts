import {
  Token,
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
  ReturnStatementNode,
  BreakStatementNode,
  ContinueStatementNode,
  EmptyStatementNode
} from './ast'

const CTYPES = new Set([
  'void', 'int', 'float', 'double', 'char', 'bool', 'boolean', 'long', 'short',
  'unsigned', 'signed', 'const', 'static', 'String', 'byte', 'word', 'size_t', 'auto',
  'uint8_t', 'int8_t', 'uint16_t', 'int16_t', 'uint32_t', 'int32_t', 'uint64_t', 'int64_t'
])

export class Parser {
  private tokens: Token[]
  private pos: number = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  public parse(): ProgramNode {
    const body: ASTNode[] = []

    while (!this.isAtEnd()) {
      const stmt = this.parseTopLevel()
      if (stmt) body.push(stmt)
    }

    return {
      type: 'Program',
      body
    }
  }

  private peek(): Token {
    return this.tokens[this.pos] || { type: 'EOF', value: '', line: 0, column: 0 }
  }

  private previous(): Token {
    return this.tokens[this.pos - 1]
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF'
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.pos++
    return this.previous()
  }

  private match(type: string, value?: string): boolean {
    const current = this.peek()
    if (current.type === type && (value === undefined || current.value === value)) {
      this.advance()
      return true
    }
    return false
  }

  private consume(type: string, value?: string, errorMsg: string = ''): Token {
    if (this.match(type, value)) {
      return this.previous()
    }
    const current = this.peek()
    throw new Error(`Parse Error at line ${current.line}:${current.column} - ${errorMsg || `Expected ${type} ${value || ''}, got ${current.value}`}`)
  }

  private parseTopLevel(): ASTNode | null {
    // Optional semicolons at top-level
    if (this.match('PUNCTUATION', ';')) return null

    // Check if type declaration (variable or function declaration)
    const current = this.peek()
    if (CTYPES.has(current.value) || ['const', 'static', 'unsigned', 'signed'].includes(current.value)) {
      return this.parseVarOrFuncDecl()
    }

    // Direct statement or expression
    return this.parseStatement()
  }

  private parseVarOrFuncDecl(): ASTNode {
    let fullType = ''
    while (
      CTYPES.has(this.peek().value) ||
      ['const', 'static', 'unsigned', 'signed'].includes(this.peek().value)
    ) {
      fullType += (fullType ? ' ' : '') + this.advance().value
    }

    while (this.peek().value === '*' || this.peek().value === '&') {
      fullType += this.advance().value
    }

    const nameToken = this.peek()
    if (nameToken.type !== 'IDENTIFIER') {
      throw new Error(`Parse Error at line ${nameToken.line}:${nameToken.column} - Expected function or variable name, got ${nameToken.value}`)
    }
    const name = this.advance().value

    // Function Declaration or Prototype
    if (this.match('PUNCTUATION', '(')) {
      const params: { type: string; name: string }[] = []
      if (!this.match('PUNCTUATION', ')')) {
        do {
          let pType = 'int'
          if (
            CTYPES.has(this.peek().value) ||
            ['const', 'static', 'unsigned', 'signed'].includes(this.peek().value)
          ) {
            pType = this.advance().value
            while (
              CTYPES.has(this.peek().value) ||
              ['const', 'static', 'unsigned', 'signed'].includes(this.peek().value)
            ) {
              pType += ' ' + this.advance().value
            }
            while (this.peek().value === '*' || this.peek().value === '&') {
              pType += this.advance().value
            }
            if (this.peek().type === 'IDENTIFIER') {
              const pName = this.advance().value
              if (this.match('OPERATOR', '=')) {
                this.parseAssignment()
              }
              params.push({ type: pType, name: pName })
            }
          } else if (this.peek().type === 'IDENTIFIER') {
            const pName = this.advance().value
            if (this.match('OPERATOR', '=')) {
              this.parseAssignment()
            }
            params.push({ type: 'int', name: pName })
          }
        } while (this.match('PUNCTUATION', ','))
        this.consume('PUNCTUATION', ')', "Expected ')' after parameters")
      }

      if (this.match('PUNCTUATION', ';')) {
        return {
          type: 'FunctionDecl',
          returnType: fullType,
          name,
          params,
          body: { type: 'BlockStatement', body: [] }
        } as FunctionDeclNode
      }

      const body = this.parseBlockStatement()
      return {
        type: 'FunctionDecl',
        returnType: fullType,
        name,
        params,
        body
      } as FunctionDeclNode
    }

    // Variable Declaration (supports multiple comma-separated variables: int speed, time;)
    const varDecls: VarDeclNode[] = []

    const parseSingleVar = (varName: string): VarDeclNode => {
      let initializer: ASTNode | null = null
      if (this.match('OPERATOR', '=')) {
        initializer = this.parseAssignment()
      }
      return {
        type: 'VarDecl',
        varType: fullType,
        name: varName,
        initializer
      } as VarDeclNode
    }

    varDecls.push(parseSingleVar(name))

    while (this.match('PUNCTUATION', ',')) {
      const nextToken = this.peek()
      if (nextToken.type === 'IDENTIFIER') {
        const nextName = this.advance().value
        varDecls.push(parseSingleVar(nextName))
      } else {
        break
      }
    }

    this.match('PUNCTUATION', ';')

    if (varDecls.length === 1) {
      return varDecls[0]
    }

    return {
      type: 'BlockStatement',
      body: varDecls
    } as BlockStatementNode
  }

  private parseStatement(): ASTNode {
    if (this.match('KEYWORD', 'if')) {
      return this.parseIfStatement()
    }

    if (this.match('KEYWORD', 'while')) {
      return this.parseWhileStatement()
    }

    if (this.match('KEYWORD', 'for')) {
      return this.parseForStatement()
    }

    if (this.match('KEYWORD', 'return')) {
      let arg: ASTNode | null = null
      if (!this.match('PUNCTUATION', ';')) {
        arg = this.parseExpression()
        this.match('PUNCTUATION', ';')
      }
      return { type: 'ReturnStatement', argument: arg } as ReturnStatementNode
    }

    if (this.match('KEYWORD', 'break')) {
      this.match('PUNCTUATION', ';')
      return { type: 'BreakStatement' } as BreakStatementNode
    }

    if (this.match('KEYWORD', 'continue')) {
      this.match('PUNCTUATION', ';')
      return { type: 'ContinueStatement' } as ContinueStatementNode
    }

    if (this.peek().type === 'PUNCTUATION' && this.peek().value === '{') {
      return this.parseBlockStatement()
    }

    if (CTYPES.has(this.peek().value) || ['const', 'static', 'unsigned', 'signed'].includes(this.peek().value)) {
      return this.parseVarOrFuncDecl()
    }

    if (this.match('PUNCTUATION', ';')) {
      return { type: 'EmptyStatement' } as EmptyStatementNode
    }

    // Expression Statement
    const expr = this.parseExpression()
    this.match('PUNCTUATION', ';')
    return {
      type: 'ExpressionStatement',
      expression: expr
    } as ExpressionStatementNode
  }

  private parseBlockStatement(): BlockStatementNode {
    this.consume('PUNCTUATION', '{', "Expected '{'")
    const body: ASTNode[] = []

    while (!this.isAtEnd() && !(this.peek().type === 'PUNCTUATION' && this.peek().value === '}')) {
      if (this.match('PUNCTUATION', ';')) continue
      body.push(this.parseStatement())
    }

    this.consume('PUNCTUATION', '}', "Expected '}'")
    return {
      type: 'BlockStatement',
      body
    }
  }

  private parseIfStatement(): IfStatementNode {
    this.consume('PUNCTUATION', '(', "Expected '(' after 'if'")
    const test = this.parseExpression()
    this.consume('PUNCTUATION', ')', "Expected ')' after if condition")

    const consequent = this.parseBlockOrSingleStatement()

    let alternate: BlockStatementNode | IfStatementNode | null = null
    if (this.match('KEYWORD', 'else')) {
      if (this.match('KEYWORD', 'if')) {
        alternate = this.parseIfStatement()
      } else {
        alternate = this.parseBlockOrSingleStatement()
      }
    }

    return {
      type: 'IfStatement',
      test,
      consequent,
      alternate
    }
  }

  private parseWhileStatement(): WhileStatementNode {
    this.consume('PUNCTUATION', '(', "Expected '(' after 'while'")
    const test = this.parseExpression()
    this.consume('PUNCTUATION', ')', "Expected ')' after condition")
    const body = this.parseBlockOrSingleStatement()

    return {
      type: 'WhileStatement',
      test,
      body
    }
  }

  private parseForStatement(): ForStatementNode {
    this.consume('PUNCTUATION', '(', "Expected '(' after 'for'")

    let init: ASTNode | null = null
    if (!this.match('PUNCTUATION', ';')) {
      if (CTYPES.has(this.peek().value)) {
        init = this.parseVarOrFuncDecl()
      } else {
        init = this.parseExpression()
        this.match('PUNCTUATION', ';')
      }
    }

    let test: ASTNode | null = null
    if (!this.match('PUNCTUATION', ';')) {
      test = this.parseExpression()
      this.consume('PUNCTUATION', ';', "Expected ';' after for condition")
    }

    let update: ASTNode | null = null
    if (!this.match('PUNCTUATION', ')')) {
      update = this.parseExpression()
      this.consume('PUNCTUATION', ')', "Expected ')' after for clause")
    }

    const body = this.parseBlockOrSingleStatement()

    return {
      type: 'ForStatement',
      init,
      test,
      update,
      body
    }
  }

  private parseBlockOrSingleStatement(): BlockStatementNode {
    if (this.peek().type === 'PUNCTUATION' && this.peek().value === '{') {
      return this.parseBlockStatement()
    }
    const single = this.parseStatement()
    return {
      type: 'BlockStatement',
      body: [single]
    }
  }

  private parseExpression(): ASTNode {
    let expr = this.parseAssignment()

    while (this.match('PUNCTUATION', ',')) {
      const right = this.parseAssignment()
      expr = {
        type: 'BinaryExpression',
        operator: ',',
        left: expr,
        right
      } as BinaryExpressionNode
    }

    return expr
  }

  private parseAssignment(): ASTNode {
    const expr = this.parseLogicalOr()

    if (this.peek().type === 'OPERATOR' && ['=', '+=', '-='].includes(this.peek().value)) {
      const op = this.advance().value
      const right = this.parseAssignment()

      if (expr.type === 'Identifier' || expr.type === 'MemberExpression') {
        return {
          type: 'AssignmentExpression',
          operator: op,
          left: expr,
          right
        } as AssignmentExpressionNode
      }
    }

    return expr
  }

  private parseLogicalOr(): ASTNode {
    let left = this.parseLogicalAnd()

    while (this.match('OPERATOR', '||')) {
      const right = this.parseLogicalAnd()
      left = {
        type: 'BinaryExpression',
        operator: '||',
        left,
        right
      } as BinaryExpressionNode
    }

    return left
  }

  private parseLogicalAnd(): ASTNode {
    let left = this.parseEquality()

    while (this.match('OPERATOR', '&&')) {
      const right = this.parseEquality()
      left = {
        type: 'BinaryExpression',
        operator: '&&',
        left,
        right
      } as BinaryExpressionNode
    }

    return left
  }

  private parseEquality(): ASTNode {
    let left = this.parseRelational()

    while (this.peek().type === 'OPERATOR' && ['==', '!='].includes(this.peek().value)) {
      const op = this.advance().value
      const right = this.parseRelational()
      left = {
        type: 'BinaryExpression',
        operator: op,
        left,
        right
      } as BinaryExpressionNode
    }

    return left
  }

  private parseRelational(): ASTNode {
    let left = this.parseAdditive()

    while (this.peek().type === 'OPERATOR' && ['<', '>', '<=', '>='].includes(this.peek().value)) {
      const op = this.advance().value
      const right = this.parseAdditive()
      left = {
        type: 'BinaryExpression',
        operator: op,
        left,
        right
      } as BinaryExpressionNode
    }

    return left
  }

  private parseAdditive(): ASTNode {
    let left = this.parseMultiplicative()

    while (this.peek().type === 'OPERATOR' && ['+', '-'].includes(this.peek().value)) {
      const op = this.advance().value
      const right = this.parseMultiplicative()
      left = {
        type: 'BinaryExpression',
        operator: op,
        left,
        right
      } as BinaryExpressionNode
    }

    return left
  }

  private parseMultiplicative(): ASTNode {
    let left = this.parseUnary()

    while (this.peek().type === 'OPERATOR' && ['*', '/', '%'].includes(this.peek().value)) {
      const op = this.advance().value
      const right = this.parseUnary()
      left = {
        type: 'BinaryExpression',
        operator: op,
        left,
        right
      } as BinaryExpressionNode
    }

    return left
  }

  private parseUnary(): ASTNode {
    if (this.peek().type === 'OPERATOR' && ['!', '-', '++', '--'].includes(this.peek().value)) {
      const op = this.advance().value
      const arg = this.parseUnary()
      return {
        type: 'UnaryExpression',
        operator: op,
        argument: arg,
        prefix: true
      } as UnaryExpressionNode
    }

    return this.parseCallOrMember()
  }

  private parseCallOrMember(): ASTNode {
    let expr = this.parsePrimary()

    while (true) {
      if (this.match('PUNCTUATION', '.')) {
        const propName = this.consume('IDENTIFIER', undefined, 'Expected property name after .').value
        expr = {
          type: 'MemberExpression',
          object: expr,
          property: propName
        } as MemberExpressionNode
      } else if (this.match('PUNCTUATION', '(')) {
        const args: ASTNode[] = []
        if (!this.match('PUNCTUATION', ')')) {
          do {
            args.push(this.parseAssignment())
          } while (this.match('PUNCTUATION', ','))
          this.consume('PUNCTUATION', ')', "Expected ')' after arguments")
        }
        expr = {
          type: 'CallExpression',
          callee: expr,
          arguments: args
        } as CallExpressionNode
      } else if (this.peek().type === 'OPERATOR' && ['++', '--'].includes(this.peek().value)) {
        const op = this.advance().value
        expr = {
          type: 'UnaryExpression',
          operator: op,
          argument: expr,
          prefix: false
        } as UnaryExpressionNode
      } else {
        break
      }
    }

    return expr
  }

  private parsePrimary(): ASTNode {
    if (this.match('KEYWORD', 'true')) return { type: 'Literal', value: true } as LiteralNode
    if (this.match('KEYWORD', 'false')) return { type: 'Literal', value: false } as LiteralNode
    if (this.match('KEYWORD', 'HIGH')) return { type: 'Literal', value: 1 } as LiteralNode
    if (this.match('KEYWORD', 'LOW')) return { type: 'Literal', value: 0 } as LiteralNode
    if (this.match('KEYWORD', 'INPUT')) return { type: 'Literal', value: 0 } as LiteralNode
    if (this.match('KEYWORD', 'OUTPUT')) return { type: 'Literal', value: 1 } as LiteralNode
    if (this.match('KEYWORD', 'INPUT_PULLUP')) return { type: 'Literal', value: 2 } as LiteralNode

    const current = this.peek()

    if (current.type === 'NUMBER') {
      this.advance()
      const val = current.value.includes('.') ? parseFloat(current.value) : parseInt(current.value, 10)
      return { type: 'Literal', value: val } as LiteralNode
    }

    if (current.type === 'STRING') {
      this.advance()
      return { type: 'Literal', value: current.value } as LiteralNode
    }

    if (current.type === 'IDENTIFIER') {
      this.advance()
      return { type: 'Identifier', name: current.value } as IdentifierNode
    }

    if (this.match('PUNCTUATION', '(')) {
      const expr = this.parseExpression()
      this.consume('PUNCTUATION', ')', "Expected ')' after nested expression")
      return expr
    }

    throw new Error(`Parse Error at line ${current.line}:${current.column} - Unexpected token '${current.value}'`)
  }
}
