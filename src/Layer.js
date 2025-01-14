const BaseTableRecord = require('./BaseTableRecord')

class Layer extends BaseTableRecord {
	constructor(name, colorNumber, lineTypeName) {
		super("LAYER", name);
		this.colorNumber = colorNumber;
		this.lineTypeName = lineTypeName;
		this.shapes = [];
		this.trueColor = -1;
	}

	setLineType(lineTypeName) {
		this.lineTypeName = lineTypeName;
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
}

module.exports = Layer;