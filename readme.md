# bragg-dynamodb [![Build Status](https://travis-ci.org/SamVerschueren/bragg-dynamodb.svg?branch=master)](https://travis-ci.org/SamVerschueren/bragg-dynamodb)

> DynamoDB middleware for [bragg](https://github.com/SamVerschueren/bragg).

This little piece of middleware makes it possible to handle DynamoDB events as if they where normal requests.


## Install

```
$ npm install --save bragg-dynamodb
```


## Usage

```js
const app = require('bragg')();
const router = require('bragg-router')();
const dynamodb = require('bragg-dynamodb');

// Listen for events triggered by the `MyTable` and `MyTableDev` table
router.post('dynamodb:MyTable', ctx => {
	console.log(ctx.request.params.table);
	// `MyTable`

	ctx.body = ctx.request.body;
});

app.use(dynamodb({MyTableDev: 'MyTable'}));
app.use(router.routes());

exports.handler = app.listen();
```

The `dynamodb:` prefix is attached by this module and is followed by the name of the table that triggered the event. The changes of the table are
provided in the `body` property of the `request` object.


## API

### dynamodb([options])

#### options

Type: `object`

Map a table name to another name.


## License

MIT © [Sam Verschueren](https://github.com/SamVerschueren)
