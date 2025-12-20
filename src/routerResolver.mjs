/* ************************************************************************
 *  <copyright file="routerResolver.mjs" company="DAGGER TEAM">
 *  Copyright (c) 2016, 2026 All Right Reserved
 *
 *  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 *  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 *  PARTICULAR PURPOSE.
 *  </copyright>
 *  ***********************************************************************/

import Console from './Console.mjs';
import { meta, originalReplaceState } from './constants.mjs';
import { forEach, processorResolver } from './utils.mjs';
import { NodeContext } from './NodeContext.mjs';
import { runtime } from './runtime.mjs';

const anchorResolver = (anchor, event = null) => {
    try {
        const anchorElement = anchor && (document.getElementById(anchor) || querySelector(document, `a[name=${ anchor }]`, false, true));
        if(!anchorElement) {
            return;
        }
        if (event) {
            event.preventDefault();
        }
        anchorElement.scrollIntoView();
        if (!location.href.endsWith(`#@${ anchor }`)) {
            originalPushState.call(history, null, '', `${ location.href }#@${ anchor }`);
        }
        return true;
    } catch (error) {
        return;
    }
};

const routerChangeResolver = nextRoute => {
    const { path } = nextRoute;
    if (Object.is(runtime.rootScope.$route?.path, path)) {
        return;
    }
    Console.log(`⏳ route is changing from "${ runtime.rootScope.$route?.path || '' }" to "${ path || '/' }"...`);
    runtime.styleModuleSet = runtime.styleModuleCache[path] || (runtime.styleModuleCache[path] = new Set);
    Console.group(`resolving modules of the route "${ nextRoute.path || '/' }"`);
    return runtime.rootNamespace.resolve(nextRoute.modules).then(() => {
        Console.groupEnd(`resolving modules of the route "${ nextRoute.path || '/' }"`);
        Console.log(`✅ route has changed from "${ runtime.rootScope.$route?.path || '/' }" to "${ nextRoute.path || '/' }"`);
        processorResolver();
        const currentStyleModuleSet = runtime.rootScope.$route && runtime.styleModuleCache[runtime.rootScope.$route.path];
        runtime.isRouterWritable = true;
        runtime.rootScope.$route = nextRoute;
        runtime.isRouterWritable = false;
        if (!runtime.routerTopology) {
            runtime.routerTopology = [...nextRoute[meta]][0];
            runtime.rootNodeProfiles.map(nodeProfile => new NodeContext(nodeProfile));
        }
        if (!Object.is(currentStyleModuleSet, runtime.styleModuleSet)) {
            currentStyleModuleSet && currentStyleModuleSet.forEach(style => (style.disabled = !runtime.styleModuleSet.has(style), style.setAttribute('active-debug', !style.disabled)));
            runtime.styleModuleSet.forEach(style => (style.disabled = false, style.setAttribute('active-debug', true)));
        }
        anchorResolver(nextRoute.anchor);
    });
};

const stateResolver = (method, parameters) => {
    const url = parameters?.[2], prefix = runtime.routerConfigs.prefix;
    url && !url.startsWith(prefix) && (parameters[2] = `${ prefix }${ url }`);
    method.apply(history, parameters);
    routingChangeResolver();
};

history.pushState = (...parameters) => stateResolver(originalPushState, parameters);
history.replaceState = (...parameters) => stateResolver(originalReplaceState, parameters);

export const routingChangeResolver = () => {
    const slash = '/';
    const anchorIndex = location.hash.lastIndexOf('#@');
    const anchor = (anchorIndex >= 0) ? location.hash.substring(anchorIndex + 2) : '';
    let fullPath = ((Object.is(runtime.routerConfigs.mode, 'history') ? `${ location.pathname }${ location.search }` : location.hash.replace(anchor, ''))).replace(runtime.routerConfigs.prefix, '');
    fullPath.startsWith(slash) || (fullPath = `${ slash }${ fullPath }`);
    const { mode, aliases, prefix } = runtime.routerConfigs;
    const [rawPath = '', query = ''] = fullPath.split('?');
    const path = rawPath.substring(1);
    const params = {};
    const paths = Object.is(rawPath, slash) ? [''] : rawPath.split(slash);
    const routes = [];
    if (!Object.is(rawPath, slash) && rawPath.endsWith(slash)) {
        paths.splice(paths.length - 1, 1);
    }
    let redirectPath = aliases[path];
    if (!Object.is(redirectPath)) {
        Console.log('🦘 route alias matched');
    } else if (runtime.rootRouter.match(routes, params, paths)) {
        redirectPath = routes[0]?.redirectPath;
        routes.reverse();
    } else if (Reflect.has(routerConfigs, 'default')) {
        Console.assert(`The route "${ path }" is invalid`, !Object.is(runtime.routerConfigs.default, path));
        Console.warn(`❎ The route "${ path }" is invalid`);
        redirectPath = routerConfigs.default;
    } else {
        Console.assert(`The route "${ path }" is invalid`);
    }
    if (redirectPath != null) {
        Console.log(`The route is redirecting from "${ path }" to "${ redirectPath || '/' }"`);
        return history.replaceState(null, '', `${ query ? `${ redirectPath }?${ query }` : redirectPath }${ anchor }` || routerConfigs.prefix);
    }
    const queries = {};
    const variables = Object.assign({}, ...routes.map(route => route.variables));
    const constants = Object.assign({}, ...routes.map(route => route.constants));
    if (query) {
        forEach([...new URLSearchParams(query)], ([key, value]) => (queries[key] = value));
    }
    forEach(Object.keys(variables), key => {
        if (Reflect.has(queries, key) && !Reflect.has(constants, key)) {
            const type = typeof variables[key];
            const query = queries[key];
            try {
                variables[key] = Object.is(type, 'string') ? query : window[`${ type[0].toUpperCase() }${ type.substring(1) }`](JSON.parse(query));
            } catch (error) {
                Console.assert(`The expected variable type is "${ type }" but the real queryString content is "${ query }"`);
            }
        }
    });
    const nextRoute = {
        url: location.href,
        mode,
        path,
        paths,
        prefix,
        modules: new Set(routes.map(route => route.modules).flat()),
        query,
        queries,
        params,
        variables,
        constants,
        anchor
    };
    Console.log(`⏳ resolving sentries within route "${ runtime.rootScope.$route?.path || '/' }"...`);
    Promise.all([...runtime.sentrySet].map(sentry => Promise.resolve(sentry.processor(nextRoute)).then(prevent => ({ sentry, prevent })))).then(results => {
        Console.log(`✅ resolved sentries within route "${ runtime.rootScope.$route?.path || '/' }"`);
        const matchedOwners = results.filter(result => result.prevent).map(result => result.sentry.owner);
        matchedOwners.length ? forEach(matchedOwners, owner => Console.warn(['❎ The route redirect is prevented by the "+sentry" directive declared on the "%o" element', owner.node || owner.profile.node])) || originalPushState.call(history, null, '', runtime.rootScope.$route.url) : routerChangeResolver(nextRoute);
    });
};
