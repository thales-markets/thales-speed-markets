'use strict';

// Object.defineProperty(exports, '__esModule', { value: true });

// var ee = require('axios');
// var Q = require('zod');
import ee from 'axios';
import Q from 'zod';

function _interopDefaultLegacy(e) {
    return e && typeof e === 'object' && 'default' in e ? e : { default: e };
}

var ee__default = /*#__PURE__*/ _interopDefaultLegacy(ee);
var Q__default = /*#__PURE__*/ _interopDefaultLegacy(Q);

function D(o, e) {
    let t = { ...o };
    for (let i of e) delete t[i];
    return t;
}
function q(o) {
    return o.charAt(0).toUpperCase() + o.slice(1);
}
var M = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;
function $(o) {
    let e = o.url,
        t = o.params;
    return t && (e = e.replace(M, (i, n) => (n in t ? `${t[n]}` : i))), e;
}
function P(o, e, t) {
    return o.find((i) => i.method === e && i.path === t);
}
function U(o, e) {
    return o.find((t) => t.alias === e);
}
function O(o, e) {
    var i, n;
    let t = (i = o.errors) == null ? void 0 : i.filter((s) => s.status === e.response.status);
    return t && t.length > 0 ? t : (n = o.errors) == null ? void 0 : n.filter((s) => s.status === 'default');
}
function b(o, e, t, i) {
    let n = P(o, e, t);
    return n && i.config && i.config.url && n.method === i.config.method && v(n.path, i.config.url) ? O(n, i) : void 0;
}
function k(o, e, t) {
    let i = U(o, e);
    return i && t.config && t.config.url && i.method === t.config.method && v(i.path, t.config.url) ? O(i, t) : void 0;
}
function v(o, e) {
    return new RegExp(`^${o.replace(M, () => '([^/]*)')}$`).test(e);
}
function C(o) {
    let e = new FormData();
    for (let t in o) e.append(t, o[t]);
    return { data: e };
}
var u = class extends Error {
    constructor(t, i, n, s) {
        super(t);
        this.config = i;
        this.data = n;
        this.cause = s;
    }
};
var H = {
    name: 'form-data',
    request: async (o, e) => {
        if (typeof e.data != 'object' || Array.isArray(e.data))
            throw new u('Zodios: multipart/form-data body must be an object', e);
        let t = C(e.data);
        return { ...e, data: t.data, headers: { ...e.headers, ...t.headers } };
    },
};
function R() {
    return H;
}
var F = {
    name: 'form-url',
    request: async (o, e) => {
        if (typeof e.data != 'object' || Array.isArray(e.data))
            throw new u('Zodios: application/x-www-form-urlencoded body must be an object', e);
        return {
            ...e,
            data: new URLSearchParams(e.data).toString(),
            headers: { ...e.headers, 'Content-Type': 'application/x-www-form-urlencoded' },
        };
    },
};
function T() {
    return F;
}
function Z(o, e) {
    return { request: async (t, i) => ({ ...i, headers: { ...i.headers, [o]: e } }) };
}
function S(o) {
    return [!0, 'response', 'all'].includes(o);
}
function I(o) {
    return [!0, 'request', 'all'].includes(o);
}
function w({ validate: o, transform: e, sendDefaults: t }) {
    return {
        name: 'zod-validation',
        request: I(o)
            ? async (i, n) => {
                  let s = P(i, n.method, n.url);
                  if (!s) throw new Error(`No endpoint found for ${n.method} ${n.url}`);
                  let { parameters: d } = s;
                  if (!d) return n;
                  let p = { ...n, queries: { ...n.queries }, headers: { ...n.headers }, params: { ...n.params } },
                      f = {
                          Query: (r) => {
                              var a;
                              return (a = p.queries) == null ? void 0 : a[r];
                          },
                          Body: () => p.data,
                          Header: (r) => {
                              var a;
                              return (a = p.headers) == null ? void 0 : a[r];
                          },
                          Path: (r) => {
                              var a;
                              return (a = p.params) == null ? void 0 : a[r];
                          },
                      },
                      c = {
                          Query: (r, a) => (p.queries[r] = a),
                          Body: (r, a) => (p.data = a),
                          Header: (r, a) => (p.headers[r] = a),
                          Path: (r, a) => (p.params[r] = a),
                      },
                      m = I(e);
                  for (let r of d) {
                      let { name: a, schema: j, type: x } = r,
                          A = f[x](a);
                      if (t || A !== void 0) {
                          let E = await j.safeParseAsync(A);
                          if (!E.success) throw new u(`Zodios: Invalid ${x} parameter '${a}'`, n, A, E.error);
                          m && c[x](a, E.data);
                      }
                  }
                  return p;
              }
            : void 0,
        response: S(o)
            ? async (i, n, s) => {
                  var p, f, c, m;
                  let d = P(i, n.method, n.url);
                  if (!d) throw new Error(`No endpoint found for ${n.method} ${n.url}`);
                  if (
                      ((f = (p = s.headers) == null ? void 0 : p['content-type']) == null
                          ? void 0
                          : f.includes('application/json')) ||
                      ((m = (c = s.headers) == null ? void 0 : c['content-type']) == null
                          ? void 0
                          : m.includes('application/vnd.api+json'))
                  ) {
                      let r = await d.response.safeParseAsync(s.data);
                      if (!r.success)
                          throw new u(
                              `Zodios: Invalid response from endpoint '${d.method} ${d.path}'
status: ${s.status} ${s.statusText}
cause:
${r.error.message}
received:
${JSON.stringify(s.data, null, 2)}`,
                              n,
                              s.data,
                              r.error
                          );
                      S(e) && (s.data = r.data);
                  }
                  return s;
              }
            : void 0,
    };
}
var y = class {
    constructor(e, t) {
        this.plugins = [];
        this.key = `${e}-${t}`;
    }
    indexOf(e) {
        return this.plugins.findIndex((t) => (t == null ? void 0 : t.name) === e);
    }
    use(e) {
        if (e.name) {
            let t = this.indexOf(e.name);
            if (t !== -1) return (this.plugins[t] = e), { key: this.key, value: t };
        }
        return this.plugins.push(e), { key: this.key, value: this.plugins.length - 1 };
    }
    eject(e) {
        if (typeof e == 'string') {
            let t = this.indexOf(e);
            if (t === -1) throw new Error(`Plugin with name '${e}' not found`);
            this.plugins[t] = void 0;
        } else {
            if (e.key !== this.key)
                throw new Error(`Plugin with key '${e.key}' is not registered for endpoint '${this.key}'`);
            this.plugins[e.value] = void 0;
        }
    }
    async interceptRequest(e, t) {
        let i = t;
        for (let n of this.plugins) n != null && n.request && (i = await n.request(e, i));
        return i;
    }
    async interceptResponse(e, t, i) {
        let n = i;
        for (let s = this.plugins.length - 1; s >= 0; s--) {
            let d = this.plugins[s];
            d &&
                (n = n.then(
                    d != null && d.response ? (p) => d.response(e, t, p) : void 0,
                    d != null && d.error ? (p) => d.error(e, t, p) : void 0
                ));
        }
        return n;
    }
    count() {
        return this.plugins.reduce((e, t) => (t ? e + 1 : e), 0);
    }
};
function l(o) {
    let e = new Set();
    for (let i of o) {
        let n = `${i.method} ${i.path}`;
        if (e.has(n)) throw new Error(`Zodios: Duplicate path '${n}'`);
        e.add(n);
    }
    let t = new Set();
    for (let i of o)
        if (i.alias) {
            if (t.has(i.alias)) throw new Error(`Zodios: Duplicate alias '${i.alias}'`);
            t.add(i.alias);
        }
    for (let i of o)
        if (i.parameters && i.parameters.filter((s) => s.type === 'Body').length > 1)
            throw new Error(`Zodios: Multiple body parameters in endpoint '${i.path}'`);
}
function z(o) {
    return l(o), o;
}
function L(o) {
    return o;
}
function _() {
    return new h([]);
}
var h = class {
    constructor(e) {
        this.params = e;
    }
    addParameter(e, t, i) {
        return new h([...this.params, { name: e, type: t, description: i.description, schema: i }]);
    }
    addParameters(e, t) {
        let i = Object.keys(t).map((n) => ({ name: n, type: e, description: t[n].description, schema: t[n] }));
        return new h([...this.params, ...i]);
    }
    addBody(e) {
        return this.addParameter('body', 'Body', e);
    }
    addQuery(e, t) {
        return this.addParameter(e, 'Query', t);
    }
    addPath(e, t) {
        return this.addParameter(e, 'Path', t);
    }
    addHeader(e, t) {
        return this.addParameter(e, 'Header', t);
    }
    addQueries(e) {
        return this.addParameters('Query', e);
    }
    addPaths(e) {
        return this.addParameters('Path', e);
    }
    addHeaders(e) {
        return this.addParameters('Header', e);
    }
    build() {
        return this.params;
    }
};
function V(o) {
    return o;
}
function G(o) {
    return o;
}
var g = class {
    constructor(e) {
        this.api = e;
    }
    addEndpoint(e) {
        return this.api.length === 0 ? ((this.api = [e]), this) : ((this.api = [...this.api, e]), this);
    }
    build() {
        return l(this.api), this.api;
    }
};
function J(o) {
    return o ? new g([o]) : new g([]);
}
function W(o, e) {
    let t = q(o);
    return z([
        {
            method: 'get',
            path: `/${o}s`,
            alias: `get${t}s`,
            description: `Get all ${o}s`,
            response: Q__default['default'].array(e),
        },
        { method: 'get', path: `/${o}s/:id`, alias: `get${t}`, description: `Get a ${o}`, response: e },
        {
            method: 'post',
            path: `/${o}s`,
            alias: `create${t}`,
            description: `Create a ${o}`,
            parameters: [{ name: 'body', type: 'Body', description: 'The object to create', schema: e.partial() }],
            response: e,
        },
        {
            method: 'put',
            path: `/${o}s/:id`,
            alias: `update${t}`,
            description: `Update a ${o}`,
            parameters: [{ name: 'body', type: 'Body', description: 'The object to update', schema: e }],
            response: e,
        },
        {
            method: 'patch',
            path: `/${o}s/:id`,
            alias: `patch${t}`,
            description: `Patch a ${o}`,
            parameters: [{ name: 'body', type: 'Body', description: 'The object to patch', schema: e.partial() }],
            response: e,
        },
        { method: 'delete', path: `/${o}s/:id`, alias: `delete${t}`, description: `Delete a ${o}`, response: e },
    ]);
}
function X(o) {
    return o.endsWith('/') ? o.slice(0, -1) : o;
}
function N(o, e) {
    return e.map((t) => ({ ...t, path: X(`${o}${t.path}`) }));
}
function Y(o) {
    return Object.keys(o).flatMap((e) => N(e, o[e]));
}
var B = class {
        constructor(e, t, i) {
            this.endpointPlugins = new Map();
            let n;
            if (!e)
                throw Array.isArray(t)
                    ? new Error('Zodios: missing base url')
                    : new Error('Zodios: missing api description');
            let s;
            if (typeof e == 'string' && Array.isArray(t)) (s = e), (this.api = t), (n = i || {});
            else if (Array.isArray(e) && !Array.isArray(t)) (this.api = e), (n = t || {});
            else throw new Error('Zodios: api must be an array');
            l(this.api),
                (this.options = { validate: !0, transform: !0, sendDefaults: !1, ...n }),
                this.options.axiosInstance
                    ? (this.axiosInstance = this.options.axiosInstance)
                    : (this.axiosInstance = ee__default['default'].create({ ...this.options.axiosConfig })),
                s && (this.axiosInstance.defaults.baseURL = s),
                this.injectAliasEndpoints(),
                this.initPlugins(),
                [!0, 'all', 'request', 'response'].includes(this.options.validate) && this.use(w(this.options));
        }
        initPlugins() {
            this.endpointPlugins.set('any-any', new y('any', 'any')),
                this.api.forEach((e) => {
                    let t = new y(e.method, e.path);
                    switch (e.requestFormat) {
                        case 'binary':
                            t.use(Z('Content-Type', 'application/octet-stream'));
                            break;
                        case 'form-data':
                            t.use(R());
                            break;
                        case 'form-url':
                            t.use(T());
                            break;
                        case 'text':
                            t.use(Z('Content-Type', 'text/plain'));
                            break;
                    }
                    this.endpointPlugins.set(`${e.method}-${e.path}`, t);
                });
        }
        getAnyEndpointPlugins() {
            return this.endpointPlugins.get('any-any');
        }
        findAliasEndpointPlugins(e) {
            let t = this.api.find((i) => i.alias === e);
            if (t) return this.endpointPlugins.get(`${t.method}-${t.path}`);
        }
        findEnpointPlugins(e, t) {
            return this.endpointPlugins.get(`${e}-${t}`);
        }
        get baseURL() {
            return this.axiosInstance.defaults.baseURL;
        }
        get axios() {
            return this.axiosInstance;
        }
        use(...e) {
            if (typeof e[0] == 'object') return this.getAnyEndpointPlugins().use(e[0]);
            if (typeof e[0] == 'string' && typeof e[1] == 'object') {
                let t = this.findAliasEndpointPlugins(e[0]);
                if (!t) throw new Error(`Zodios: no alias '${e[0]}' found to register plugin`);
                return t.use(e[1]);
            } else if (typeof e[0] == 'string' && typeof e[1] == 'string' && typeof e[2] == 'object') {
                let t = this.findEnpointPlugins(e[0], e[1]);
                if (!t) throw new Error(`Zodios: no endpoint '${e[0]} ${e[1]}' found to register plugin`);
                return t.use(e[2]);
            }
            throw new Error('Zodios: invalid plugin registration');
        }
        eject(e) {
            var t;
            if (typeof e == 'string') {
                this.getAnyEndpointPlugins().eject(e);
                return;
            }
            (t = this.endpointPlugins.get(e.key)) == null || t.eject(e);
        }
        injectAliasEndpoints() {
            this.api.forEach((e) => {
                e.alias &&
                    (['post', 'put', 'patch', 'delete'].includes(e.method)
                        ? (this[e.alias] = (t, i) => this.request({ ...i, method: e.method, url: e.path, data: t }))
                        : (this[e.alias] = (t) => this.request({ ...t, method: e.method, url: e.path })));
            });
        }
        async request(e) {
            let t = e,
                i = this.getAnyEndpointPlugins(),
                n = this.findEnpointPlugins(t.method, t.url);
            (t = await i.interceptRequest(this.api, t)), n && (t = await n.interceptRequest(this.api, t));
            let s = this.axiosInstance.request({ ...D(t, ['params', 'queries']), url: $(t), params: t.queries });
            return (
                n && (s = n.interceptResponse(this.api, t, s)),
                (s = i.interceptResponse(this.api, t, s)),
                (await s).data
            );
        }
        async get(e, ...[t]) {
            return this.request({ ...t, method: 'get', url: e });
        }
        async post(e, t, ...[i]) {
            return this.request({ ...i, method: 'post', url: e, data: t });
        }
        async put(e, t, ...[i]) {
            return this.request({ ...i, method: 'put', url: e, data: t });
        }
        async patch(e, t, ...[i]) {
            return this.request({ ...i, method: 'patch', url: e, data: t });
        }
        async delete(e, t, ...[i]) {
            return this.request({ ...i, method: 'delete', url: e, data: t });
        }
    },
    te = B;
