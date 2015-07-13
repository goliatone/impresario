module.exports = {
    id: 'defaults',
    loader: function defaultsLoader(defaults){
        console.log('DEFAULTS LOADER')
        return Promise.resolve(defaults || {});
        // return defaults || {};
    }
};
