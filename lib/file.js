module.exports = {
    id: 'file',
    loader: function fileLoader(filename){
        console.log('FILE LOADER', filename);
        return new Promise(function(resolve, reject){
            var fs = require('fs');
            var resolve = require('path').resolve;
            var join = require('path').join;

            var file,
                config = {};

            try {
                console.log('FILE LOADER', filename);
                file = fs.readFileSync(filename, 'utf-8');
            } catch(e) {
                console.log('FILE DOES NOT EXISTS', filename);
                // reject(e)
                resolve(config);
                return config;
            }

            try {
                config = JSON.parse(file);
            } catch(e){
                console.log(e);
                resolve(config);
                // reject(e);
                // return config;
            }
            resolve(config);
            // return config;
        });
    }
};