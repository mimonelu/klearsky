class Logger {
  private prefix = "[klearsky]"

  log (...args: any[]) {
    console.log(this.prefix, ...args)
  }

  warn (...args: any[]) {
    console.warn(this.prefix, ...args)
  }

  error (...args: any[]) {
    console.error(this.prefix, ...args)
  }
}

const logger = new Logger()

window.$log = logger.log.bind(logger)
window.$warn = logger.warn.bind(logger)
window.$error = logger.error.bind(logger)

export default logger
