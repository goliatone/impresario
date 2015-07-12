# impresario

Configuration manager

[Impresario][wiki]
>An impresario (from Italian: impresa, meaning "an enterprise or undertaking")[1] is a person who organizes and often finances concerts, plays or operas; analogous to an artist manager or a film or television producer. The origin of the term is to be found in the social and economic world of Italian opera, where from the mid-18th century to the 1830s, the impresario was the key figure in the organization of a lyric season.

## Getting Started
Install the module with: `npm install impresario`

```javascript
var Impresario = require('impresario');
Impresario({
    required: ['username', 'password'],
    optional: ['port', 'url']
}).on('loaded', function(config){
    console.log('CONFIG', config);
}).load(program);
```

## Examples

```javascript
var Impresario = require('impresario');
Impresario({
    required: ['username', 'password'],
    optional: ['port', 'url']
}).on('loaded', function(config){
    console.log('CONFIG', config);
}).load(program);
```

## Documentation
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2015 goliatone  
Licensed under the MIT license.

[wiki]: https://en.wikipedia.org/wiki/Impresario