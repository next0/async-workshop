import d3 from 'd3';

/**
 *
 * @param {HTMLElement} node
 * @param {MetaData} meta
 */
export function requests({node, meta}) {
    const INITIALIZE_TIME = new Date();
    const TIME_THRESHOLD = 1000;
    const TICK_SIZE = 200;
    const MARGIN_TOP = 25;
    const BAR_HEIGHT = 25;
    const BAR_STEP = 3;

    let svg = d3.select(node)
        .append('svg')
        .attr('class', 'chart');

    let axis = svg.append('g')
        .attr('class', 'axis');

    let axisHeader = axis.append('rect')
        .attr('class', 'header')
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', '1.2em');

    let container = svg.append('g')
        .attr('class', 'container')
        .attr('transform', `translate(0,${ MARGIN_TOP})`);

    let lock = false;
    function render() {
        if (lock) {
            return;
        }
        lock = true;

        requestAnimationFrame(() => {
            lock = false;

            const OFFSET_WIDTH = node.clientWidth;
            const OFFSET_HEIGHT = node.clientHeight;
            const NOW = new Date();

            let startTime = d3.min(meta.requests, (req) => req.start) || INITIALIZE_TIME;
            let finishTime = d3.max(meta.requests, (req) => req.finish);

            let done = meta.requests.every((req) => Boolean(req.finish)) && (NOW - finishTime > TIME_THRESHOLD);

            startTime = d3.min([INITIALIZE_TIME, startTime]);
            finishTime = d3.max([
                done ? finishTime : NOW,
                new Date(startTime.getTime() + OFFSET_WIDTH * 1000 / TICK_SIZE)
            ]);

            let width = Math.max(OFFSET_WIDTH, (finishTime - startTime) * TICK_SIZE / 1000);
            let height = Math.max(OFFSET_HEIGHT, BAR_HEIGHT * meta.requests.length + MARGIN_TOP);

            // init x scale
            let x = d3.time.scale()
                .range([0, width])
                .domain([startTime, finishTime]);

            // init x axis
            let xAxis = d3.svg.axis()
                .orient('top')
                .scale(x)
                .ticks(d3.time.seconds, 1)
                .tickSize(-height);

            // render container
            svg.attr('width', width)
                .attr('height', height);

            // render axis
            axisHeader.attr('width', width);
            axis.call(xAxis)
                .selectAll('text')
                    .style('text-anchor', 'end')
                    .attr('dx', '-0.35em')
                    .attr('dy', '1.5em');

            // render bars
            let bars = container.selectAll('g')
                .data(meta.requests);

            // bars enter
            let bar = bars.enter().append('g')
                .attr('class', (req) => req.status)
                .attr('transform', (req, i) => `translate(${ x(req.start) },${ i * BAR_HEIGHT })`);

            bar.append('rect')
                .attr('width', (req) => x(req.finish || NOW) - x(req.start))
                .attr('height', BAR_HEIGHT - BAR_STEP);

            bar.append('text')
                .attr('x', 3)
                .attr('y', (BAR_HEIGHT - BAR_STEP) / 2)
                .attr('dy', '.35em')
                .text((req) => req.url);


            // bars update
            bars.attr('class', (req) => req.status);

            bars.select('rect')
                .attr('width', (req) => x(req.finish || NOW) - x(req.start));

            // bars exit
            bars.exit().remove();

            // redraw if need
            if (!done) {
                render();
            }
        });
    }

    // redraw after change
    meta.on('change:requests', render);
    // redraw after resize
    window.addEventListener('resize', render, false);

    // first render
    render();
}

/**
 *
 * @param {HTMLElement} node
 * @param {MetaData} meta
 */
export function logs({node, meta}) {
    let container = d3.select(node);

    function render() {
        let logs = container.selectAll('.logs__item')
            .data(meta.logs);

        // logs enter
        logs.enter().append('div')
            .attr('class', 'logs__item')
            .text((log) => log.data);

        // logs update
        logs.text((log) => log.data);

        // logs exit
        logs.exit().remove();
    }

    // redraw after change
    meta.on('change:logs', render);

    // first render
    render();
}

/**
 *
 * @param {HTMLElement} node
 * @param {MetaData} meta
 */
export function blueprintRender({node, meta}) {
    function render() {
        node.innerHTML = `
            <div class="header">
                <div class="avatar"></div>
            </div>
            <div class="container">
                <div class="content">
                    <div class="article"></div>
                    <div class="comments"></div>
                </div>
                <div class="side">
                    <div class="related"></div>
                    <div class="tags"></div>
                </div>
            </div>
            <div class="footer"></div>
        `;
    }

    function redraw() {
        node.querySelectorAll('.rendered').forEach((node) => node.classList.remove('rendered'));

        meta.blueprint.forEach((item) => {
            let el = node.querySelector('.' + item.type);

            if (el) {
                el.classList.add('rendered');
            }
        });
    }

    // redraw after change
    meta.on('change:blueprint', redraw);

    // first render
    render();
    redraw();
}


/**
 *
 * @param {HTMLElement} node
 * @param {string} name
 * @param {MetaData} meta
 */
export function playground({node, name, meta}) {
    let blueprintElem = d3.select(node).append('div')
        .attr('class', 'blueprint');

    let playgroundElem = d3.select(node).append('div')
        .attr('class', 'playground');

    playgroundElem.append('div')
        .attr('class', 'playground__title')
        .text(name);

    let requestsElem = playgroundElem.append('div')
        .attr('class', 'playground__requests requests');

    let logsElem = playgroundElem.append('div')
        .attr('class', 'playground__logs logs');

    blueprintRender({node: blueprintElem.node(), meta});
    requests({node: requestsElem.node(), meta});
    logs({node: logsElem.node(), meta});
}
