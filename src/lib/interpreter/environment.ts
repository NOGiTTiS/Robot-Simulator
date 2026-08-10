export class Environment {
  private variables: Map<string, any> = new Map()
  private parent: Environment | null = null

  constructor(parent: Environment | null = null) {
    this.parent = parent
  }

  public define(name: string, value: any): void {
    this.variables.set(name, value)
  }

  public get(name: string): any {
    if (this.variables.has(name)) {
      return this.variables.get(name)
    }
    if (this.parent) {
      return this.parent.get(name)
    }
    return undefined
  }

  public set(name: string, value: any): boolean {
    if (this.variables.has(name)) {
      this.variables.set(name, value)
      return true
    }
    if (this.parent) {
      return this.parent.set(name, value)
    }
    // Auto-declare if setting unknown var at top scope
    this.variables.set(name, value)
    return true
  }

  public createChild(): Environment {
    return new Environment(this)
  }
}
