const DatabaseObject = require('./DatabaseObject')


class Block extends DatabaseObject {
    constructor(name)
    {
        super(["AcDbEntity", "AcDbBlockBegin"])
        this.name = name
        this.end = new DatabaseObject(["AcDbEntity","AcDbBlockEnd"])
        this.shapes = []
    }

    /* Internal method to set handle value for block end separator entity. */
    setEndHandle(handle) {
        this.end.handle = handle
    }

    addShape(shape)
    {
        this.shapes.push(shape)
        shape.block = this
    }

    toDxfString()
    {
        let s = "0\nBLOCK\n"
        s += super.toDxfString()
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

        s += "0\nENDBLK\n"
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