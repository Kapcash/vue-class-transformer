import { SFCToken } from '../../global';
import { SfcBuilder } from './SfcBuilders';

export default class SfcDirector {
  private builder: SfcBuilder;
  private order: SFCToken[];

  constructor(builder: SfcBuilder, order: SFCToken[]) {
    this.builder = builder;
    this.order = order;
  }

  public build() {
    this.order.forEach(tag => {
      this.builder[tag]?.();
    });
  }

  public buildCustomBlockAtEnd() {
    this.builder.createTemplate();
    this.builder.createScript();
    this.builder.createStyles();
    this.builder.createCustomBlocks();
    return this.builder.sfc;
  }
}