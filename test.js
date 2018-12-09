var apiKey = "PC55IMQVIAWCD1X9";
var url = "https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=EUR&to_symbol=USD&interval=1min&apikey=" + apiKey;
var finalData;
var firstRun = true;

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
    console.log(json);
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

var MAtraceInChart = false;
function CreateChart() {
    var trace = {
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

    var MovingAverageTrace;
    var button = document.getElementById("button");
    button.addEventListener("click", function(){
        if(MAtraceInChart === true) {
            MAtraceInChart = false;
            Plotly.deleteTraces('chart', 2);
        }
        MAtraceInChart = true;
        var input = document.getElementById('input');
        var period = input.value;

        var numberPrices = [];
        for(var i = 0; i < dataDictionary.close.length; i++) {
            numberPrices.push(parseFloat(dataDictionary.close[i]));
        }

        var averagedPrices = movingAverage(period, numberPrices);

        MovingAverageTrace = {
            x: dataDictionary.date,
            y: averagedPrices,
            type: 'scatter'
        };
    });

    var data = [trace, MovingAverageTrace];

    var layout = {
        title: 'EURUSD 1MIN Chart',
        font: {
            family: 'Lato',
            size: 20,
        },
        dragmode: 'turntable',
        showlegend: false,
        xaxis: {
            range: [dataDictionary.date[dataDictionary.date.length-50], dataDictionary.date[0]],
            title: 'Date',
            titlefont: {
                color: 'black',
                size: 15
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
                        label: 'H1',
                        step: 'minute',
                        stepmode: 'backward'
                    },
                    {step: 'all'}
                ]},
            rangeslider: {range: [dataDictionary.date[0], dataDictionary.date[dataDictionary.date.length-50]]},
        },
        yaxis: {
            title: 'Price',
            titlefont: {
                size: 15
            },
        },
    };

    Plotly.plot('chart', data, layout, {responsive: true});
}

function RefreshChart() {
    console.log("refreshing");
    var extendedTrace =  {
        x: [[dataDictionary.date[dataDictionary.date.length-1]]],
        close: [[dataDictionary.close[dataDictionary.close.length-1]]],
        high: [[dataDictionary.high[dataDictionary.high.length-1]]],
        low: [[dataDictionary.low[dataDictionary.low.length-1]]],
        open: [[dataDictionary.open[dataDictionary.open.length-1]]]
    };
    Plotly.extendTraces('chart', extendedTrace, [0]);

    Plotly.relayout('chart',{
        xaxis: {
            range: [dataDictionary.date[dataDictionary.date.length-50], dataDictionary.date[0]],
            rangeslider: {
                visible: false
            }
        }
    });
}


var singleMA = function (position, period, priceArray) {
    var sum = 0;
    for(var i = priceArray.length - 1 - position; i >= priceArray.length - 1 - period - position; i--) {
        if(i > 0) {
            sum += priceArray[i];
        }
    }
    return sum/period;
};

var movingAverage = function (period, priceArray) {
    var MAarray = [];
    if(period > priceArray.length-1) {
        period = priceArray.length-1;
    }

    for(var k = 0; k < period; k++) {
        MAarray.push(singleMA(k, period, priceArray));
    }

    return MAarray;
};



requestData(url);
CreateChart();

var interval = 13000;

setInterval(function() {
    // requestData(url);



}, interval);


