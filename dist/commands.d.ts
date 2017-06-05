import * as Discord from 'discord.js';
import { RoleTypes } from './middleware/auth';
export declare type CommandFunction = (message: Discord.Message, definition: CommandDefinition, parameters: ParameterDefinition, client: Discord.Client) => Promise<boolean>;
export declare type PreMessageFunction = (message: Discord.Message) => Promise<void>;
export declare type MiddlewareFunction = (message: Discord.Message, definition: CommandDefinition, client: Discord.Client) => Promise<boolean>;
/**
 * Reference a function cache instead of creating
 * a new instance of a function for every aliased command.
 */
export interface CommandObject {
    definition: CommandDefinition;
    information?: CommandDescription;
    symbol: Symbol;
    aliases: string[];
    pattern?: boolean;
}
export interface CommandList {
    [key: string]: Symbol;
}
/**
 * Specifies what definition you can pass for a function.
 * @interface CommandDefinition
 */
export interface CommandDefinition {
    custom?: any;
    /** the actual function that will use the message */
    command: CommandAction;
    /** A description object for autogenerated help commands. */
    description?: CommandDescription;
    /** Authentication enumerable type. */
    authentication?: RoleTypes;
}
export interface CommandAction {
    action: CommandFunction;
    names: string[];
    /**  if true, the message wont need a chat prefix to be called */
    noPrefix?: boolean;
    /** The optional parameters the function will take
     *   parameters: '{{actionOption}} with {{value}}',
     *
     *  will result in a command parameters to equal
     *  when called with !action hello with person
     *
     *  { array: ['!action', 'hello', 'with', 'person'],
     *   named: { actionOption: 'hello', value: 'person' }}
     */
    parameters?: string;
    /**
     * Instead of seperating simpleCommand and pattern command, simply check for
     * a regex, if so, call a private patternCommand instead.
     * @type {RegExp}
     * @memberof CommandAction
     */
    pattern?: RegExp;
}
export interface CommandDescription {
    /** The message to be shown to the user in the command description. */
    message: string;
    /** An example in the code block for the use of the command. */
    example?: string;
}
export interface ParameterDefinition {
    array: string[];
    named?: {
        [key: string]: string;
    };
}
export interface Prefixer {
    str: string;
    regex: RegExp;
}
/** Don't catch all the errors, just the commandError ones. */
export declare class CommandError extends Error {
}
/**
 * Command Class. Allows for easier usage and management of
 * bot commands. Usage will be as follows.
 *
 * The command class supports middlewares, which on rejection will
 * halt the chain and stop the message from being sent.
 * @example
 * ```typescript
 * import Commands, { RateLimiter, RoleTypes, Auth } from 'discordjs-command-helper';
 *
 * new Commands(prefix, client)
 *  .use(rateLimit.protect)
 *  .use(auth.authenticate)
 *  .defineCommand(auth.getCommand())
 *  .defineCommand({
 *      command: {
 *          names: ['p', 'ping'],
 *          action: ping,
 *      },
 *      description: {
 *          message: 'Replies with pong.',
 *          example: '{{prefix}}ping',
 *      },
 *  })
 *
 * ```
 * @class Commands
 * @export
 */
