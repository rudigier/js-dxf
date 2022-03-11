require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const DatabaseObject = require('./DatabaseObject');


class AppId extends DatabaseObject {
    constructor(name) {
        super(["AcDbSymbolTableRecord", "AcDbRegAppTableRecord"])
        this.name = name
    }

    toDxfString()
    {
        let s = "0\nAPPID\n"
        s += super.toDxfString()
        s += `2\n${this.name}\n`
        /* No flags set */
        s += "70\n0\n"
        return s
    }
}

module.exports = AppId
},{"./DatabaseObject":9}],2:[function(require,module,exports){
const BaseEntity = require('./BaseEntity')


class Arc extends BaseEntity
{
    /**
     * @param {number} x1 - Center x
     * @param {number} y1 - Center y
     * @param {number} r - radius
     * @param {number} startAngle - degree 
     * @param {number} endAngle - degree 
     */
    constructor(x1, y1, r, startAngle, endAngle)
    {
        super("ARC")
        this.x1 = x1;
        this.y1 = y1;
        this.r = r;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
    }

    toDxfString()
    {
        //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/line_al_u05_c.htm
        let s = super.toDxfString();

        s += `10\n${this.x1}\n20\n${this.y1}\n30\n0\n`;
        s += `40\n${this.r}\n`;
        s += `100\nAcDbArc\n`;
        s += `50\n${this.startAngle}\n51\n${this.endAngle}\n`;
        return s;
    }
}

module.exports = Arc;
},{"./BaseEntity":3}],3:[function(require,module,exports){
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
    if (this.layer?.name) {
      s += `8\n${this.layer.name}\n`;
    }
    if (this.lineTypeName) {
      s += `6\n${this.lineTypeName}\n`;
    }

    return s;
  }
}

