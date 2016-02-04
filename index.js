'use strict';
var regexp = new RegExp('table\/(.*?)\/stream');
module.exports = function (opts) {
	opts = opts || {};

	return function (ctx) {
		if (!ctx.path && ctx.req.Records && ctx.req.Records.length > 0 && ctx.req.Records[0].eventSource === 'aws:dynamodb') {
			var first = ctx.req.Records[0];
			var table = regexp.exec(first.eventSourceARN)[1];
			var messages = ctx.req.Records.map(function (record) {
				if (first.eventSourceARN !== record.eventSourceARN) {
					ctx.throw(400, 'Can not process different sources');
				}

				return record.dynamodb;
			});

			ctx.request.body = messages;
			Object.defineProperty(ctx, 'path', {enumerable: true, value: 'dynamodb:' + (opts[table] || table)});
			Object.defineProperty(ctx, 'method', {enumerable: true, value: 'post'});
		}
	};
};
