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