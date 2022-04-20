const BaseTableRecord = require("./BaseTableRecord");

class Viewport extends BaseTableRecord {
  constructor(name, height) {
    super("VPORT", name);

    this.height = height;
  }

  toDxfString() {
    let s = super.toDxfString();

    s += `40\n${this.height}\n`;
    
    /* No flags set */
    s += "70\n0\n";
    return s;
  }
}

module.exports = Viewport;
