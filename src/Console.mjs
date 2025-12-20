/* ************************************************************************
 *  <copyright file="logger.mjs" company="DAGGER TEAM">
 *  Copyright (c) 2016, 2026 All Right Reserved
 *
 *  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 *  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 *  PARTICULAR PURPOSE.
 *  </copyright>
 *  ***********************************************************************/

import { forEach } from './utils.mjs';
import { defaultConfigContent } from './configs.mjs';

const doubleQuotes = '"';
const messageSuffix = ', please double check.';

const formatter = (message, plainStyle, highlightStyle) => {
    const offset = message.startsWith(doubleQuotes) ? 1 : 0;
    const messages = [];
    const styles = [];
    forEach(message.split(doubleQuotes).filter(snippet => snippet), (snippet, index) => {
        if ((index + offset) % 2) {
            messages.push(`%c"${ snippet }"`);
            styles.push(highlightStyle);
        } else {
            messages.push(`%c${ snippet }`);
            styles.push(plainStyle);
        }
    });
    return [messages.join(''), ...styles]; // TODO: double check
};

const processor = (method, messages, condition, plainStyle, highlightStyle, breaking = false) => {
    if (condition) {
        return;
    }
    if (Array.isArray(messages)) {
        const [message, ...objects] = messages;
        const suffix = '%c"%o"';
        const { length } = objects;
        let array = [];
        let resolvedMessage = '';
        forEach(`${ message }${ messageSuffix }`.split('"%o"'), (snippet, index) => {
            const [message, ...styles] = formatter(snippet, plainStyle, highlightStyle);
            resolvedMessage += message;
            array = [...array, ...styles];
            if (index < length) {
                resolvedMessage += suffix;
                array = [...array, highlightStyle, objects[index]];
            }
        });
        method(resolvedMessage, ...array);
    } else {
        method(...formatter(`${ messages }${ messageSuffix }`, plainStyle, highlightStyle));
    }
    if (breaking) { // TODO: 继承daggerError
        throw new Error('dagger AssertionError occurred!');
    }
};

export default class Console {
    static initialize = options => {
        const { log, warn, error } = options;
        const assert = console.assert.bind(console, false);
        Console.assert = (messages, condition) => processor(assert, messages, condition, error.style.plain, error.style.highlight, true);
        Console.log = messages => log.enabled && console.log(...formatter(messages, log.style.plain, log.style.highlight));
        Console.warn = (messages, condition) => warn.enabled && processor(console.warn, messages, condition, warn.style.plain, warn.style.highlight);
        Console.group = label => log.enabled && console.group(label);
        Console.groupEnd = label => log.enabled && console.groupEnd(label);
    };
};

Console.initialize(defaultConfigContent.options);
