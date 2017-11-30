var graph = {
    "nodes": [
        { "x": 350, "y": 400, ip: '192.168.1.102', type: 'server', status: 'active' },
        { "x": 600, "y": 400, ip: '192.168.1.103', type: 'server', status: 'active' },
        { "x": 350, "y": 500, ip: '192.168.1.104', type: 'router', status: 'active' },
        { "x": 600, "y": 500, ip: '192.168.1.105', type: 'router', status: 'down' },
        { "x": 500, "y": 600, ip: '192.168.1.106', type: 'switch', status: 'active' },
        { "x": 500, "y": 700, ip: '192.168.1.107', type: 'firewall', status: 'active' },
        { "x": 200, "y": 950, ip: '192.168.1.108', type: 'client-PC', status: 'active' },
        { "x": 500, "y": 900, ip: '192.168.1.109', type: 'client-PC', status: 'active' },
        { "x": 800, "y": 890, ip: '192.168.1.110', type: 'client-phone', status: 'active' }
    ],
    "links": [
        { "source": 0, "target": 2 },
        { "source": 1, "target": 3 },
        { "source": 2, "target": 4 },
        { "source": 3, "target": 4 },
        { "source": 4, "target": 5 },
        { "source": 5, "target": 6 },
        { "source": 5, "target": 7 },
        { "source": 5, "target": 8 }
    ]
};
var width = 960,
    height = 700;



var force = d3.forceSimulation()
    // .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", tick);

var svg = d3.select("#container").append("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append('g');

// 整体平移以及缩放设置
var zoom = d3.zoom()
    .scaleExtent([1 / 2, 8])
    .on("zoom", zoomed)
svg.call(zoom);
function zoomed() {
    console.log(d3.event, d3.zoomTransform(this));
    g.attr("transform", d3.event.transform);
}

$('#refresh').on('click', function () {
    // g.attr("transform", 'translate(0,0) scale(1)');
    // zoom.transform(g, d3.zoomIdentity);
    // g.call(d3.zoomIdentity.translate(0, 0).scale(1), d3.zoomIdentity);
    g.call(zoom.transform, d3.zoomIdentity);
});

var link = g.selectAll(".link"),
    node = g.selectAll(".network-node");

force.nodes(graph.nodes).force("link", d3.forceLink(graph.links));

link = link.data(graph.links)
    .enter().append("line")
    .attr("class", "link");
link.append("svg:title")
    .text(function (d) {
        return '源IP: ' + d.source.ip + '\n目的IP: ' + d.target.ip;
    });

console.log(graph.nodes);

// 代码暂时保留，后续元素增加可能还是需要有g元素容器
// node = node.data(graph.nodes).enter().append('g');
// node.append("svg:image")
//     // 设置属性
//     .attr('id', function (d) { return d.ip; })
//     .attr("xlink:href", function (d) {
//         if (d.status === 'down') {
//             return './img/' + d.type + '-warn.png';
//         } else {
//             return './img/' + d.type + '.png';
//         }
//     })
//     .attr("width", "40px")
//     .attr("height", "40px")
//     // 设置点击事件
//     .on("dblclick", dblclick)
//     // 设置拖拽移动事件
//     .call(d3.drag()
//         .on("start", dragstart)
//         .on("drag", dragged)
//         .on("end", dragended));

node = node.data(graph.nodes).enter().append("image")
    // 设置属性
    .attr("class", "network-node")
    .attr('id', function (d) { return d.ip; })
    .attr("xlink:href", function (d) {
        if (d.status === 'down') {
            return './img/' + d.type + '-warn.png';
        } else {
            return './img/' + d.type + '.png';
        }
    })
    .style('cursor', 'pointer')
    .attr("width", "40px")
    .attr("height", "40px")
    // 设置点击事件
    .on("dblclick", dblclick)
    .on('click', clickNode)
    // 设置拖拽移动事件
    .call(d3.drag()
        .on("start", dragstart)
        .on("drag", dragged)
        .on("end", dragended));

node.append("title")
    .text(function (d) {
        return 'IP: ' + d.ip + '\nvalue: 123';
    });

g.selectAll(".text").data(graph.nodes)
    .enter().append('text')
    .attr('id', function (d) { return d.ip + '-text'; })
    .text(function (d) { return d.ip; })
    .attr('dy', '1em');

function tick() {
    link.attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; })
        .attr('source', function (d) { return d.source.ip })
        .attr('target', function (d) { return d.target.ip })
        .attr('stroke', function (d) {
            if (d.source.status === 'down' || d.target.status === 'down') {
                return 'yellow';
            } else if (d.source.operation === 'selected' || d.target.operation === 'selected') {
                return '#04ff00';
            } else {
                return '#0008ff';
            }
        });

    // 给节点设置位置，g元素只支持transform设置位置（因为需要字符串拼接，导致目前拖动有抖动的bug）
    // 代码暂时保留，后续元素增加可能还是需要有g元素
    // node.attr('transform', function (d) {
    //     console.log(d);
    //     // var translate = `translate(${d.x - 20},${d.y - 20})`;
    //     d.fx = d.x;
    //     d.fy = d.y;
    //     // return translate;
    // });

    node.attr("x", function (d) {
        d.fx = d.x;
        var textWidth = document.getElementById('192.168.1.102-text').getBBox().width;
        document.getElementById(d.ip + '-text').setAttribute('x', d.x - textWidth / 2);
        return d.x - 20;
    }).attr("y", function (d) {
        d.fy = d.y;
        document.getElementById(d.ip + '-text').setAttribute('y', d.y + 25);
        return d.y - 20;
    }).attr('width', function (d) {
        if (d.operation === 'selected') {
            return 50;
        } else {
            return 40;
        }
    }).attr('height', function (d) {
        if (d.operation === 'selected') {
            return 50;
        } else {
            return 40;
        }
    });
}

function dblclick(d) {
    // 禁止节点的移动，防止误操作
    d3.select(this).classed("fixed", d.fixed = false);
}

// 选中网络节点时，放大当前选中的节点，并在重新计算连线的时候将连线高亮显示
function clickNode(d) {
    // d3.js的阻止事件冒泡方式
    d3.event.stopPropagation();
    // 禁止节点的移动，防止误操作
    d3.select(this).classed("fixed", d.fixed = false);
    // 清楚其他节点的标记
    cleanNodes();
    d.operation = 'selected';
}

function dragstart(d) {
    if (!d3.event.active) {
        force.alphaTarget(.1).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    // force.stop();
    if (!d3.event.active) {
        force.alphaTarget(0);
    }
    // d.fx = null;
    // d.fy = null;
}

function cleanNodes() {
    var networkNodes = d3.selectAll('.network-node');
    networkNodes.each(function (d) { d.operation = null; })
}

$('#container').on('click', function () {
    cleanNodes();
});