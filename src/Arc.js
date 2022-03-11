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