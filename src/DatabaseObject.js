class DatabaseObject {
    constructor(subclass = null)
    {
        /* Handle should be assigned externally by document instance */
        this.handle = null
        this.layer = null
        this.block = null
        this.owner = null
        this.subclassMarkers = []
        if (subclass) {
            if (Array.isArray(subclass)) {
                for (const sc of subclass) {
                    this.subclassMarkers.push(sc)
                }
            } else {
                this.subclassMarkers.push(subclass)
            }
        }
    }

    /* Internal method to set handle value for block record in block records table. */
    setOwner(owner) {
        this.owner = owner
    }

    toDxfString()
    {
        let s = ""
        if (this.handle) {
            s += `5\n${this.handle.toString(16)}\n`
        } else {
            console.warn("No handle assigned to entity", this)
        }
        if (this.owner && this.owner.handle) {
            s += `330\n${this.owner.handle.toString(16)}\n`
        }
        
        s += `100\n${this.subclassMarkers[0]}\n`;
        if (this.layer?.name) {
            s += `8\n${this.layer.name}\n`;
        }
        
        for (const marker of this.subclassMarkers.slice(1)) {
          s += `100\n${marker}\n`;
        }
        return s
    }
}

module.exports = DatabaseObject