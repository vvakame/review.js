"use strict";

export function deepAssign(target: any, ...args: any[]) {
    "use strict";

    args.forEach(arg => {
        Object.keys(arg).forEach(key => {
            if (typeof arg[key] !== "object") {
                target[key] = arg[key];
            } else {
                target[key] = deepAssign(target[key] || {}, arg[key]);
            }
        });
    });

    return target;
}
