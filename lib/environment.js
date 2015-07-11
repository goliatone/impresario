module.exports = {
    id: 'envrironment',
    loader: function defaultsLoader(){
        function capitalize(str){
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }

        function solveKeyPath(name){
            var names = name.toLowerCase().split('_');
            name = names.pop(0);
            names.map(function(bit){
                name += capitalize(bit);
            });

            return name;
        }

        var prop, mappedKey, out = {};
        Object.keys(process.env).map(function(key){
            prop = process.env[key];
            mappedKey = solveKeyPath(key);
            out[mappedKey] = prop;
        });

        return out;
    }
};