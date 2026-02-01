export {};

declare global {
	export type Command = (json: Discord.Data, env: Ctx) => Promise<Response>;

	export type Ctx = Env & {
		sql: (
			strings: TemplateStringsArray,
			...values: any[]
		) => D1PreparedStatement;
	};

	export type LevelDetails = {
		identifier: string;
		iteration: number;
		data_key: string;
		complexity: number;
		title?: string;
		description?: string;
		creators?: Array<string>;
		tags?: Array<string | 'ok'>;
		verification_time?: number;
		images?: { thumb: { key: string } };
		iteration_image: number;
		statistics?: {
			total_played?: number;
			difficulty?: number;
			liked?: number;
			time?: number;
		};
		update_timestamp?: number;
		creation_timestamp?: number;

		change?: number;
		link?: string;
		creator?: string;
		creator_link?: string;
		date?: string;
		level_id?: string;
	};

	export type UserInfo = {
		user_id: string;
		user_name?: string;
		is_admin: boolean;
		is_developer: boolean;
		is_supermoderator: boolean;
		is_moderator: boolean;
		is_verifier: boolean;
		is_creator: boolean;
		user_level_count: number;
		active_customizations: {
			player_color_primary: { color: Array<number> };
			player_color_secondary: { color: Array<number> };
			items: Record<string, string>;
		};
	};

	export type LeaderboardEntry = {
		best_time: number;
		user_name: string;
		user_id: string;
	};

	export type Section = {
		title: string;
		list_key?: string;
		sections: Section[];
	};
	export type LevelBrowser = Section & {
		tags: Record<string, string>[];
	};

	export namespace Discord {
		type Data = {
			data: {
				name: string;
				options: {
					name: string;
					value: unknown;
				}[];
				resolved: {
					messages: Message[];
				};
				target_id: number;
			};
			member: {
				roles: string[];
				user: {
					id: string;
					global_name: string;
				};
			};
			token: string;
		};

		type Field = {
			name: string;
			value: string;
			inline: boolean;
		};

		type Embed = {
			title: string;
			description?: string;
			color: number;
			type?: string;
			fields?: Field[];
			thumbnail?: {
				url: string;
				height: number;
				width: number;
			};
			author?: {
				name: string;
				url: string;
			};
			url?: string;
			footer?: {
				text: string;
			};
		};

		type Message = {
			content: string;
			embeds: Embed[];
			interaction_metadata?: {
				name: string;
				user: {
					global_name: string;
					username: string;
					id: string;
				};
			};
		};
	}
}
