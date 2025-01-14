const DatabaseObject = require("./DatabaseObject");

const EntityTranslations = {
  ARC: "AcDbCircle",
  CIRCLE: "AcDbCircle",
  "3DFACE": "AcDbFace",
  ELLIPSE: "AcDbEllipse",
  LINE: "AcDbLine",
  POINT: "AcDbPoint",
  LWPOLYLINE: "AcDbPolyline",
  POLYLINE: "AcDbPolyline3D",
  SPLINE: "AcDbSpline",
  TEXT: "AcDbText",
  BLOCK: "AcDbBlockBegin",
  ENDBLK: "AcDbBlockEnd",
  INSERT: "AcDbBlockReference",
};

class BaseEntity extends DatabaseObject {
  constructor(type) {
    if (!EntityTranslations[type]) {
      console.log("BaseEntity: no valid type is set", type);
    }

    super(["AcDbEntity", EntityTranslations[type]]);

    this.type = type;
    this.lineTypeName = null;
  }

  setLineType(lineTypeName) {
    this.lineTypeName = lineTypeName;
  }

  toDxfString() {
    let s = `0\n${this.type}\n`;
    s += super.toDxfString();
    if (this.lineTypeName) {
      s += `6\n${this.lineTypeName}\n`;
    }

    return s;
  }
}

module.exports = BaseEntity;
