declare module "@/consts/label_behaviors.json" {
  const data: {
    [k: string]: {
      oldGroup: string
      group: string
      configurable: boolean
      warn: TTLabelOnWarn
      selectable?: boolean
    }
  };
  export default data;
}