module.exports = BaseEntity;

},{"./DatabaseObject":9}],4:[function(require,module,exports){
const DatabaseObject = require('./DatabaseObject')

const EntityTranslations = {
    'LAYER': 'AcDbLayerTableRecord',
    'BLOCK_RECORD': 'AcDbBlockTableRecord'
}


class BaseTableRecord extends DatabaseObject {
    constructor(type, name) {
        if(!EntityTranslations[type]) {
            console.log("BaseTableRecord: no valid type is set", type)
        }

        super(["AcDbSymbolTableRecord", EntityTranslations[type]])

        this.type = type
        this.name = name
    }

    toDxfString() {
        let s = `0\n${this.type}\n`
        s += super.toDxfString()
        s += `2\n${this.name}\n`;
        
        return s
    }
}

module.exports = BaseTableRecord;
},{"./DatabaseObject":9}],5:[function(require,module,exports){
const BaseEntity = require('./BaseEntity')

class Block extends BaseEntity {
    constructor(name)
    {
        super("BLOCK")
        this.name = name

        this.end = new BaseEntity("ENDBLK")

        this.shapes = []
    }

    /* Internal method to set handle value for block end separator entity. */
    setEndHandle(handle) {
        this.end.handle = handle
    }
    setOwner(item) {
        // super.setOwner.apply(this, item)
        this.owner = item
        this.end.setOwner(item)
    }


    addShape(shape)
    {
        this.shapes.push(shape)
        shape.block = this
    }

    toDxfString()
    {
        let s = super.toDxfString()
        s += `2\n${this.name}\n`

        /* No flags set */
        s += "70\n0\n"
        /* Block top left corner */
        s += "10\n0\n"
        s += "20\n0\n"
        s += "30\n0\n"
        s += `3\n${this.name}\n`
        /* xref path name - nothing */
        s += "1\n\n"

        s += this.shapesToDxf()

        s += this.end.toDxfString()
        return s
    }
    shapesToDxf()
    {
        let s = '';
        for (let i = 0; i < this.shapes.length; ++i)
        {
            s += this.shapes[i].toDxfString();
        } 
        
        return s;
    }
}

module.exports = Block
},{"./BaseEntity":3}],6:[function(require,module,exports){
const BaseTableRecord = require('./BaseTableRecord')

class BlockRecord extends BaseTableRecord {
    constructor(name) {
        super("BLOCK_RECORD", name)
    }

    toDxfString()
    {
        let s = super.toDxfString()
        /* No flags set */
        s += "70\n0\n"
        /* Block explodability */
        s += "280\n1\n"
        /* Block scalability */
        s += "281\n0\n";
        return s
    }
}

module.exports = BlockRecord
},{"./BaseTableRecord":4}],7:[function(require,module,exports){
const BaseEntity = require('./BaseEntity')

class BlockRecord extends BaseEntity {
    constructor(name) {
        super("INSERT")
        this.name = name
    }

    toDxfString()
    {
        let s = super.toDxfString()
     
        s += `2\n${this.name}\n`
        
        /* Block top left corner */
        s += "10\n0\n"
        s += "20\n0\n"
        s += "30\n0\n"
     
        return s
    }
}

module.exports = BlockRecord
},{"./BaseEntity":3}],8:[function(require,module,exports){
const BaseEntity = require('./BaseEntity')

class Circle extends BaseEntity
{
    /**
     * @param {number} x1 - Center x
     * @param {number} y1 - Center y
     * @param {number} r - radius
     */
    constructor(x1, y1, r)
    {
        super("CIRCLE")
        this.x1 = x1;
        this.y1 = y1;
        this.r = r;
    }

    toDxfString()
    {
        //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/circle_al_u05_c.htm
        let s = super.toDxfString()

        s += `10\n${this.x1}\n20\n${this.y1}\n30\n0\n`;
        s += `40\n${this.r}\n`;
        return s;
    }
}

module.exports = Circle;
},{"./BaseEntity":3}],9:[function(require,module,exports){
class DatabaseObject {
    constructor(subclass = null)
    {
        /* Handle should be assigned externally by document instance */
        this.handle = null
        this.layer = null
        this.block = null
        this.owner = null
        this.subclassMarkers = []
        if (subclass) {
            if (Array.isArray(subclass)) {
                for (const sc of subclass) {
                    this.subclassMarkers.push(sc)
                }
            } else {
                this.subclassMarkers.push(subclass)
            }
        }
    }

    /* Internal method to set handle value for block record in block records table. */
    setOwner(owner) {
        this.owner = owner
    }

    toDxfString()
    {
        let s = ""
        if (this.handle) {
            s += `5\n${this.handle.toString(16)}\n`
        } else {
            console.warn("No handle assigned to entity", this)
        }
        if (this.owner && this.owner.handle) {
            s += `330\n${this.owner.handle.toString(16)}\n`
        }
        for (const marker of this.subclassMarkers) {
            s += `100\n${marker}\n`
        }
        return s
    }
}

module.exports = DatabaseObject
},{}],10:[function(require,module,exports){
const DatabaseObject = require('./DatabaseObject')


class Dictionary extends DatabaseObject {
    constructor()
    {
        super("AcDbDictionary")
        this.children = {}
    }

    addChildDictionary(name, dictionary) {
        dictionary.setOwner(this)
        this.children[name] = dictionary
    }

    toDxfString()
    {
        let s = "0\nDICTIONARY\n"
        s += super.toDxfString()
        /* Duplicate record cloning flag - keep existing */
        s += "281\n1\n"
        for (const [name, item] of Object.entries(this.children)) {
            s += `3\n${name}\n`
            s += `350\n${item.handle.toString(16)}\n`
        }
        for (const item of Object.values(this.children)) {
            s += item.toDxfString()
        }
        return s
    }
}

module.exports = Dictionary
},{"./DatabaseObject":9}],11:[function(require,module,exports){
const DatabaseObject = require('./DatabaseObject')
const Table = require('./Table')


class DimStyleTable extends Table {
    constructor(name) {
        super(name)
        this.subclassMarkers.push("AcDbDimStyleTable")
    }

    toDxfString()
    {
        let s = "0\nTABLE\n"
        s += `2\n${this.name}\n`
        s += DatabaseObject.prototype.toDxfString.call(this)
        s += `70\n${this.elements.length}\n`
        /* DIMTOL */
        s += "71\n1\n"
        for (const element of this.elements) {
            s += element.toDxfString()
        }
        s += "0\nENDTAB\n"
        return s
    }
}

module.exports = DimStyleTable
},{"./DatabaseObject":9,"./Table":22}],12:[function(require,module,exports){
const BaseEntity = require('./BaseEntity')


class Ellipse extends BaseEntity {
    /**
     * Creates an ellipse.
     * @param {number} x1 - Center x
     * @param {number} y1 - Center y
     * @param {number} majorAxisX - Endpoint x of major axis, relative to center
     * @param {number} majorAxisY - Endpoint y of major axis, relative to center
     * @param {number} axisRatio - Ratio of minor axis to major axis
     * @param {number} startAngle - Start angle
     * @param {number} endAngle - End angle
     */
    constructor(x1, y1, majorAxisX, majorAxisY, axisRatio, startAngle, endAngle) {
        super("ELLIPSE")
        this.x1 = x1;
        this.y1 = y1;
        this.majorAxisX = majorAxisX;
        this.majorAxisY = majorAxisY;
        this.axisRatio = axisRatio;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
    }

    toDxfString() {
        // https://www.autodesk.com/techpubs/autocad/acadr14/dxf/ellipse_al_u05_c.htm
        let s = super.toDxfString();

        s += `10\n${this.x1}\n`;
        s += `20\n${this.y1}\n`;
        s += `30\n0\n`;
        s += `11\n${this.majorAxisX}\n`;
        s += `21\n${this.majorAxisY}\n`;
        s += `31\n0\n`;
        s += `40\n${this.axisRatio}\n`;
        s += `41\n${this.startAngle}\n`;
        s += `42\n${this.endAngle}\n`;
        return s;
    }
}

module.exports = Ellipse;
},{"./BaseEntity":3}],13:[function(require,module,exports){
const BaseEntity = require('./BaseEntity')


class Face extends BaseEntity
{
    constructor(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4)
    {
        super("3DFACE")
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
        this.x2 = x2;
        this.y2 = y2;
        this.z2 = z2;
        this.x3 = x3;
        this.y3 = y3;
        this.z3 = z3;
        this.x4 = x4;
        this.y4 = y4;
        this.z4 = z4;
    }

    toDxfString()
    {
        //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/3dface_al_u05_c.htm
        let s = super.toDxfString();
        
        s += `10\n${this.x1}\n20\n${this.y1}\n30\n${this.z1}\n`;
        s += `11\n${this.x2}\n21\n${this.y2}\n31\n${this.z2}\n`;
        s += `12\n${this.x3}\n22\n${this.y3}\n32\n${this.z3}\n`;
        s += `13\n${this.x4}\n23\n${this.y4}\n33\n${this.z4}\n`;
        return s;
    }
}

module.exports = Face;
},{"./BaseEntity":3}],14:[function(require,module,exports){
const BaseTableRecord = require('./BaseTableRecord')

class Layer extends BaseTableRecord {
    constructor(name, colorNumber) {
        super("LAYER", name);
        this.colorNumber = colorNumber;
        this.lineTypeName = null;
        this.shapes = [];
        this.trueColor = -1;
    }

    setLineType(lineTypeName) {
        this.lineTypeName = lineTypeName;
    }

    toDxfString() {
        let s = super.toDxfString();

        if (this.trueColor !== -1) {
            s += `420\n${this.trueColor}\n`;
        } else {
            s += `62\n${this.colorNumber}\n`;
        }
        s += "70\n0\n";
        if (this.lineTypeName) {
            s += `6\n${this.lineTypeName}\n`;
        }
        if (this.name.toLowerCase() === "defpoints") {
            s += `290\n0\n`;
        }
        /* Hard-pointer handle to PlotStyleName object; seems mandatory, but any value seems OK,
            * including 0.
            */
        s += "390\n1\n";
        return s;
    }

    setTrueColor(color) {
        this.trueColor = color;
    }

    addShape(shape) {
        this.shapes.push(shape);
        shape.layer = this;
    }

    getShapes() {
        return this.shapes;
    }
}

module.exports = Layer;
},{"./BaseTableRecord":4}],15:[function(require,module,exports){
const BaseEntity = require('./BaseEntity')


class Line extends BaseEntity
{
    constructor(x1, y1, x2, y2)
    {
        super("LINE")
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    toDxfString()
    {
        //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/line_al_u05_c.htm
        let s = super.toDxfString();
        
        s += `10\n${this.x1}\n20\n${this.y1}\n30\n0\n`;
        s += `11\n${this.x2}\n21\n${this.y2}\n31\n0\n`;
        return s;
    }
}

module.exports = Line;
},{"./BaseEntity":3}],16:[function(require,module,exports){
const BaseEntity = require('./BaseEntity')


class Line3d extends BaseEntity
{
    constructor(x1, y1, z1, x2, y2, z2)
    {
        super("LINE");
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
        this.x2 = x2;
        this.y2 = y2;
        this.z2 = z2;
    }

    toDxfString()
    {
        //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/line_al_u05_c.htm
        let s = super.toDxfString();

        s += `10\n${this.x1}\n20\n${this.y1}\n30\n${this.z1}\n`;
        s += `11\n${this.x2}\n21\n${this.y2}\n31\n${this.z2}\n`;
        return s;
    }
}

module.exports = Line3d;
},{"./BaseEntity":3}],17:[function(require,module,exports){
const DatabaseObject = require('./DatabaseObject')


class LineType extends DatabaseObject
{
    /**
     * @param {string} name
     * @param {string} description
     * @param {array} elements - if elem > 0 it is a line, if elem < 0 it is gap, if elem == 0.0 it is a 
     */
    constructor(name, description, elements)
    {
        super(["AcDbSymbolTableRecord", "AcDbLinetypeTableRecord"])
        this.name = name;
        this.description = description;
        this.elements = elements;
    }

    /**
     * @link https://www.autodesk.com/techpubs/autocad/acadr14/dxf/ltype_al_u05_c.htm
     */
    toDxfString()
    {
        let s = '0\nLTYPE\n';
        s += super.toDxfString()
        s += `2\n${this.name}\n`;
        s += `3\n${this.description}\n`;
        s += '70\n0\n';
        s += '72\n65\n';
        s += `73\n${this.elements.length}\n`;
        s += `40\n${this.getElementsSum()}\n`;
        for (const element of this.elements)
        {
            s += `49\n${element}\n`;
            /* Complex linetype element type, mandatory for AutoCAD */
            s += '74\n0\n';
        }

        return s;
    }

    getElementsSum()
    {
        let sum = 0;
        for (let i = 0; i < this.elements.length; ++i)
        {
            sum += Math.abs(this.elements[i]);
        }

        return sum;
    }
}

module.exports = LineType;
},{"./DatabaseObject":9}],18:[function(require,module,exports){
const BaseEntity = require('./BaseEntity')


class Point extends BaseEntity
{
    constructor(x, y)
    {
        super("POINT")
        this.x = x;
        this.y = y;
    }

    toDxfString()
    {
        //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/point_al_u05_c.htm
        let s = super.toDxfString()

        s += `10\n${this.x}\n20\n${this.y}\n30\n0\n`;
        return s;
    }
}

module.exports = Point;
},{"./BaseEntity":3}],19:[function(require,module,exports){
const BaseEntity = require('./BaseEntity')


class Polyline extends BaseEntity
{
    /**
     * @param {array} points - Array of points like [ [x1, y1], [x2, y2, bulge]... ]
     * @param {boolean} closed
     * @param {number} startWidth
     * @param {number} endWidth
     */
    constructor(points, closed = false, startWidth = 0, endWidth = 0)
    {
        super("LWPOLYLINE")
        this.points = points;
        this.closed = closed;
        this.startWidth = startWidth;
        this.endWidth = endWidth;
    }

    toDxfString()
    {
        let s = super.toDxfString()

        s += "62\n256\n"
        s += "370\n-1\n"
        s += `90\n${this.points.length}\n`;
        s += `70\n${this.closed ? 1 : 0}\n`;

        if(this.startWidth === this.endWidth && this.startWidth > 0) {
            s += `43\n${this.startWidth}\n`;
        }

        for (const p of this.points) {
            s += `10\n${p[0]}\n20\n${p[1]}\n`;
            if (this.startWidth !== 0 || this.endWidth !== 0) {
                s += `40\n${this.startWidth}\n41\n${this.endWidth}\n`;
            }
            if (p[2] !== undefined) {
                s += `42\n${p[2]}\n`;
            }
        }

        return s;
    }
}

module.exports = Polyline;
},{"./BaseEntity":3}],20:[function(require,module,exports){
const BaseEntity = require('./BaseEntity')


class Polyline3d extends BaseEntity
{
    /**
     * @param {array} points - Array of points like [ [x1, y1, z1], [x2, y2, z2]... ]
     */
    constructor(points)
    {
        super("POLYLINE")
        this.points = points;
        this.pointHandles = null;
    }

    assignVertexHandles(handleProvider) {
        this.pointHandles = this.points.map(() => handleProvider())
    }

    toDxfString()
    {
        //https://www.autodesk.com/techpubs/autocad/acad2000/dxf/polyline_dxf_06.htm
        //https://www.autodesk.com/techpubs/autocad/acad2000/dxf/vertex_dxf_06.htm
        let s = super.toDxfString()
        
        s += `66\n1\n70\n8\n`;

        for (let i = 0; i < this.points.length; ++i) {
            s += `0\nVERTEX\n`;
            s += "100\nAcDbEntity\n";
            s += "100\nAcDbVertex\n";
            s += `5\n${this.pointHandles[i].toString(16)}\n`;
            s += `8\n${this.layer.name}\n`;
            s += `70\n0\n`;
            s += `10\n${this.points[i][0]}\n20\n${this.points[i][1]}\n30\n${this.points[i][2]}\n`;
        }
        
        s += `0\nSEQEND\n`;
        return s;
    }
}

module.exports = Polyline3d;
},{"./BaseEntity":3}],21:[function(require,module,exports){
const BaseEntity = require('./BaseEntity')


class Spline extends BaseEntity
{
    /**
     * Creates a spline. See https://www.autodesk.com/techpubs/autocad/acad2000/dxf/spline_dxf_06.htm
     * @param {[Array]} controlPoints - Array of control points like [ [x1, y1], [x2, y2]... ]
     * @param {number} degree - Degree of spline: 2 for quadratic, 3 for cubic. Default is 3
     * @param {[number]} knots - Knot vector array. If null, will use a uniform knot vector. Default is null
     * @param {[number]} weights - Control point weights. If provided, must be one weight for each control point. Default is null
     * @param {[Array]} fitPoints - Array of fit points like [ [x1, y1], [x2, y2]... ]
     */
    constructor(controlPoints, degree = 3, knots = null, weights = null, fitPoints = [])
    {
        super("SPLINE")
        if (controlPoints.length < degree + 1) {
            throw new Error(`For degree ${degree} spline, expected at least ${degree + 1} control points, but received only ${controlPoints.length}`);
        }

        if (knots == null) {
            // Examples:
            // degree 2, 3 pts:  0 0 0 1 1 1
            // degree 2, 4 pts:  0 0 0 1 2 2 2
            // degree 2, 5 pts:  0 0 0 1 2 3 3 3
            // degree 3, 4 pts:  0 0 0 0 1 1 1 1
            // degree 3, 5 pts:  0 0 0 0 1 2 2 2 2

            knots = [];
            for (let i = 0; i < degree + 1; i++) {
                knots.push(0);
            }
            for (let i = 1; i < controlPoints.length - degree; i++) {
                knots.push(i);
            }
            for (let i = 0; i < degree + 1; i++) {
                knots.push(controlPoints.length - degree);
            }
        }

        if (knots.length !== controlPoints.length + degree + 1) {
            throw new Error(`Invalid knot vector length. Expected ${controlPoints.length + degree + 1} but received ${knots.length}.`);
        }

        this.controlPoints = controlPoints;
        this.knots = knots;
        this.fitPoints = fitPoints;
        this.degree = degree;
        this.weights = weights;

        const closed = 0;
        const periodic = 0;
        const rational = this.weights ? 1 : 0;
        const planar = 1;
        const linear = 0;

        this.type =
            closed * 1 +
            periodic * 2 +
            rational * 4 +
            planar * 8 +
            linear * 16;

        // Not certain where the values of these flags came from so I'm going to leave them commented for now
        // const closed = 0
        // const periodic = 0
        // const rational = 1
        // const planar = 1
        // const linear = 0
        // const splineType = 1024 * closed + 128 * periodic + 8 * rational + 4 * planar + 2 * linear

    }

    toDxfString() {
        // https://www.autodesk.com/techpubs/autocad/acad2000/dxf/spline_dxf_06.htm
        let s = super.toDxfString()
       
        s += `210\n0.0\n220\n0.0\n230\n1.0\n`;

        s += `70\n${this.type}\n`;
        s += `71\n${this.degree}\n`;
        s += `72\n${this.knots.length}\n`;
        s += `73\n${this.controlPoints.length}\n`;
        s += `74\n${this.fitPoints.length}\n`;
        s += `42\n1e-7\n`;
        s += `43\n1e-7\n`;
        s += `44\n1e-10\n`;

        for (let i = 0; i < this.knots.length; ++i) {
            s += `40\n${this.knots[i]}\n`;
        }

        if (this.weights) {
            for (let i = 0; i < this.knots.length; ++i) {
                s += `41\n${this.weights[i]}\n`;
            }
        }

        for (let i = 0; i < this.controlPoints.length; ++i) {
            s += `10\n${this.controlPoints[i][0]}\n`;
            s += `20\n${this.controlPoints[i][1]}\n`;
            s += `30\n0\n`;
        }

        return s;
    }
}

module.exports = Spline

},{"./BaseEntity":3}],22:[function(require,module,exports){
const DatabaseObject = require('./DatabaseObject')


class Table extends DatabaseObject {
    constructor(name) {
        super("AcDbSymbolTable")
        this.name = name
        this.elements = []
    }

    add(element) {
        this.elements.push(element)
    }

    toDxfString()
    {
        let s = "0\nTABLE\n"
        s += `2\n${this.name}\n`
        s += super.toDxfString()
        s += `70\n${this.elements.length}\n`
        for (const element of this.elements) {
            s += element.toDxfString()
        }
        s += "0\nENDTAB\n"
        return s
    }
}

module.exports = Table
},{"./DatabaseObject":9}],23:[function(require,module,exports){
const BaseEntity = require('./BaseEntity')


const H_ALIGN_CODES = ['left', 'center', 'right'];
const V_ALIGN_CODES = ['baseline','bottom', 'middle', 'top'];

class Text extends BaseEntity
{
    /**
     * @param {number} x1 - x
     * @param {number} y1 - y
     * @param {number} height - Text height
     * @param {number} rotation - Text rotation
     * @param {string} value - the string itself
     * @param {string} [horizontalAlignment="left"] left | center | right
     * @param {string} [verticalAlignment="baseline"] baseline | bottom | middle | top
     */
    constructor(x1, y1, height, rotation, value, horizontalAlignment = 'left', verticalAlignment = 'baseline')
    {
        super("TEXT")
        this.x1 = x1;
        this.y1 = y1;
        this.height = height;
        this.rotation = rotation;
        this.value = value;
        this.hAlign = horizontalAlignment;
        this.vAlign = verticalAlignment;
    }

    toDxfString()
    {
        //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/text_al_u05_c.htm
        let s = super.toDxfString()
        
        s += `10\n${this.x1}\n20\n${this.y1}\n30\n0\n`;
        s += `40\n${this.height}\n`;
        s += `1\n${this.value}\n`;
        s += `50\n${this.rotation}\n`;
        if (H_ALIGN_CODES.includes(this.hAlign, 1) || V_ALIGN_CODES.includes(this.vAlign, 1)) {
            s += `72\n${Math.max(H_ALIGN_CODES.indexOf(this.hAlign), 0)}\n`;
            s += `11\n${this.x1}\n21\n${this.y1}\n31\n0\n`;
            /* AutoCAD needs this one more time, yes, exactly here. */
            s += "100\nAcDbText\n";
            s += `73\n${Math.max(V_ALIGN_CODES.indexOf(this.vAlign), 0)}\n`;
        } else {
            /* AutoCAD needs this one more time. */
            s += "100\nAcDbText\n";
        }
        return s;
    }
}

module.exports = Text;
},{"./BaseEntity":3}],24:[function(require,module,exports){
const DatabaseObject = require('./DatabaseObject')


class TextStyle extends DatabaseObject {
    constructor(name) {
        super(["AcDbSymbolTableRecord", "AcDbTextStyleTableRecord"])
        this.name = name
    }

    toDxfString()
    {
        let s = "0\nSTYLE\n"
        s += super.toDxfString()
        s += `2\n${this.name}\n`
        /* No flags set */
        s += "70\n0\n"
        s += "40\n0\n"
        s += "41\n1\n"
        s += "50\n0\n"
        s += "71\n0\n"
        s += "42\n1\n"
        s += `3\n${this.name}\n`
        s += "4\n\n"
        return s
    }
}

module.exports = TextStyle

},{"./DatabaseObject":9}],25:[function(require,module,exports){
const DatabaseObject = require('./DatabaseObject')


class Viewport extends DatabaseObject {
    constructor(name, height)
    {
        super(["AcDbSymbolTableRecord", "AcDbViewportTableRecord"])
        this.name = name
        this.height = height
    }

    toDxfString()
    {
        let s = "0\nVPORT\n"
        s += super.toDxfString()
        s += `2\n${this.name}\n`
        s += `40\n${this.height}\n`
        /* No flags set */
        s += "70\n0\n"
        return s
    }
}

module.exports = Viewport
},{"./DatabaseObject":9}],"Drawing":[function(require,module,exports){
const Block = require("./Block");
const BlockRecord = require("./BlockRecord");
const BlockReference = require("./BlockReference");
const LineType = require("./LineType");
const Layer = require("./Layer");
const Table = require("./Table");
const DimStyleTable = require("./DimStyleTable");
const TextStyle = require("./TextStyle");
const Viewport = require("./Viewport");
const AppId = require("./AppId");
const Dictionary = require("./Dictionary");
const Line = require("./Line");
const Line3d = require("./Line3d");
const Arc = require("./Arc");
const Circle = require("./Circle");
const Text = require("./Text");
const Polyline = require("./Polyline");
const Polyline3d = require("./Polyline3d");
const Face = require("./Face");
const Point = require("./Point");
const Spline = require("./Spline");
const Ellipse = require("./Ellipse");

class Drawing {
    constructor() {
        this.shapes = [];
        this.layers = {};
        this.activeLayer = null;
        this.activeBlock = null;
        this.lineTypes = {};
        this.headers = {};
        this.tables = {};
        this.blocks = {};
        this.handleCount = 0;

        this.ltypeTableHandle = this._generateHandle();
        this.layerTableHandle = this._generateHandle();
        this.blockRecordTableHandle = this._generateHandle();

        this.dictionary = new Dictionary();
        this._assignHandle(this.dictionary);

        this.setUnits("Unitless");

        for (const lineType of Drawing.LINE_TYPES) {
            this.addLineType(lineType.name, lineType.description, lineType.elements);
        }

        for (const layer of Drawing.LAYERS) {
            this.addLayer(layer.name, layer.colorNumber, layer.lineTypeName);
        }

        this.setActiveLayer("0");
    }

    /**
     * @param {string} name
     * @param {string} description
     * @param {array} elements - if elem > 0 it is a line, if elem < 0 it is gap, if elem == 0.0 it is a
     */
    addLineType(name, description, elements) {
        this.lineTypes[name] = this._assignHandle(
            new LineType(name, description, elements)
        );
        return this;
    }

    addLayer(name, colorNumber, lineTypeName) {
        this.layers[name] = this._assignHandle(
            new Layer(name, colorNumber, lineTypeName)
        );
        return this;
    }

    setActiveLayer(name) {
        this.activeLayer = this.layers[name];
        return this;
    }

    addTable(name) {
        const table = new Table(name);
        this._assignHandle(table);
        this.tables[name] = table;
        return table;
    }

    addBlock(name) {
        const block = new Block(name);
        this._assignHandle(block);
        block.setEndHandle(this._generateHandle());

        const record = new BlockRecord(name);
        this._assignHandle(record);
        block.setOwner(record);

        const reference = new BlockReference(name);
        this._assignHandle(reference);
        reference.setOwner(record);

        this.activeLayer && this.activeLayer.addShape(block);
        this.activeLayer && this.activeLayer.addShape(reference);

        block.reference = reference;
        block.record = record;
        this.blocks[name] = block;

        this.activeBlock = block;
        return block;
    }

    drawItem(shape) {
        this._assignHandle(shape);

        this.activeLayer && this.activeLayer.addShape(shape);
        this.activeBlock && this.activeBlock.addShape(shape);

        this.shapes.push(shape);

        return shape;
    }

    drawLine(x1, y1, x2, y2, lineTypeName) {
        let shape = new Line(x1, y1, x2, y2);
        shape.setLineType(lineTypeName);
        this.drawItem(shape);
        return this;
    }

    drawLine3d(x1, y1, z1, x2, y2, z2, lineTypeName) {
        let shape = new Line3d(x1, y1, z1, x2, y2, z2);
        shape.setLineType(lineTypeName);
        this.drawItem(shape);
        return this;
    }

    drawPoint(x, y, lineTypeName) {
        let shape = new Point(x, y);
        shape.setLineType(lineTypeName);
        this.drawItem(shape);
        return this;
    }

    drawRect(x1, y1, x2, y2, cornerLength, cornerBulge, lineTypeName) {
        const w = x2 - x1;
        const h = y2 - y1;
        cornerBulge = cornerBulge || 0;
        let shape = null;
        if (!cornerLength) {
            shape = new Polyline(
            [
                [x1, y1],
                [x1, y1 + h],
                [x1 + w, y1 + h],
                [x1 + w, y1],
            ],
            true,
            0,
            0
            );
        } else {
            shape = new Polyline(
            [
                [x1 + w - cornerLength, y1, cornerBulge], // 1
                [x1 + w, y1 + cornerLength], // 2
                [x1 + w, y1 + h - cornerLength, cornerBulge], // 3
                [x1 + w - cornerLength, y1 + h], // 4
                [x1 + cornerLength, y1 + h, cornerBulge], // 5
                [x1, y1 + h - cornerLength], // 6
                [x1, y1 + cornerLength, cornerBulge], // 7
                [x1 + cornerLength, y1], // 8
            ],
            true,
            0,
            0
            );
        }

        shape.setLineType(lineTypeName);
        this.drawItem(shape);
        return this;
    }

    /**
     * @param {number} x1 - Center x
     * @param {number} y1 - Center y
     * @param {number} r - radius
     * @param {number} startAngle - degree
     * @param {number} endAngle - degree
     * @param {[string]} lineTypeName - the name of the lineType
     */
    drawArc(x1, y1, r, startAngle, endAngle, lineTypeName) {
        let shape = new Arc(x1, y1, r, startAngle, endAngle);
        shape.setLineType(lineTypeName);
        this.drawItem(shape);
        return this;
    }

    /**
     * @param {number} x1 - Center x
     * @param {number} y1 - Center y
     * @param {number} r - radius
     * @param {[string]} lineTypeName - the name of the lineType
     */
    drawCircle(x1, y1, r, lineTypeName) {
        let shape = new Circle(x1, y1, r);
        shape.setLineType(lineTypeName);
        this.drawItem(shape);
        return this;
    }

    /**
     * @param {number} x1 - x
     * @param {number} y1 - y
     * @param {number} height - Text height
     * @param {number} rotation - Text rotation
     * @param {string} value - the string itself
     * @param {string} [horizontalAlignment="left"] left | center | right
     * @param {string} [verticalAlignment="baseline"] baseline | bottom | middle | top
     * @param {[string]} lineTypeName - the name of the lineType
     */
    drawText(
        x1,
        y1,
        height,
        rotation,
        value,
        horizontalAlignment = "left",
        verticalAlignment = "baseline",
        lineTypeName
    ) {
        let shape = new Text(
            x1,
            y1,
            height,
            rotation,
            value,
            horizontalAlignment,
            verticalAlignment
        );
        shape.setLineType(lineTypeName);
        this.drawItem(shape);

        return this;
    }

    /**
     * @param {array} points - Array of points like [ [x1, y1], [x2, y2]... ]
     * @param {boolean} closed - Closed polyline flag
     * @param {number} startWidth - Default start width
     * @param {number} endWidth - Default end width
     * @param {[string]} lineTypeName - the name of the lineType
     */
    drawPolyline(
        points,
        closed = false,
        startWidth = 0,
        endWidth = 0,
        lineTypeName
    ) {
        let shape = new Polyline(points, closed, startWidth, endWidth);
        shape.setLineType(lineTypeName);
        this.drawItem(shape);
        return this;
    }

    /**
     * @param {array} points - Array of points like [ [x1, y1, z1], [x2, y2, z1]... ]
     * @param {[string]} lineTypeName - the name of the lineType
     */
    drawPolyline3d(points, lineTypeName) {
        points.forEach((point) => {
            if (point.length !== 3) {
            throw "Require 3D coordinate";
            }
        });
        let shape = new Polyline3d(points);
        shape.assignVertexHandles(this._generateHandle.bind(this));
        shape.setLineType(lineTypeName);
        this.drawItem(shape);

        return this;
    }

    /**
     *
     * @param {number} trueColor - Integer representing the true color, can be passed as an hexadecimal value of the form 0xRRGGBB
     */
    setTrueColor(trueColor) {
        this.activeLayer.setTrueColor(trueColor);
        return this;
    }

    /**
     * Draw a spline.
     * @param {[Array]} controlPoints - Array of control points like [ [x1, y1], [x2, y2]... ]
     * @param {number} degree - Degree of spline: 2 for quadratic, 3 for cubic. Default is 3
     * @param {[number]} knots - Knot vector array. If null, will use a uniform knot vector. Default is null
     * @param {[number]} weights - Control point weights. If provided, must be one weight for each control point. Default is null
     * @param {[Array]} fitPoints - Array of fit points like [ [x1, y1], [x2, y2]... ]
     * @param {[string]} lineTypeName - the name of the lineType
     */
    drawSpline(
        controlPoints,
        degree = 3,
        knots = null,
        weights = null,
        fitPoints = [],
        lineTypeName
    ) {
        let shape = new Spline(controlPoints, degree, knots, weights, fitPoints);
        shape.setLineType(lineTypeName);
        this.drawItem(shape);

        return this;
    }

    /**
     * Draw an ellipse.
     * @param {number} x1 - Center x
     * @param {number} y1 - Center y
     * @param {number} majorAxisX - Endpoint x of major axis, relative to center
     * @param {number} majorAxisY - Endpoint y of major axis, relative to center
     * @param {number} axisRatio - Ratio of minor axis to major axis
     * @param {number} startAngle - Start angle
     * @param {number} endAngle - End angle
     * @param {[string]} lineTypeName - the name of the lineType
     */
    drawEllipse(
        x1,
        y1,
        majorAxisX,
        majorAxisY,
        axisRatio,
        startAngle = 0,
        endAngle = 2 * Math.PI,
        lineTypeName
    ) {
        let shape = new Ellipse(
            x1,
            y1,
            majorAxisX,
            majorAxisY,
            axisRatio,
            startAngle,
            endAngle
        );
        shape.setLineType(lineTypeName);
        this.drawItem(shape);

        return this;
    }

    /**
     * @param {number} x1 - x
     * @param {number} y1 - y
     * @param {number} z1 - z
     * @param {number} x2 - x
     * @param {number} y2 - y
     * @param {number} z2 - z
     * @param {number} x3 - x
     * @param {number} y3 - y
     * @param {number} z3 - z
     * @param {number} x4 - x
     * @param {number} y4 - y
     * @param {number} z4 - z
     * @param {[string]} lineTypeName - the name of the lineType
     */
    drawFace(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4, lineTypeName) {
        let shape = new Face(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4);
        shape.setLineType(lineTypeName);
        this.drawItem(shape);

        return this;
    }

    _generateHandle() {
        return ++this.handleCount;
    }

    _assignHandle(entity) {
        entity.handle = this._generateHandle();
        return entity;
    }

    _getDxfLtypeTable() {
        const t = new Table("LTYPE");
        t.handle = this.ltypeTableHandle;
        Object.values(this.lineTypes).forEach((v) => t.add(v));
        return t.toDxfString();
    }

    _getDxfLayerTable() {
        const t = new Table("LAYER");
        t.handle = this.layerTableHandle;
        Object.values(this.layers).forEach((v) => t.add(v));
        return t.toDxfString();
    }

    /**
     * @see https://www.autodesk.com/techpubs/autocad/acadr14/dxf/header_section_al_u05_c.htm
     * @see https://www.autodesk.com/techpubs/autocad/acad2000/dxf/header_section_group_codes_dxf_02.htm
     *
     * @param {string} variable
     * @param {array} values Array of "two elements arrays". [  [value1_GroupCode, value1_value], [value2_GroupCode, value2_value]  ]
     */
    header(variable, values) {
        this.headers[variable] = values;
        return this;
    }

    _getHeader(variable, values) {
        let s = "9\n$" + variable + "\n";

        for (let value of values) {
            s += `${value[0]}\n${value[1]}\n`;
        }

        return s;
    }

    /**
     *
     * @param {string} unit see Drawing.UNITS
     */
    setUnits(unit) {
        let value =
            typeof Drawing.UNITS[unit] != "undefined"
            ? Drawing.UNITS[unit]
            : Drawing.UNITS["Unitless"];
        this.header("INSUNITS", [[70, Drawing.UNITS[unit]]]);
        return this;
    }

    /** Generate additional DXF metadata which are required to successfully open resulted document
     * in AutoDesk products. Call this method before serializing the drawing to get the most
     * compatible result.
     */
    generateAutocadExtras() {
        if (!this.headers["ACADVER"]) {
            /* AutoCAD 2007 version. */
            this.header("ACADVER", [[1, "AC1021"]]);
        }

        if (!this.lineTypes["ByBlock"]) {
            this.addLineType("ByBlock", "", []);
        }
        if (!this.lineTypes["ByLayer"]) {
            this.addLineType("ByLayer", "", []);
        }

        let vpTable = this.tables["VPORT"];
        if (!vpTable) {
            vpTable = this.addTable("VPORT");
        }
        let styleTable = this.tables["STYLE"];
        if (!styleTable) {
            styleTable = this.addTable("STYLE");
        }
        if (!this.tables["VIEW"]) {
            this.addTable("VIEW");
        }
        if (!this.tables["UCS"]) {
            this.addTable("UCS");
        }
        let appIdTable = this.tables["APPID"];
        if (!appIdTable) {
            appIdTable = this.addTable("APPID");
        }
        if (!this.tables["DIMSTYLE"]) {
            const t = new DimStyleTable("DIMSTYLE");
            this._assignHandle(t);
            this.tables["DIMSTYLE"] = t;
        }

        vpTable.add(this._assignHandle(new Viewport("*ACTIVE", 1000)));

        /* Non-default text alignment is not applied without this entry. */
        styleTable.add(this._assignHandle(new TextStyle("standard")));

        appIdTable.add(this._assignHandle(new AppId("ACAD")));

        this.modelSpace = this.addBlock("*Model_Space");
        this.paperSpace = this.addBlock("*Paper_Space");

        const d = new Dictionary();
        this._assignHandle(d);
        this.dictionary.addChildDictionary("ACAD_GROUP", d);
    }

    toDxfString() {
        let s = "";

        //start section
        s += "0\nSECTION\n";
        //name section as HEADER section
        s += "2\nHEADER\n";
        s += this._getHeader("HANDSEED", [
            [5, this._generateHandle().toString(16)],
        ]);
        for (let header in this.headers) {
            s += this._getHeader(header, this.headers[header]);
        }

        //end section
        s += "0\nENDSEC\n";

        //start section
        s += "0\nSECTION\n";
        // Empty CLASSES section for compatibility
        s += "2\nCLASSES\n";
        //end section
        s += "0\nENDSEC\n";

        //start section
        s += "0\nSECTION\n";
        //name section as TABLES section
        s += "2\nTABLES\n";

        s += this._getDxfLtypeTable();
        s += this._getDxfLayerTable();

        for (const table of Object.values(this.tables)) {
            s += table.toDxfString();
        }

        let blockRecordTable = new Table("BLOCK_RECORD");
        blockRecordTable.handle = this.blockRecordTableHandle;
        Object.values(this.blocks).forEach((b) => {
            blockRecordTable.add(b.record);
            b.record.setOwner(blockRecordTable);
        });
        s += blockRecordTable.toDxfString();

        //end section
        s += "0\nENDSEC\n";

        //start section
        s += "0\nSECTION\n";
        //name section as BLOCKS section
        s += "2\nBLOCKS\n";

        for (const block of Object.values(this.blocks)) {
            s += block.toDxfString();
        }

        //end section
        s += "0\nENDSEC\n";

        //ENTITES section
        s += "0\nSECTION\n";
        s += "2\nENTITIES\n";
        for (const block of Object.values(this.blocks)) {
            s += block.reference.toDxfString();
        }
        for (let i = 0; i < this.shapes.length; ++i) {
            const shape = this.shapes[i];
            if (!shape.block) {
            s += shape.toDxfString();
            }
        }

        s += "0\nENDSEC\n";

        //OBJECTS section
        s += "0\nSECTION\n";
        s += "2\nOBJECTS\n";
        s += this.dictionary.toDxfString();
        s += "0\nENDSEC\n";

        //close file
        s += "0\nEOF\n";

        return s;
    }
}

//AutoCAD Color Index (ACI)
//http://sub-atomic.com/~moses/acadcolors.html
Drawing.ACI = {
    LAYER: 0,
    RED: 1,
    YELLOW: 2,
    GREEN: 3,
    CYAN: 4,
    BLUE: 5,
    MAGENTA: 6,
    WHITE: 7,
};

Drawing.LINE_TYPES = [
    { name: "CONTINUOUS", description: "______", elements: [] },
    { name: "DASHED", description: "_ _ _ ", elements: [5.0, -5.0] },
    { name: "DOTTED", description: ". . . ", elements: [0.0, -5.0] },
];

Drawing.LAYERS = [
    { name: "0", colorNumber: Drawing.ACI.WHITE, lineTypeName: "CONTINUOUS" },
];

//https://www.autodesk.com/techpubs/autocad/acad2000/dxf/header_section_group_codes_dxf_02.htm
Drawing.UNITS = {
    Unitless: 0,
    Inches: 1,
    Feet: 2,
    Miles: 3,
    Millimeters: 4,
    Centimeters: 5,
    Meters: 6,
    Kilometers: 7,
    Microinches: 8,
    Mils: 9,
    Yards: 10,
    Angstroms: 11,
    Nanometers: 12,
    Microns: 13,
    Decimeters: 14,
    Decameters: 15,
    Hectometers: 16,
    Gigameters: 17,
    "Astronomical units": 18,
    "Light years": 19,
    Parsecs: 20,
};

module.exports = Drawing;

},{"./AppId":1,"./Arc":2,"./Block":5,"./BlockRecord":6,"./BlockReference":7,"./Circle":8,"./Dictionary":10,"./DimStyleTable":11,"./Ellipse":12,"./Face":13,"./Layer":14,"./Line":15,"./Line3d":16,"./LineType":17,"./Point":18,"./Polyline":19,"./Polyline3d":20,"./Spline":21,"./Table":22,"./Text":23,"./TextStyle":24,"./Viewport":25}]},{},[]);
