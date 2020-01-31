const Drawing = require('./../../src/Drawing');
const fs = require('fs');

let d = new Drawing();

d.addLayer('l_green', Drawing.ACI.GREEN, 'CONTINUOUS');
d.setActiveLayer('l_green');

d.drawText(-10, 10, 2, 0, 'octicons-cloud-download');

let s = fs.readFileSync('octicons-cloud-download.txt', 'utf8');
d.addEntityRawString(s)

fs.writeFileSync(__filename + '.dxf', d.toDxfString());