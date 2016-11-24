/*@bigab/async-transform@1.0.7#async-transform*/
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
function asyncTransform(transforms, val, context) {
    if (typeof val === 'undefined') {
        return function (v) {
            return asyncTransform(transforms, v, context);
        };
    }
    var v = Promise.resolve(val);
    if (context) {
        transforms = transforms.map(function (t) {
            return function (v) {
                return t.call(context, v);
            };
        });
    }
    return transforms.reduce(function (p, t) {
        return p.then(t);
    }, v);
}
exports.default = asyncTransform;