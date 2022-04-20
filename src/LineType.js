const BaseTableRecord = require("./BaseTableRecord");

class LineType extends BaseTableRecord {
  /**
   * @param {string} name
   * @param {string} description
   * @param {array} elements - if elem > 0 it is a line, if elem < 0 it is gap, if elem == 0.0 it is a
   */
  constructor(name, description, elements) {
    super("LTYPE", name);

    this.description = description;
    this.elements = elements;
  }

  /**
   * @link https://www.autodesk.com/techpubs/autocad/acadr14/dxf/ltype_al_u05_c.htm
   */
  toDxfString() {
    let s = super.toDxfString();

    s += `3\n${this.description}\n`;
    s += "70\n0\n";
    s += "72\n65\n";
    s += `73\n${this.elements.length}\n`;
    s += `40\n${this.getElementsSum()}\n`;
    for (const element of this.elements) {
      s += `49\n${element}\n`;
      /* Complex linetype element type, mandatory for AutoCAD */
      s += "74\n0\n";
    }

    return s;
  }

  getElementsSum() {
    let sum = 0;
    for (let i = 0; i < this.elements.length; ++i) {
      sum += Math.abs(this.elements[i]);
    }

    return sum;
  }
}

module.exports = LineType;
