/* ************************************************************************
 *  <copyright file="configs.mjs" company="DAGGER TEAM">
 *  Copyright (c) 2016, 2026 All Right Reserved
 *
 *  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 *  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 *  PARTICULAR PURPOSE.
 *  </copyright>
 *  ***********************************************************************/

import { ModuleType } from './constants.mjs';
import { functionCreator, querySelector, remoteResourceFetcher } from './utils.mjs';

export const defaultConfigContent = {
    options: {
        debugDirective: true,
        integrity: false,
        log: {
            enabled: true,
            style: {
                plain: 'color: #337ab7',
                highlight: 'color: #9442d0'
            }
        },
        warn: {
            enabled: true,
            style: {
                plain: 'color: #ff0000',
                highlight: 'color: #b22222'
            }
        },
        error: {
            style: {
                plain: 'color: #ff0000',
                highlight: 'color: #b22222'
            }
        },
        rootSelectors: ['title', 'body']
    },
    modules: {
        view: {
            uri: ['template#view'],
            type: ModuleType.view,
            optional: true
        },
        script: {
            uri: ['script[type="dagger/script"]'],
            type: ModuleType.script,
            anonymous: true,
            optional: true
        }, style: {
            uri: ['style[type="dagger/style"]'],
            type: ModuleType.style,
            scoped: true,
            optional: true
        }
    },
    routers: {
        mode: 'hash',
        prefix: '',
        aliases: {},
        default: '',
        routing: null
    }
};

const resolver = (base, content, type, extendsDefaultConfig) => ({ base, content: extendsDefaultConfig ? Object.assign({}, defaultConfigContent[type], content) : content });

export const configResolver = (baseElement, base, type = 'modules') => {
    const configContainer = querySelector(baseElement, `script[type="dagger/${ type }"]`, false, true);
    if (!configContainer) {
        return { base, content: defaultConfigContent[type] };
    }
    const src = configContainer.getAttribute('src');
    const extendsDefaultConfig = !Object.is(type, 'modules') || configContainer.hasAttribute('extends');
    if (configContainer.hasAttribute('base')) {
        base = new URL(configContainer.getAttribute('base') || '', base).href;
    }
    if (src) {
        return remoteResourceFetcher(new URL(src, base), configContainer.integrity).then(({ content }) => resolver(base, functionCreator(content), type, extendsDefaultConfig));
    } else if (configContainer.textContent.trim()) {
        return resolver(base, functionCreator(configContainer.textContent), type, extendsDefaultConfig);
    }
    return resolver(base, {}, type, extendsDefaultConfig);
};
