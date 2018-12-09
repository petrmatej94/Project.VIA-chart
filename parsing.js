var url = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,DASH,BTC,REP&tsyms=USD";


var indicators = {
  "MA": 200,

};



var data = [];


var xmlHttp = null;
var prices = [];
var dates = [];
var lastPrice;
var currPrice;

function requestData()
{
    xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = ProcessRequest;
    xmlHttp.open("GET", url, true);
    xmlHttp.send();
}


function ProcessRequest()
{
    if(xmlHttp.readyState === 4 && xmlHttp.status === 200)
    {
        if(xmlHttp.responseText === "Not found")
        {
            console.log("Request failed");
        }
        else
        {
            var info = eval ( "(" + xmlHttp.responseText + ")" );
            currPrice = info["BTC"]["USD"];

            if(lastPrice !== currPrice || prices.length === 0) {
                lastPrice = currPrice;
                data.push({price: currPrice, date: Date.now()});
                // prices.push(currPrice);
                // dates.push(Date.now());
                console.log(data);
            }
        }
    }
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



var testprices = [];

var randArray = function (){
    testprices = [];
    for(var i = 0; i < 200; i++) {
        testprices.push(Math.random());
    }
};

var trace1 = {
    x: [],
    y: [],
    mode: "line"
};

// Plotly.plot('chart',[{
//     y:testprices,
//     type:'line'
// }]);


var cnt = 0;
var max_cnt = 100;
var interval = 1000;
var lastAddedPrice = 0;



setInterval(function() {
    requestData();

    // if(lastPrice !== lastAddedPrice) {
    //     lastAddedPrice = prices[prices.length-1];
    //     Plotly.extendTraces('chart',{ y:[[prices[prices.length-1]]]}, [0]);
    //     cnt++;
    // }


    randArray();
    // console.log(movingAverage(200, testprices));

    for(var i = 0; i < 200; i++){
        dates.push(Date().toString());
    }

    var trace1 = {
        x: dates,
        y: testprices,
        mode: "line"
    };

    var data = [trace1];

    Plotly.plot('chart', data);

    // if(cnt > max_cnt) {
    //     Plotly.relayout('chart',{
    //         xaxis: {
    //             range: [cnt-max_cnt,cnt]
    //         }
    //     });
    // }


    //
    // var keys = Object.keys(symbols);
    //
    // for (var i = 0; i < keys.length; i++) {
    //     price = symbols[keys[i]];
    //
    //     // request data for symbol
    // }


    console.log();


},interval);