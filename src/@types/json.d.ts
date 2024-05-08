interface TTLabelBehavior {
  oldGroup: string
  group: string
  configurable: boolean
  warn: TTLabelOnWarn
  selectable?: boolean
}

declare module "@/consts/label-behaviors.json" {
  const data: {
    [k: string]: TTLabelBehavior
  };
  export default data;
}
