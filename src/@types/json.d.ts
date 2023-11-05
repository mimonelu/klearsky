interface TTLabelBehavior {
  oldGroup: string
  group: string
  configurable: boolean
  warn: TTLabelOnWarn
  selectable?: boolean
}

declare module "@/consts/label_behaviors.json" {
  const data: {
    [k: string]: TTLabelBehavior
  };
  export default data;
}
