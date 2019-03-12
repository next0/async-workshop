import playgroundWorkshop from './playground/workshop';
import playgroundBase from './playground/_';
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

run(playgroundBase);
run(playgroundWorkshop);
