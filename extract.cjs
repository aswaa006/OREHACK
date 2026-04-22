const potrace = require('potrace');
const fs = require('fs');

potrace.trace('public/oregent-logo.png', function (err, svg) {
    if (err) throw err;
    fs.writeFileSync('public/logo-traced.svg', svg);
    console.log('SVG saved!');
});
