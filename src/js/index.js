import playgroundCallback from './playground/callback';
import playgroundPromises from './playground/promises';
import playgroundAsync from './playground/async';
import playgroundWorkshop from './playground/workshop';
import {factory} from './helpers/utils';
import {playground} from './helpers/visualization';

let node = document.querySelector('.outer');

function run(examples) {
    Object.keys(examples).forEach((name) => {
        if (name[0] !== '-') {
            let utils = factory();
            playground({node, name, meta: utils.meta});

            examples[name](utils);
        }
    });
}

run(playgroundWorkshop);
// run(playgroundCallback);
// run(playgroundPromises);
// run(playgroundAsync);
