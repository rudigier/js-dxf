const BaseEntity = require('./BaseEntity')

class BlockReference extends BaseEntity {
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

module.exports = BlockReference