export type ErrorLike = Partial<Error> & {
    // Various properties we might want to look for on errors:
    code?: string;
    cmd?: string;
    signal?: string;
    statusCode?: number;
    statusMessage?: string;
};

// Useful to easily cast and then examine errors that are otherwise 'unknown':
export function isErrorLike(error: any): error is ErrorLike {
    return typeof error === 'object' && (
        error instanceof Error ||
        error.message ||
        error.code ||
        error.stack
    )
}

export function asError(error: any): Error {
    if (isErrorLike(error)) return error as Error;
    else {
        return new Error(error.message || error.toString());
    }
}

export class UnreachableCheck extends Error {

    constructor(value: never) {
        super(`Unhandled switch value: ${value}`);
    }

}