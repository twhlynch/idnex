type NumericAggregate = {
	total: number;
	count: number;
	min: number | null;
	max: number | null;
};

type Aggregate<T> = T extends number
	? NumericAggregate
	: T extends object
		? { [K in keyof T]: Aggregate<T[K]> }
		: never;

type AggregateResult<T> = Aggregate<T> & {
	count: number;
};

type Shape = 0 | { [key: string]: Shape };
type UnknownObject = Record<string, unknown>;

export function aggregate_data<T extends object>(
	objects: T[],
): AggregateResult<T> {
	function valid(obj: unknown): obj is UnknownObject {
		return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
	}

	function build_shape(objs: unknown[]): Shape {
		const shape: Shape = {};
		for (const obj of objs) {
			if (!valid(obj)) continue;
			for (const key of Object.keys(obj)) {
				const val = obj[key];
				if (valid(val)) {
					shape[key] = shape[key] || {};
					Object.assign(shape[key], build_shape([val]));
				} else if (typeof val === 'number') {
					shape[key] = 0; // leaf
				}
			}
		}
		return shape;
	}

	function recurse(objs: unknown[], shape: Shape): unknown {
		if (shape === 0) {
			const values = objs.filter(
				(v): v is number => typeof v === 'number',
			);
			const count = values.length;
			const total = values.reduce((a, b) => a + b, 0);
			const min = count > 0 ? Math.min(...values) : null;
			const max = count > 0 ? Math.max(...values) : null;

			return { total, count, min, max };
		}

		const result: Record<string, unknown> = {};
		for (const key of Object.keys(shape)) {
			const sub_objs = objs.map((o) =>
				valid(o) && typeof o === 'object' ? o[key] : undefined,
			);
			result[key] = recurse(sub_objs, shape[key]);
		}
		return result;
	}

	const shape = build_shape(objects);
	const result = recurse(objects, shape) as Aggregate<T>;
	(result as { count: number }).count = objects.length;

	return result as AggregateResult<T>;
}
