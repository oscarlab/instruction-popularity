'use strict';

/* jshint globalstrict: true */
/* global dc,d3,crossfilter */

/*
   "instructions":
	[
		{
			"id": 1,
			"size": 2,
			"mnem": "ADD",
			"opcode": "0",
			"package_count": 2522,
			"prefix": "0",
			"tag": "Binary Arithmetic",
			"count": 69635
		},
*/

var typeChart = dc.rowChart('#type-chart'),
	mnemChart = dc.pieChart('#mnem-chart'),
	opcodeChart = dc.pieChart('#opcode-chart'),
	prefixChart = dc.pieChart('#prefix-chart'),
	sizeChart = dc.pieChart('#size-chart'),
	dataCount = dc.dataCount('#data-count'),
	dataTable = dc.dataTable('#data-table');

var ndx;

var currentSortCol, numClicks;

var allDim;

d3.json('data.json', function(error,data) {
	var instrData = data.instructions;
	_.forEach(instrData, function(d) {
		d.size = +d.size;
		d.package_count = +d.package_count;
		d.count = +d.count;
		d.searchstring = d.opcode + " " + d.mnem
	});


	ndx = crossfilter(instrData);

	var all = ndx.groupAll();

	var all2 = ndx.groupAll();
	var ndxSum = all2.reduceSum(function(d) {return d.count}).value();

	var typeDim = ndx.dimension(function(d) {return d.tag;}),
		mnemDim = ndx.dimension(function(d) {return d.mnem;}),
		opcodeDim = ndx.dimension(function(d) {return d.opcode;}),
		sizeDim = ndx.dimension(function(d) {return d.size;}),
		prefixDim = ndx.dimension(function(d) {return d.prefix;}),
		searchDim = ndx.dimension(function(d) {return d.searchstring;});

	allDim = ndx.dimension(function(d) {return d;});

	var countPerType = typeDim.group().reduceSum(dc.pluck('count')),
		countPerMnem = mnemDim.group().reduceSum(dc.pluck('count')),
		countPerOpcode = opcodeDim.group().reduceSum(dc.pluck('count')),
		countPerPrefix = prefixDim.group().reduceSum(dc.pluck('count')),
		countPerSize = sizeDim.group().reduceSum(dc.pluck('count'));

	typeChart
		.height(1500)
		.dimension(typeDim)
		.group(countPerType)
		.x(d3.scale.linear().domain([0,d3.max(countPerType)]))
		.elasticX(true)
		.renderLabel(true)
		.label(function(d) { return d.key + " - " + d3.format(",")(d.value) + " ( " + (d.value/ndxSum*100).toFixed(5) + " % )"})
		.ordering( function(d) {return -d.value;})
		.xAxis().tickFormat(function(d) {return "";});

	mnemChart
		.height(400)
		.dimension(mnemDim)
		.group(countPerMnem)
		.innerRadius(10)
		.externalLabels(30)
		.externalRadiusPadding(50)
		.slicesCap(10)
		.drawPaths(true)
		.ordering( function(d) {return -d.value;})
		.on('renderlet',function(chart){
			mnemChart.selectAll('text.pie-slice').text( function(d) {
				if (d.endAngle - d.startAngle > 0.2)
					return d.data.key + ' ( ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '% )';
				else if (d.endAngle - d.startAngle > 0.1)
					return d.data.key;
				else
					return "";
			})
		});

	opcodeChart
		.height(400)
		.dimension(opcodeDim)
		.group(countPerOpcode)
		.innerRadius(10)
		.externalLabels(30)
		.externalRadiusPadding(50)
		.slicesCap(10)
		.drawPaths(true)
		.ordering( function(d) {return -d.value;})
		.on('renderlet',function(chart){
			opcodeChart.selectAll('text.pie-slice').text( function(d) {
				if (d.endAngle - d.startAngle > 0.2)
					return d.data.key + ' ( ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '% )';
				else if (d.endAngle - d.startAngle > 0.1)
					return d.data.key;
				else
					return "";
			})
		})

	prefixChart
		.height(400)
		.dimension(prefixDim)
		.group(countPerPrefix)
		.innerRadius(10)
		.externalLabels(30)
		.externalRadiusPadding(50)
		.slicesCap(10)
		.drawPaths(true)
		.ordering( function(d) {return -d.value;})
		.on('renderlet',function(chart){
			prefixChart.selectAll('text.pie-slice').text( function(d) {
				if (d.endAngle - d.startAngle > 0.2)
					return d.data.key + ' ( ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '% )';
				else if (d.endAngle - d.startAngle > 0.1)
					return d.data.key;
				else
					return "";
			})
		})

	sizeChart
		.height(400)
		.dimension(sizeDim)
		.group(countPerSize)
		.innerRadius(10)
		.externalLabels(30)
		.externalRadiusPadding(50)
		.slicesCap(10)
		.drawPaths(true)
		.ordering( function(d) {return -d.value;})
		.on('renderlet',function(chart){
			sizeChart.selectAll('text.pie-slice').text( function(d) {
				if (d.endAngle - d.startAngle > 0.2)
					return d.data.key + ' ( ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '% )';
				else if (d.endAngle - d.startAngle > 0.1)
					return d.data.key;
				else
					return "";
			})
		})

	dataTable
		.dimension(allDim)
		.group(function (d) { return 'dc.js insists on putting a row here so I remove it using JS'; })
		.columns([
			function (d) { return d.tag;},
			function (d) { return d.mnem;},
			function (d) { return d.prefix;},
			function (d) { return d.opcode;},
			function (d) { return d.size;},
			function (d) { return d.count;},
			function (d) { return d.package_count;},
			function (d) {
				return "<a href='packages.html?id=" + d.id + "&mnem="+ d.mnem +
				"&prefix="+ d.prefix + "&opcode="+ d.opcode + "&size="+ d.size +
				"' target='_blank'> Packages </a>";
			},
			function(d) {return d.source_count;},
			function (d) {
				return "<a href='sources.html?id=" + d.id + "&mnem="+ d.mnem +
				"&prefix="+ d.prefix + "&opcode="+ d.opcode + "&size="+ d.size +
				"' target='_blank'> Sources </a>";
			}
		])
		.sortBy(dc.pluck('package_count'))
		.order(d3.descending)
		.on('renderlet', function (table) {
			// each time table is rendered remove nasty extra row dc.js insists on adding
			table.select('tr.dc-table-group').remove();
		})
		.size(Infinity);

	dataCount
		.dimension(ndx)
		.group(all);

	d3.selectAll('a#reset-all').on('click', function () {
		$("#search-input").val("");
		searchDim.filterAll();
		dc.filterAll();
		resetTablePagination();
		dc.renderAll();
	});

	d3.selectAll('a#reset-type').on('click', function () {
		typeChart.filterAll();
		resetTablePagination();
		dc.redrawAll();
	});

	d3.selectAll('a#reset-mnem').on('click', function () {
		mnemChart.filterAll();
		resetTablePagination();
		dc.redrawAll();
	});

	d3.selectAll('a#reset-opcode').on('click', function () {
		opcodeChart.filterAll();
		resetTablePagination();
		dc.redrawAll();
	});

	d3.selectAll('a#reset-prefix').on('click', function () {
		prefixChart.filterAll();
		dc.redrawAll();
	});

	d3.selectAll('a#reset-size').on('click', function () {
		sizeChart.filterAll();
		resetTablePagination();
		dc.redrawAll();
	});

	$("#search-input").keyup(function () {
		var s = $(this ).val().toLowerCase();
		searchDim.filter(function (d) {
			return d.toLowerCase().indexOf (s) !== -1;} );
		resetTablePagination();
		update();
		dc.redrawAll();
	});

	$('#data-table').on('click', '.data-table-col', function() {
		var column = $(this).attr("data-col");
		if (column == currentSortCol) {
			numClicks = (numClicks + 1)%2;
		} else {
			currentSortCol = column;
			numClicks = 0;
		}
		dataTable.sortBy(function(d) {
			return d[column];
		});
		$(this).parent().children("th").children(".glyph-span").removeClass('glyphicon glyphicon-triangle-top glyphicon-triangle-bottom')
		if (numClicks == 0) {
			if($(this).children(".glyph-span").hasClass('glyphicon glyphicon-triangle-top'))
				$(this).children(".glyph-span").removeClass('glyphicon glyphicon-triangle-top')
			$(this).children(".glyph-span").addClass('glyphicon glyphicon-triangle-bottom')
			dataTable.order(d3.descending);
		}
		else {
			if( $(this).children(".glyph-span").hasClass('glyphicon glyphicon-triangle-bottom'))
				$(this).children(".glyph-span").removeClass('glyphicon glyphicon-triangle-bottom')
			$(this).children(".glyph-span").addClass('glyphicon glyphicon-triangle-top')
			dataTable.order(d3.ascending);
		}
		resetTablePagination();
		dataTable.redraw();
	});

	update();
	dc.renderAll();
});

