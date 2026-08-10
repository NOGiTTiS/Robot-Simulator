import { Token, TokenType } from './ast'

const KEYWORDS = new Set([
  'void', 'int', 'float', 'double', 'char', 'bool', 'boolean', 'long', 'short',
  'unsigned', 'signed', 'const', 'String', 'uint8_t', 'int8_t', 'uint16_t',
  'int16_t', 'uint32_t', 'int32_t', 'if', 'else', 'while', 'for', 'do',
  'return', 'break', 'continue', 'true', 'false', 'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP'
])

export class Lexer {
  private input: string
  private pos: number = 0
  private line: number = 1
  private column: number = 1

  constructor(input: string) {
    this.input = input
  }

  public tokenize(): Token[] {
    const tokens: Token[] = []

    while (this.pos < this.input.length) {
      const char = this.input[this.pos]

      // Whitespace
      if (char === ' ' || char === '\t' || char === '\r') {
        this.advance()
        continue
      }

      if (char === '\n') {
        this.line++
        this.column = 1
        this.pos++
        continue
      }

      // Preprocessor directive (e.g. #include <ATOM_VX.h>, #define MAX 100)
      if (char === '#') {
        this.skipLine()
        continue
      }

      // Comments
      if (char === '/' && this.peek() === '/') {
        this.skipLine()
        continue
      }

      if (char === '/' && this.peek() === '*') {
        this.skipBlockComment()
        continue
      }

      // Numbers (decimal, float, hex)
      if (this.isDigit(char) || (char === '.' && this.isDigit(this.peek()))) {
        tokens.push(this.readNumber())
        continue
      }

      // Identifiers and Keywords
      if (this.isAlpha(char) || char === '_') {
        tokens.push(this.readIdentifier())
        continue
      }

      // Strings ("..." or '...')
      if (char === '"' || char === "'") {
        tokens.push(this.readString(char))
        continue
      }

      // Multi-character operators
      const twoChar = char + this.peek()
      if (['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-='].includes(twoChar)) {
        tokens.push({
          type: 'OPERATOR',
          value: twoChar,
          line: this.line,
          column: this.column
        })
        this.advance(2)
        continue
      }

      // Single-character operators & punctuation
      if (['+', '-', '*', '/', '%', '=', '!', '<', '>'].includes(char)) {
        tokens.push({
          type: 'OPERATOR',
          value: char,
          line: this.line,
          column: this.column
        })
        this.advance()
        continue
      }

      if (['(', ')', '{', '}', '[', ']', ';', ',', '.', ':'].includes(char)) {
        tokens.push({
          type: 'PUNCTUATION',
          value: char,
          line: this.line,
          column: this.column
        })
        this.advance()
        continue
      }

      // Unknown character - skip
      this.advance()
    }

    tokens.push({
      type: 'EOF',
      value: '',
      line: this.line,
      column: this.column
    })

    return tokens
  }

  private advance(count: number = 1) {
    this.pos += count
    this.column += count
  }

  private peek(): string {
    return this.input[this.pos + 1] || ''
  }

  private skipLine() {
    while (this.pos < this.input.length && this.input[this.pos] !== '\n') {
      this.pos++
    }
  }

  private skipBlockComment() {
    this.advance(2)
    while (this.pos < this.input.length) {
      if (this.input[this.pos] === '\n') {
        this.line++
        this.column = 1
        this.pos++
      } else if (this.input[this.pos] === '*' && this.peek() === '/') {
        this.advance(2)
        break
      } else {
        this.advance()
      }
    }
  }

  private isDigit(ch: string): boolean {
    return ch >= '0' && ch <= '9'
  }

  private isAlpha(ch: string): boolean {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')
  }

  private readNumber(): Token {
    const startCol = this.column
    let numStr = ''
    let isFloat = false

    if (this.input[this.pos] === '0' && (this.peek() === 'x' || this.peek() === 'X')) {
      numStr += this.input[this.pos] + this.input[this.pos + 1]
      this.advance(2)
      while (this.pos < this.input.length && /[0-9a-fA-F]/.test(this.input[this.pos])) {
        numStr += this.input[this.pos]
        this.advance()
      }
      return {
        type: 'NUMBER',
        value: parseInt(numStr, 16).toString(),
        line: this.line,
        column: startCol
      }
    }

    while (this.pos < this.input.length) {
      const ch = this.input[this.pos]
      if (this.isDigit(ch)) {
        numStr += ch
        this.advance()
      } else if (ch === '.' && !isFloat && this.isDigit(this.peek())) {
        isFloat = true
        numStr += ch
        this.advance()
      } else {
        break
      }
    }

    return {
      type: 'NUMBER',
      value: numStr,
      line: this.line,
      column: startCol
    }
  }

  private readIdentifier(): Token {
    const startCol = this.column
    let id = ''

    while (this.pos < this.input.length) {
      const ch = this.input[this.pos]
      if (this.isAlpha(ch) || this.isDigit(ch) || ch === '_') {
        id += ch
        this.advance()
      } else {
        break
      }
    }

    const type: TokenType = KEYWORDS.has(id) ? 'KEYWORD' : 'IDENTIFIER'
    return {
      type,
      value: id,
      line: this.line,
      column: startCol
    }
  }

  private readString(quote: string): Token {
    const startCol = this.column
    this.advance() // Skip opening quote
    let str = ''

    while (this.pos < this.input.length) {
      const ch = this.input[this.pos]
      if (ch === quote) {
        this.advance() // Skip closing quote
        break
      }
      if (ch === '\\') {
        this.advance()
        const next = this.input[this.pos]
        if (next === 'n') str += '\n'
        else if (next === 't') str += '\t'
        else str += next
        this.advance()
      } else {
        str += ch
        this.advance()
      }
    }

    return {
      type: 'STRING',
      value: str,
      line: this.line,
      column: startCol
    }
  }
}
