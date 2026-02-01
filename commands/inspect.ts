import * as UTILS from '../utils';

export const inspect: Command = async (json, _env) => {
	console.log(JSON.stringify(json));

	return UTILS.error('Success');
};
