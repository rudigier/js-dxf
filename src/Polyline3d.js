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