function K(o, e) {
    if (o instanceof ee.AxiosError || (o && typeof o == 'object' && 'isAxiosError' in o)) {
        let t = o;
        if (t.response) {
            let i = e(t);
            if (i) return i.some((n) => n.schema.safeParse(t.response.data).success);
        }
    }
    return !1;
}
function ie(o, e, t, i) {
    return K(i, (n) => b(o, e, t, n));
}
function ne(o, e, t) {
    return K(t, (i) => k(o, e, i));
}

export { te as Zodios };
export { u as ZodiosError };
export { J as apiBuilder };
export { l as checkApi };
export { R as formDataPlugin };
export { T as formURLPlugin };
export { Z as headerPlugin };
export { ne as isErrorFromAlias };
export { ie as isErrorFromPath };
export { z as makeApi };
export { W as makeCrudApi };
export { G as makeEndpoint };
export { V as makeErrors };
export { L as makeParameters };
export { Y as mergeApis };
export { _ as parametersBuilder };
export { N as prefixApi };
export { w as zodValidationPlugin };

/*
exports.Zodios = te;
exports.ZodiosError = u;
exports.apiBuilder = J;
exports.checkApi = l;
exports.formDataPlugin = R;
exports.formURLPlugin = T;
exports.headerPlugin = Z;
exports.isErrorFromAlias = ne;
exports.isErrorFromPath = ie;
exports.makeApi = z;
exports.makeCrudApi = W;
exports.makeEndpoint = G;
exports.makeErrors = V;
exports.makeParameters = L;
exports.mergeApis = Y;
exports.parametersBuilder = _;
exports.prefixApi = N;
exports.zodValidationPlugin = w;
*/
