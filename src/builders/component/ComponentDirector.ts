import { AttributeToken } from '../../global';
import { ComponentBuilder } from './ComponentBuilders';

export default class ComponentDirector {
  private builder: ComponentBuilder;
  private attributesOrder: AttributeToken[];
  
  constructor(builder: ComponentBuilder, attributesOrder: AttributeToken[]) {
    this.builder = builder;
    this.attributesOrder = attributesOrder;
  }

  public build() {
    this.builder.createImports();
    this.attributesOrder.forEach(fct => {
      this.builder[fct]?.();
    });
    return this.builder
      .createClassComponent()
      .buildSourceScript();
  }

  public buildPropertiesFirst() {
    return this.builder
      .createImports()
      .createProperties()
      .createData()
      .createComputed()
      .createWatchers()
      .createMethods()
      .createLeft()
      .createClassComponent()
      .buildSourceScript();
  }

  public buildDataFirst() {
    return this.builder
      .createImports()
      .createData()
      .createProperties()
      .createComputed()
      .createWatchers()
      .createMethods()
      .createLeft()
      .createClassComponent()
      .buildSourceScript();
  }
}