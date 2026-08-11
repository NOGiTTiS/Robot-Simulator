export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'NUMBER'
  | 'STRING'
  | 'OPERATOR'
  | 'PUNCTUATION'
  | 'EOF'

export interface Token {
  type: TokenType
  value: string
  line: number
  column: number
}

export type ASTNode =
  | ProgramNode
  | FunctionDeclNode
  | VarDeclNode
  | BlockStatementNode
  | EmptyStatementNode
  | IfStatementNode
  | WhileStatementNode
  | ForStatementNode
  | ExpressionStatementNode
  | BinaryExpressionNode
  | UnaryExpressionNode
  | CallExpressionNode
  | MemberExpressionNode
  | AssignmentExpressionNode
  | IdentifierNode
  | LiteralNode
  | ReturnStatementNode
  | BreakStatementNode
  | ContinueStatementNode

export interface EmptyStatementNode {
  type: 'EmptyStatement'
}

export interface ProgramNode {
  type: 'Program'
  body: ASTNode[]
}

export interface FunctionDeclNode {
  type: 'FunctionDecl'
  returnType: string
  name: string
  params: { type: string; name: string }[]
  body: BlockStatementNode
}

export interface VarDeclNode {
  type: 'VarDecl'
  varType: string
  name: string
  initializer: ASTNode | null
}

export interface BlockStatementNode {
  type: 'BlockStatement'
  body: ASTNode[]
}

export interface IfStatementNode {
  type: 'IfStatement'
  test: ASTNode
  consequent: BlockStatementNode
  alternate: BlockStatementNode | IfStatementNode | null
}

export interface WhileStatementNode {
  type: 'WhileStatement'
  test: ASTNode
  body: BlockStatementNode
}

export interface ForStatementNode {
  type: 'ForStatement'
  init: ASTNode | null
  test: ASTNode | null
  update: ASTNode | null
  body: BlockStatementNode
}

export interface ExpressionStatementNode {
  type: 'ExpressionStatement'
  expression: ASTNode
}

export interface BinaryExpressionNode {
  type: 'BinaryExpression'
  operator: string
  left: ASTNode
  right: ASTNode
}

export interface UnaryExpressionNode {
  type: 'UnaryExpression'
  operator: string
  argument: ASTNode
  prefix: boolean
}

export interface CallExpressionNode {
  type: 'CallExpression'
  callee: ASTNode
  arguments: ASTNode[]
}

export interface MemberExpressionNode {
  type: 'MemberExpression'
  object: ASTNode
  property: string
}

export interface AssignmentExpressionNode {
  type: 'AssignmentExpression'
  operator: string
  left: IdentifierNode | MemberExpressionNode
  right: ASTNode
}

export interface IdentifierNode {
  type: 'Identifier'
  name: string
}

export interface LiteralNode {
  type: 'Literal'
  value: number | string | boolean
}

export interface ReturnStatementNode {
  type: 'ReturnStatement'
  argument: ASTNode | null
}

export interface BreakStatementNode {
  type: 'BreakStatement'
}

export interface ContinueStatementNode {
  type: 'ContinueStatement'
}