var ofs = 0, pag = 51;
function display() {
	d3.select('#begin')
		.text(ofs);
	d3.select('#end')
		.text(ofs+pag-1)
	d3.select('#last')
		.attr('disabled', ofs-pag<0 ? 'true' : null);
	d3.select('#next')
		.attr('disabled', ofs+pag>=allDim.top(Number.POSITIVE_INFINITY).length ? 'true' : null);
	d3.select('#size').text(allDim.top(Number.POSITIVE_INFINITY).length);//ndx.size());
}

function resetTablePagination() {
	ofs = 0;
	update();
}

function update() {
	dataTable.beginSlice(ofs);
	dataTable.endSlice(ofs+pag);
	display();
}
function next() {
	ofs += pag;
	update();
	dataTable.redraw();
}
function last() {
	ofs -= pag;
	update();
	dataTable.redraw();
}
// $('#end').on('keyup', function() {
// 	if ($.isNumeric($(this).val()))
// 	{
// 		console.log($(this).val());
// 		pag = $(this).val();
// 		update();
// 		dataTable.redraw();
// 	}
// });



// $("filter-opcodes-text").on('keyup',function(){
// 	text_filter(tableDimension, this.value);//cities is the dimension for the data table

// 	function text_filter(dim,q){
// 		if (q!='') {
// 			dim.filter(function(d){
// 				return d.indexOf (q.toLowerCase()) !== -1;});
// 		} else {
// 			dim.filterAll();
// 		}
// 	RefreshTable();
// 	dc.redrawAll();}
// });

