const db = require('./src/mongodb.js');
const providers = require('./src/providers.js');
const commandLineArgs = require('command-line-args');
const optionDefinitions = [
    { name: 'install', type: Boolean, defaultOption: false },
];
const options = commandLineArgs(optionDefinitions);

//Add providers
providers.addProvider(require('./src/providers/boncoin.js'));

db.connect('mongodb://localhost:27017/findhome', function () {
    if (options.install) {
        require('./src/install.js').install();
    } else {
        require('./src/server').start(8078);
    }
});
