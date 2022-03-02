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