export default class Commands {
    readonly defaultPrefix: Prefixer;
    private client;
    private commands;
    private patterns;
    private funcs;
    private middlewares;
    /**
     * Creates an instance of Commands.
     * @param {string} prefix  The command prefix used for all
     *                         bot commands. Can be something like `!, y>, |>.`
     *                         Case is automatically ignored.
     * @param {discord.Client} client - discord client, used for easy reference.
     * @memberof Commands
     */
    constructor(prefix: string, client: Discord.Client);
    /**
     * Middleware Support. Middlewares will take 2 arguments.
     * `(message: Discord.Message, client: Discord.Client)`
     * and will always return a Promise that is either resolved
     * as true or false. On true, the function will not be halted.
     * @example
     * ```typescript
     *
     * .use(async (message, client) => {
     *      message.channel.send(`Middleware check: :ok:`);
     *      return true;
     *  })
     *
     * ```
     * @param {MiddlewareFunction} middleware
     */
    use(middleware: MiddlewareFunction): Commands;
    /**
     * defineCommand is the basis of the command class.
     * It allows for easier use of commands via a chained function call.
     *
     * NOTE: simple command used to be just command, but has changed to support the
     * different upcomming command schemes.
     * @example
     * ```typescript
     *
     * .defineCommand({
     *      command: {
     *          names: ['p', 'ping'],
     *          action: ping,
     *      },
     *      description: {
     *          message: 'Replies with pong.',
     *          example: '{{prefix}}ping',
     *      },
     * })
     *
     * ```
     * @param {string[]} commandName
     * @param {CommandInterface} definition
     * @returns {Commands}
     *
     * @memberof Commands
     */
    defineCommand(definition: CommandDefinition): Commands;
    /**
     * Message event, all discord message will be passed into this method, and will assign
     * to the correct command.
     *
     * @param {Discord.Message} message
     * @returns {Promise<void>}
     *
     * @memberof Commands
     */
    message(message: Discord.Message): Promise<void>;
    /**
     * Generates a prefixed help command from the current commands.
     * @param {Discord.RichEmbed} descriptor
     */
    generateHelp(descriptor?: Discord.RichEmbed): Commands;
    /**
     * Finalize function, makes the code a bit more magic, but cleaner.
     * Basically an alias for listening to the message event.
     *
     * @param {PreMessageFunction} [customFunc]
     * @returns {Commands}
     *
     * @memberof Commands
     */
    listen(botType?: 'normal' | 'self' | 'guildonly', customFunc?: PreMessageFunction): Commands;
    /***********
     * PRIVATE *
     ***********/
    private botVerify;
    /**
     * Pattern Command, for regex matching commands.
     * requires a commandNames parameter for help command support, and
     * a named symbol.
     * @param {RegExp} regex The regex that will be matched on a message, can be matched multiple times.
     * @param {string[]} commandNames The 'basic' words that will be matched with the regex, to be shown in the help.
     * @param {CommandDefinition} definition Standard CommandDefinition object, with action included.
     * @returns {Commands}
     *
     * @memberof Commands
     */
    private patternCommand(regex, definition);
    /**
     * Middleware loop, will check each middleware and
     * throw an Error on a non-ok result for the ware.
     *
     * @private
     * @param {Discord.Message} message The raw message passed by discord
     * @param {CommandDefinition} definition The command definition that was matched.
     * @returns {Promise<boolean>}
     *
     * @memberof Commands
     */
    private checkMiddleware(message, definition);
    /**
     * Parse the discord message and split it into its
     * appropriate parameters for ease of use.
     *
     * @private
     * @param {Discord.Message} message
     * @returns {string[]}
     *
     * @memberof Commands
     */
    private parseRequest(message);
    /**
     * Get command, and the correct function for it from the func cache.
     *
     * @private
     * @param {string} chatCommand
     * @param {string} chatPrefix
     * @param {Discord.Message} message
     * @returns {CommandObject}
     *
     * @memberof Commands
     */
    private getCommand(chatCommand, chatPrefix, message);
    /**
     * Check the patterns defined with patternCommand.
     *
     * @private
     * @param {CommandObject[]} commands
     * @param {Discord.Message} message
     *
     * @memberof Commands
     */
    private checkPatterns(commands, message);
    /**
     * Checks if prefix is needed, valid, and that the functor is not a pattern.
     * @param chatPrefix
     * @param command
     */
    private checkPrefix(chatPrefix, commandObject);
    /**
     * Creates a parameter object from the user arguments.
     * If the arugments aren't correct, send a null.
     * Note you cannot ignore arguments, this ensures validation
     * @param {string[]} parameterArray
     * @param {CommandDefinition} definition
     * @returns {Parameterdefinition}
     *
     * @memberof Commands
     */
    private createParameters(parameterArray, definition, message);
}
