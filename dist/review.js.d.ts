


import { Book } from "./model/CompilerModel";
import { IOptions } from "./controller/ConfigRaw";
import { Controller } from "./controller/Controller";
export declare function start(setup: (review: Controller) => void, options?: IOptions): Promise<Book>;

declare module "review.js" {
    export = ReVIEW;
}
