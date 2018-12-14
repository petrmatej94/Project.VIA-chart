var apiKey = "PC55IMQVIAWCD1X9";
var url = "https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=EUR&to_symbol=USD&interval=1min&apikey=" + apiKey;

var finalData;
var firstRun = true;
var MAarr;
var period;

var dataDictionary = {
    "open": [],
    "high": [],
    "low": [],
    "close": [],
    "date": []
};

var xmlHttp = null;
function requestData(url)
{
    xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = ProcessRequest;
    xmlHttp.open("GET", url, true);
    xmlHttp.send();
}

function ProcessRequest() {
    if ( xmlHttp.readyState === 4 && xmlHttp.status === 200 ) {
        if ( xmlHttp.responseText === "Not found" ) {
            console.log("Request failed");
        }
        else {
            finalData = eval ( "(" + xmlHttp.responseText + ")" );
            ParseData(finalData);

            if(firstRun === true){
                CreateChart();
                firstRun = false;
            }
            else {
                RefreshChart();
            }
        }
    }
}

function ClearDictionary() {
    dataDictionary = {
        "open": [],
        "high": [],
        "low": [],
        "close": [],
        "date": []
    };
}
var lastAddedDate;

function ParseData(json) {
    ClearDictionary();
    var keys = Object.keys(json);
    var data = json[keys[1]];
    var dates = Object.keys(data);
    for(var i = 0; i < dates.length; i++) {
        var currentPrices = data[dates[i]];
        var pricesKeys = Object.keys(currentPrices);

        lastAddedDate = dates[i];

        // if(dataDictionary.date[dataDictionary.date.length-1] !== dates[i]) {
        for(var k = 0; k < pricesKeys.length; k++) {
            var currentKey = pricesKeys[k];
            var finalPrice = currentPrices[currentKey];

            if(currentKey.includes("open")) {
                dataDictionary.open.push(finalPrice)
            }
            if(currentKey.includes("high")) {
                dataDictionary.high.push(finalPrice)
            }
            if(currentKey.includes("low")) {
                dataDictionary.low.push(finalPrice)
            }
            if(currentKey.includes("close")) {
                dataDictionary.close.push(finalPrice)
            }
        }
        dataDictionary.date.push(dates[i]);

    }
}



var data = [];
var layout;
function CreateChart() {
    var trace1 = {
        x: dataDictionary.date,
        close: dataDictionary.close,
        high: dataDictionary.high,
        low: dataDictionary.low,
        open: dataDictionary.open,

        increasing: {line: {color: 'black'}},
        decreasing: {line: {color: 'red'}},

        type: 'candlestick',
        xaxis: 'x',
        yaxis: 'y'
    };

    data = [trace1];


    layout = {
        title: 'EURUSD Chart',
        font: {
            family: 'Lato',
            size: 10,
        },
        dragmode: 'turntable',
        showlegend: false,
        xaxis: {
            range: [dataDictionary.date[dataDictionary.date.length-50], dataDictionary.date[0]],
            title: 'Date',
            titlefont: {
                color: 'black',
                size: 20
            },
            type: 'date',
            rangeselector: {buttons: [
                    {
                        count: 1,
                        label: '1m',
                        step: 'minute',
                        stepmode: 'backward'
                    },
                    {
                        count: 5,
                        label: '5m',
                        step: 'minute',
                        stepmode: 'backward'
                    },
                    {
                        count: 30,
                        label: '30m',
                        step: 'minute',
                        stepmode: 'backward'
                    },
                    {
                        count: 60,
                        label: '60m',
                        step: 'minute',
                        stepmode: 'backward'
                    },
                    {step: 'all'}
                ]},
            rangeslider: {range: [dataDictionary.date[dataDictionary.date.length], dataDictionary.date[0]]},
        },
        yaxis: {
            title: 'Price',
            titlefont: {
                size: 20
            },
        },
    };

    Plotly.newPlot('chart', data, layout);
}



var trace2;
var MAtraceInChart = false;
var button = document.getElementById("button");
button.addEventListener("click", function(){
    var input = document.getElementById('input');
    period = parseInt(input.value);
    if(period <= 0){
        alert("Period must be >= 0");
        return;
    }

    if(MAtraceInChart === true) {
        data.pop();
    }
    MAtraceInChart = true;

    MAarr = MovingAverage(dataDictionary.close, period);
    trace2 = {
        x: dataDictionary.date,
        y: MAarr,
        mode: 'lines',
        line: {
            color: 'rgb(55, 128, 191)',
            width: 3
        }
    };

    data.push(trace2);
    Plotly.newPlot('chart', data, layout);
});


function MovingAverage(array, period) {
    for(var m = 0; m < array.length; m++){
        array[m] = parseFloat(array[m]);
    }

    var MAarray = [];
    for(var i = 0; i < array.length; i++) {
        var sum = 0;
        var len = 0;
        for(var k = i; k < i+period; k++) {
            sum += array[k];
            len++;
        }
        var avg = sum/len;
        MAarray.push(avg);
    }
    console.log(MAarray);
    return MAarray;
}

function RefreshChart() {
    MAarr = MovingAverage(dataDictionary.close, period);

    Plotly.extendTraces('chart', {
        x: [[dataDictionary.date[0]]],
        close: [[dataDictionary.close[0]]],
        high: [[dataDictionary.high[0]]],
        low: [[dataDictionary.low[0]]],
        open: [[dataDictionary.open[0]]],
    }, [0]);
    if(MAtraceInChart) {
        Plotly.extendTraces('chart', {
            x: [[dataDictionary.date[0]]],
            y: [[MAarr[0]]],
        }, [1]);
    }

    Plotly.relayout('chart',{
        xaxis: {
            range: [dataDictionary.date[dataDictionary.date.length-50], dataDictionary.date[0]],
            rangeslider: {
                visible: true
            }
        }
    });

    Plotly.newPlot('chart', data, layout);
}


requestData(url);

setInterval(function (){
    requestData(url);
}, 60000);