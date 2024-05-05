interface TIMyLabeler {
  mainState: MainState
  findIndex (did: string): number
  subscribe (did: string)
  unsubscribe (did: string)
  getLabelers (): Array<{ did: string }>
  getLabelerDids (): string[]
  setAtprotoAcceptLabelers (): void
}
