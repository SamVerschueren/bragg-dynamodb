'use strict';
const regexp = new RegExp('table/(.*?)/stream');
module.exports = opts => {
	opts = opts || {};

	return ctx => {
		if (!ctx.path && ctx.req.Records && ctx.req.Records.length > 0 && ctx.req.Records[0].eventSource === 'aws:dynamodb') {
			const first = ctx.req.Records[0];
			const table = regexp.exec(first.eventSourceARN)[1];
			const messages = ctx.req.Records.map(record => {
				if (first.eventSourceARN !== record.eventSourceARN) {
					ctx.throw(400, 'Can not process different sources');
				}

				return record.dynamodb;
			});

			ctx.request.body = messages;
			Object.defineProperty(ctx, 'path', {enumerable: true, value: `dynamodb:${(opts[table] || table)}`});
			Object.defineProperty(ctx, 'method', {enumerable: true, value: 'post'});
		}
	};
};
