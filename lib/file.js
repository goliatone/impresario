module.exports = {
    id: 'file',
    loader: function defaultsLoader(filename){
        var fs = require('fs');
        var resolve = require('path').resolve;
        var join = require('path').join;

        var file,
            config = {};

        try {
            file = fs.readFileSync(filename, 'utf-8');
        } catch(e) {
            console.log('FILE DOES NOT EXISTS', filename);
            return config;
        }

        try {
            config = JSON.parse(file);
        } catch(e){
            console.log(e);
            return config;
        }

        return config;
    }
};