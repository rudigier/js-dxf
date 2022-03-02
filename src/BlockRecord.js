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