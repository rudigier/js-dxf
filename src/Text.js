const BaseEntity = require('./BaseEntity')


const H_ALIGN_CODES = ['left', 'center', 'right'];
const V_ALIGN_CODES = ['baseline','bottom', 'middle', 'top'];

class Text extends BaseEntity
{
    /**
     * @param {number} x1 - x
     * @param {number} y1 - y
     * @param {number} height - Text height
     * @param {number} rotation - Text rotation
     * @param {string} value - the string itself
     * @param {string} [horizontalAlignment="left"] left | center | right
     * @param {string} [verticalAlignment="baseline"] baseline | bottom | middle | top
     */
    constructor(x1, y1, height, rotation, value, horizontalAlignment = 'left', verticalAlignment = 'baseline')
    {
        super("TEXT")
        this.x1 = x1;
        this.y1 = y1;
        this.height = height;
        this.rotation = rotation;
        this.value = value;
        this.hAlign = horizontalAlignment;
        this.vAlign = verticalAlignment;
    }

    toDxfString()
    {
        //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/text_al_u05_c.htm
        let s = super.toDxfString()
        
        s += `10\n${this.x1}\n20\n${this.y1}\n30\n0\n`;
        s += `40\n${this.height}\n`;
        s += `1\n${this.value}\n`;
        s += `50\n${this.rotation}\n`;
        if (H_ALIGN_CODES.includes(this.hAlign, 1) || V_ALIGN_CODES.includes(this.vAlign, 1)) {
            s += `72\n${Math.max(H_ALIGN_CODES.indexOf(this.hAlign), 0)}\n`;
            s += `11\n${this.x1}\n21\n${this.y1}\n31\n0\n`;
            /* AutoCAD needs this one more time, yes, exactly here. */
            s += "100\nAcDbText\n";
            s += `73\n${Math.max(V_ALIGN_CODES.indexOf(this.vAlign), 0)}\n`;
        } else {
            /* AutoCAD needs this one more time. */
            s += "100\nAcDbText\n";
        }
        return s;
    }
}

module.exports = Text;