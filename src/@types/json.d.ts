declare module "@/consts/label_behaviors.json" {
  const data: {
    [k: string]: {
      oldGroup: string
      group: string
      configurable: boolean
      warn: "null" | "blur" | "blur-media" | "alert"
      selectable?: boolean
    }
  };
  export default data;
}
