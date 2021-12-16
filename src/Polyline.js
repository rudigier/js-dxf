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