const BaseTableRecord = require("./BaseTableRecord");

class TextStyle extends BaseTableRecord {
  constructor(name) {
    super("STYLE", name);
  }

  toDxfString() {
    let s = super.toDxfString();
    /* No flags set */
    s += "70\n0\n";
    s += "40\n0\n";
    s += "41\n1\n";
    s += "50\n0\n";
    s += "71\n0\n";
    s += "42\n1\n";
    s += `3\n${this.name}\n`;
    s += "4\n\n";
    return s;
  }
}

module.exports = TextStyle;
