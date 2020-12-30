import { SFCToken } from "../../global.js";
import { SfcBuilder } from "./SfcBuilders.js";

export default class SfcDirector {
  private builder: SfcBuilder;
  private order: SFCToken[];

  constructor(builder: SfcBuilder, order: SFCToken[]) {
    this.builder = builder;
    this.order = order
  }

  public build() {
    this.order.forEach(tag => {
      this.builder[tag]?.()
    })
  }

  public buildCustomBlockAtEnd(): void {
    this.builder.createTemplate();
    this.builder.createScript();
    this.builder.createStyles();
    this.builder.createCustomBlocks();
  }
}