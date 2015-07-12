module.exports = {
    id: 'defaults',
    loader: function defaultsLoader(defaults){
        console.log('DEFAULTS LOADER')
        return new Promise(function(resolve, reject){
            return resolve(defaults || {});
        });
        // return defaults || {};
    }
};