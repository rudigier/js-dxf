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