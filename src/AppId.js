const BaseTableRecord = require("./BaseTableRecord");

class AppId extends BaseTableRecord {
  constructor(name) {
    super("APPID", name);
  }

  toDxfString() {
    let s = super.toDxfString();

    /* No flags set */
    s += "70\n0\n";
    return s;
  }
}

module.exports = AppId