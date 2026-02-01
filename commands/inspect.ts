import * as UTILS from '../utils';

export const inspect: Command = async (json, _env) => {
	const message = UTILS.target_message(json);
	if (!message) return UTILS.error('Invalid message');

	if (!message.interaction_metadata)
		return UTILS.error('Not a command interaction');

	const { name, user } = message.interaction_metadata;
	const { global_name, username, id } = user;

	const info = `${name} used by <@${id}> / ${global_name} (${username})`;

	return UTILS.response(info);
};
