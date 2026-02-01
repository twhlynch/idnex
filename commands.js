const USER_COMMAND = { integration_types: [0, 1], contexts: [0, 1, 2] };
const MESSAGE_ACTION = { type: 3 };
const STRING_OPTION = { type: 3 };
const NUMBER_OPTION = { type: 4 };
const BOOL_OPTION = { type: 5 };
const CHOICE = (value) => ({ name: value, value: value });

export const commands = [
	// levels
	{
		name: 'level',
		description: 'Get a level link',
		options: [
			{
				name: 'title',
				description: 'Title of the level',
				required: true,
				...STRING_OPTION,
			},
			{
				name: 'creator',
				description: 'The level creators username',
				...STRING_OPTION,
			},
		],
		...USER_COMMAND,
	},
	{
		name: 'newestunbeaten',
		description: 'Get the newest unbeaten level',
	},
	{
		name: 'random',
		description: 'Get a random level',
		options: [
			{
				name: 'verified',
				description: 'Only return verified levels',
				required: true,
				...BOOL_OPTION,
			},
		],
		...USER_COMMAND,
	},
	{
		name: 'newest',
		description: 'Get the newest level globally or by creator',
		options: [
			{
				name: 'creator',
				description: 'creators username',
				required: false,
				...STRING_OPTION,
			},
		],
		...USER_COMMAND,
	},
	{
		name: 'oldest',
		description: 'Get the oldest level of a creator',
		options: [
			{
				name: 'creator',
				description: 'creators username',
				required: false,
				...STRING_OPTION,
			},
		],
		...USER_COMMAND,
	},
	// level lists
	{
		name: 'unbeaten',
		description: 'Get the current unbeaten levels list',
	},
	{
		name: 'trending',
		description: 'Get the current trending levels list',
	},
	{
		name: 'script',
		description: 'get levels data',
		options: [
			{
				name: 'filter',
				description: 'the filter',
				required: true,
				...STRING_OPTION,
			},
			{
				name: 'limit',
				description: 'the limit',
				required: true,
				...NUMBER_OPTION,
			},
			{
				name: 'return',
				description: 'the return value',
				required: true,
				...STRING_OPTION,
			},
		],
		...USER_COMMAND,
	},
	{
		name: 'checkstolen',
		description: 'Check two accounts for copied level',
		options: [
			{
				name: 'id1',
				description: 'user id of potential theif',
				required: true,
				...STRING_OPTION,
			},
			{
				name: 'id2',
				description:
					'user id of original creator or blank for all verified levels',
				required: false,
				...STRING_OPTION,
			},
		],
		...USER_COMMAND,
	},
	// players
	{
		name: 'player',
		description: 'Get a players details and stats',
		options: [
			{
				name: 'username',
				description: 'Player username',
				required: true,
				...STRING_OPTION,
			},
		],
		...USER_COMMAND,
	},
	{
		name: 'whois',
		description: 'Get a players cosmetic details and role',
		options: [
			{
				name: 'username',
				description: 'Player username',
				required: true,
				...STRING_OPTION,
			},
		],
		...USER_COMMAND,
	},
	{
		name: 'id',
		description: 'Get a players id',
		options: [
			{
				name: 'username',
				description: 'Player username',
				required: true,
				...STRING_OPTION,
			},
		],
		...USER_COMMAND,
	},
	// hardest list
	{
		name: 'gethardest',
		description:
			'Get the nth level on the Hardest Levels List or a levels location',
		options: [
			{
				name: 'position',
				description: 'Position on the list',
				required: false,
				...NUMBER_OPTION,
			},
			{
				name: 'url',
				description: 'level url',
				required: false,
				...STRING_OPTION,
			},
		],
	},
	{
		name: 'hardest',
		description: 'Hardest maps list functionality',
		options: [
			{
				name: 'command',
				description: 'The command to run',
				required: true,
				...STRING_OPTION,
				choices: [
					CHOICE('list'),
					CHOICE('add'),
					CHOICE('remove'),
					CHOICE('move'),
					CHOICE('page'),
				],
			},
			{
				name: 'link',
				description: 'Link to the level',
				required: false,
				...STRING_OPTION,
			},
			{
				name: 'number',
				description: 'Position to move or add to, or page number',
				required: false,
				...NUMBER_OPTION,
			},
		],
	},
	// other
	{
		name: 'leaderboard',
		description: 'Get a levels leaderboard',
		options: [
			{
				name: 'title',
				description: 'Title of the level',
				required: true,
				...STRING_OPTION,
			},
			{
				name: 'creator',
				description: 'The level creators username',
				required: false,
				...STRING_OPTION,
			},
		],
		...USER_COMMAND,
	},
	{
		name: 'globalstats',
		description: 'Get global level statistics',
		...USER_COMMAND,
	},
	// right click actions
	{
		name: 'Get leaderboard',
		...MESSAGE_ACTION,
		...USER_COMMAND,
	},
	{
		name: 'Get creator',
		...MESSAGE_ACTION,
		...USER_COMMAND,
	},
	{
		name: 'Get iterations',
		...MESSAGE_ACTION,
		...USER_COMMAND,
	},
	{
		name: 'Get thumbnail',
		...MESSAGE_ACTION,
		...USER_COMMAND,
	},
	// ai
	{
		name: 'ask',
		description: 'Ask idnex something',
		options: [
			{
				name: 'message',
				description: 'Something to ask idnex',
				required: true,
				...STRING_OPTION,
				max_length: 300,
			},
		],
		...USER_COMMAND,
	},
	// utils
	{
		name: 'status',
		description: 'Get relevant server statuses',
		...USER_COMMAND,
	},
	{
		name: 'echo',
		description: 'say something',
		options: [
			{
				name: 'message',
				description: 'Something to say',
				required: true,
				...STRING_OPTION,
			},
		],
		...USER_COMMAND,
	},
	{
		name: 'Inspect',
		...MESSAGE_ACTION,
		...USER_COMMAND,
	},
];
