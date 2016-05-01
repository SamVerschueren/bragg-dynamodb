import test from 'ava';
import * as fixture1 from './fixtures/multi-source.json';
import * as fixture2 from './fixtures/sns-event.json';
import * as fixture3 from './fixtures/event.json';
import m from './';

function fn(t, event, opts) {
	const ctx = Object.assign({}, {req: event}, t.context.ctx);
	m(opts)(ctx);
	return ctx;
}

test.beforeEach(t => {
	t.context.ctx = {
		request: {},
		throw: (code, msg) => {
			throw new Error(`${code} - ${msg}`);
		}
	};
});

test('error', t => {
	t.throws(fn.bind(undefined, t, fixture1), '400 - Can not process different sources');
});

test('do nothing if it\'s not a dynamodb event', t => {
	const result = fn(t, fixture2);
	t.falsy(result.request.body);
	t.falsy(result.path);
	t.falsy(result.method);
});

test('result', t => {
	const result = fn(t, fixture3);
	t.is(result.path, 'dynamodb:ExampleTableWithStream');
	t.is(result.method, 'post');
	t.deepEqual(result.request.body, [
		{
			Keys: {
				Id: {
					N: '101'
				}
			},
			NewImage: {
				Message: {
					S: 'New item!'
				},
				Id: {
					N: '101'
				}
			},
			StreamViewType: 'NEW_AND_OLD_IMAGES',
			SequenceNumber: '111',
			SizeBytes: 26
		},
		{
			OldImage: {
				Message: {
					S: 'New item!'
				},
				Id: {
					N: '101'
				}
			},
			SequenceNumber: '222',
			Keys: {
				Id: {
					N: '101'
				}
			},
			SizeBytes: 59,
			NewImage: {
				Message: {
					S: 'This item has changed'
				},
				Id: {
					N: '101'
				}
			},
			StreamViewType: 'NEW_AND_OLD_IMAGES'
		},
		{
			Keys: {
				Id: {
					N: '101'
				}
			},
			SizeBytes: 38,
			SequenceNumber: '333',
			OldImage: {
				Message: {
					S: 'This item has changed'
				},
				Id: {
					N: '101'
				}
			},
			StreamViewType: 'NEW_AND_OLD_IMAGES'
		}
	]);
});

test('path mapping', t => {
	t.is(fn(t, fixture3, {ExampleTableWithStream: 'foo'}).path, 'dynamodb:foo');
});
