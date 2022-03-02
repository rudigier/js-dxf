const DatabaseObject = require('./DatabaseObject')

const EntityTranslations = {
    'LAYER': 'AcDbLayerTableRecord',
    'BLOCK_RECORD': 'AcDbBlockTableRecord'
}


class BaseTableRecord extends DatabaseObject {
    constructor(type, name) {
        if(!EntityTranslations[type]) {
            console.log("BaseTableRecord: no valid type is set", type)
        }

        super(["AcDbSymbolTableRecord", EntityTranslations[type]])

        this.type = type
        this.name = name
    }

    toDxfString() {
        let s = `0\n${this.type}\n`
        s += super.toDxfString()
        s += `2\n${this.name}\n`;
        
        return s
    }
}

module.exports = BaseTableRecord;