class Logger {
  private formatArgs (args: any[]): any[] {
    if (
      args.length > 0 &&
      typeof args[0] === "string"
    ) {
      return [
        `%c[⭐️Klearsky]%c ${args[0]}`,
        "color: inherit", "color: #0080ff; font-weight: bold",
        ...args.slice(1),
      ]
    }
    return [
      "[⭐️Klearsky]",
      ...args,
    ]
  }

  log (...args: any[]) {
    console.log(...this.formatArgs(args))
  }

  warn (...args: any[]) {
    console.warn(...this.formatArgs(args))
  }

  error (...args: any[]) {
    console.error(...this.formatArgs(args))
  }
}

const logger = new Logger()
window.$log = logger.log.bind(logger)
window.$warn = logger.warn.bind(logger)
window.$error = logger.error.bind(logger)

export default logger
