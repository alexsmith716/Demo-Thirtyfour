export type State = {
	userAgent?: string | null;
	isBot?: string | null;
};

export const initialState: State = {
	userAgent: null,
	isBot: null,
};

export const reducer = (state: State = initialState): State => {
	return state;
};
