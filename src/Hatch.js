class Hatch
{
    /**
     * @param {string} patternName - SOLID or ANSI31
     * @param {number} patternDensity - (x < 1 for dense arrangement)
     * @param {number} x1 - rectangle (bottom left corner x)
     * @param {number} y1 - rectangle (bottom left corner y)
     * @param {number} x2 - rectangle (top right corner x)
     * @param {number} y2 - rectangle (top right corner y) 
     */
    constructor(patternName,patternDensity,x1,y1,x2,y2)
    {
        this.patternName = patternName,
        this.patternDensity = patternDensity,
        this.x1 = x1,
        this.y1 = y1,
        this.x2 = x2,
        this.y2 = y2
    }

    toDxfString()
    {
        let type = (this.patternName == 'SOLID')? 1:0;
        let s = `0\nHATCH\n`;
        s += `8\nmain_layer\n6\nByLayer\n`;
        s += `2\n${this.patternName}\n`;
        s += `70\n${type}\n71\n${type}\n91\n1\n92\n0\n93\n4\n`;
        s += `72\n1\n10\n${this.x1}\n20\n${this.y1}\n11\n${this.x2}\n21\n${this.y1}\n`;
        s += `72\n1\n10\n${this.x2}\n20\n${this.y1}\n11\n${this.x2}\n21\n${this.y2}\n`;
        s += `72\n1\n10\n${this.x2}\n20\n${this.y2}\n11\n${this.x1}\n21\n${this.y2}\n`;
        s += `72\n1\n10\n${this.x1}\n20\n${this.y2}\n11\n${this.x1}\n21\n${this.y1}\n`;
        s += `97\n4\n75\n0\n76\n1\n`;
        if (type == 0)
        {
            s += `52\n0\n41\n${this.patternDensity}\n77\n0\n78\n0\n98\n0\n`;
        }
        return s;
    }

}


module.exports = Hatch;