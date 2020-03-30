const resolution = 5;                   // px2
const resultHeight = 30;                // px
const valuesHeight = 30;                // px

var resultColor = "rgb(0, 0, 0)";

var colorMS = [255, 0, 0];              // rgb
var resultColorRendererPos = [0, 0]

var stopped = false;
var isDragging = false;
var maxSaturationColorChanged = false;


function posToCol(x, y, r, g, b) {
    y -= (resultHeight+valuesHeight) * (1-(y-(resultHeight+valuesHeight))/HEIGHT);

    r = ( r + (255-r)*(1-x/WIDTH) ) * (1-y/HEIGHT);
    g = ( g + (255-g)*(1-x/WIDTH) ) * (1-y/HEIGHT);
    b = ( b + (255-b)*(1-x/WIDTH) ) * (1-y/HEIGHT);

    return "rgb("+Math.floor(r)+","+Math.floor(g)+","+Math.floor(b)+")";
}

function rgb_to_hsv(r, g, b) {
    r = r / 255.0;
    g = g / 255.0;
    b = b / 255.0;

    var cmax = Math.max(r, Math.max(g, b)); // maximum of r, g, b
    var cmin = Math.min(r, Math.min(g, b)); // minimum of r, g, b
    var diff = cmax - cmin; // diff of cmax and cmin.
    var h = -1, s = -1;

    // if cmax and cmax are equal then h = 0
    if (cmax == cmin){
        h = 0;}

    // if cmax equal r then compute h
    else if (cmax == r){
        h = (60 * ((g - b) / diff) + 360) % 360;}

    // if cmax equal g then compute h
    else if (cmax == g){
        h = (60 * ((b - r) / diff) + 120) % 360;}

    // if cmax equal b then compute h
    else if (cmax == b){
        h = (60 * ((r - g) / diff) + 240) % 360;}

    // if cmax equal zero
    if (cmax == 0){
        s = 0;}
    else{
        s = (diff / cmax) * 100;}

    // compute v
    var v = cmax * 100;
    return [Math.floor(h), Math.floor(s), Math.floor(v)];

}

function rgb_to_hsl(r,g,b) {
    // Make r, g, and b fractions of 1
    r /= 255;
    g /= 255;
    b /= 255;

    // Find greatest and smallest channel values
    let cmin = Math.min(r,g,b),
        cmax = Math.max(r,g,b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;
    if (delta == 0)
        h = 0;
    // Red is max
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    // Green is max
    else if (cmax == g)
        h = (b - r) / delta + 2;
    // Blue is max
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    // Make negative hues positive behind 360°
    if (h < 0)
        h += 360;

    // Calculate lightness
    l = (cmax + cmin) / 2;

    // Calculate saturation
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    // Multiply l and s by 100
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return [Math.floor(h), Math.floor(s), Math.floor(l)];
}

function rgb_to_cmyk(r, g, b){
    var c = 1 - (r / 255);
    var m = 1 - (g / 255);
    var y = 1 - (b / 255);
    var k = Math.min(c, Math.min(m, y));

    c = (c - k) / (1 - k);
    m = (m - k) / (1 - k);
    y = (y - k) / (1 - k);

    c = Math.round(c * 10000) / 100;
    m = Math.round(m * 10000) / 100;
    y = Math.round(y * 10000) / 100;
    k = Math.round(k * 10000) / 100;

    c = isNaN(c) ? 0 : c;
    m = isNaN(m) ? 0 : m;
    y = isNaN(y) ? 0 : y;
    k = isNaN(k) ? 0 : k;

    return [Math.floor(c), Math.floor(m), Math.floor(y), Math.floor(k)];
}

function makeColorMaxSaturationGradient() {
    var canvas = $("#colorMaxSaturation")[0];

    canvas.width = WIDTH;
    canvas.height = resultHeight;

    var ctx = canvas.getContext("2d");

    var grd = ctx.createLinearGradient(WIDTH/2, 0, WIDTH, 0);
    grd.addColorStop(0, "rgb(255, 0, 0)");
    grd.addColorStop(1/6, "rgb(255, 255, 0)");
    grd.addColorStop(2/6, "rgb(0, 255, 0)");
    grd.addColorStop(3/6, "rgb(0, 255, 255)");
    grd.addColorStop(4/6, "rgb(0, 0, 255)");
    grd.addColorStop(5/6, "rgb(255, 0, 255)");
    grd.addColorStop(1, "rgb(255, 0, 0)");

    ctx.fillStyle = grd
    ctx.fillRect(WIDTH/2, 0, WIDTH, resultHeight);
}

function makeSelectedColorSaturationGradient(){
    var canvas = $("#selectedColorSaturation")[0];

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    var ctx = canvas.getContext("2d");

    for(var y=resultHeight+valuesHeight; y<HEIGHT; y+=resolution) {
        for(var x=0; x<WIDTH; x+=resolution) {
            ctx.fillStyle = posToCol(x, y, colorMS[0], colorMS[1], colorMS[2]);
            ctx.fillRect( x, y, resolution, resolution );
        }
    }
}

function renderShowColorMaxSaturation(x, colorMS) {
    var w = 5;

    var canvas = $("#showColorMaxSaturation")[0];

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    var ctx = canvas.getContext('2d');

    ctx.strokeStyle = "black"
    ctx.fillStyle = "rgb("+colorMS[0]+","+colorMS[1]+","+colorMS[2]+")";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.rect(x-w/2, 0, w, resultHeight);

    ctx.fill();
    ctx.stroke();
}

function renderShowResultColor(x, y, resCol) {
    var w = 20;

    var canvas = $("#showResultColor")[0];

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    var ctx = canvas.getContext('2d');

    ctx.strokeStyle = "rgba(0, 0, 0, 0.9)"
    ctx.fillStyle = resCol;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(x, y, w, 0, 2*Math.PI);

    ctx.fill();
    ctx.stroke();
}

function updateValues() {
    var rgbV = resultColor.slice(4, -1);

    var r = parseInt(rgbV.split(",")[0]);
    var g = parseInt(rgbV.split(",")[1]);
    var b = parseInt(rgbV.split(",")[2]);

    var hsv = rgb_to_hsv(r, g, b);
    var cmyk = rgb_to_cmyk(r, g, b);
    var hsl = rgb_to_hsl(r, g, b);

    $(".value#rgbValue").text(rgbV);
    $(".value#hexValue").text("#"+r.toString(16)+g.toString(16)+b.toString(16));
    $(".value#hsvValue").text(hsv[0]+"°, "+hsv[1]+"%, "+hsv[2]+"%");
    $(".value#cmykValue").text(cmyk[0]+"%, "+cmyk[1]+"%, "+cmyk[2]+"%, "+cmyk[3]+"%");
    $(".value#hslValue").text(hsl[0]+"°, "+hsl[1]+"%, "+hsl[2]+"%");

}

$(window).resize(function() {

    WIDTH = $(window).width();
    HEIGHT = $(window).height();

    makeColorMaxSaturationGradient();
    makeSelectedColorSaturationGradient();

    $(".results").css("width", WIDTH);
});

$(window).on("load", function() {
    $("#result").css("height", resultHeight);
    $("#result").css("width", WIDTH);

    $(".results").css("height", valuesHeight);
    $(".results").css("width", WIDTH);

    $(".results").css("top", resultHeight);
    $(".results").css("left", 0);

    $("#showResultColor").css("height", HEIGH);
    $("#showResultColor").css("width", WIDTH);

    $("#showColorMaxSaturation").css("height", resultHeight);
    $("#showColorMaxSaturation").css("width", WIDTH/2);
});

$(document).on("DOMContentLoaded", function() {
    makeColorMaxSaturationGradient();
    makeSelectedColorSaturationGradient();
    renderShowColorMaxSaturation(WIDTH/2, [255, 0, 0]);
});

$(window).mousedown(function(event) {
    isDragging = true;
    changeColorMaxSaturation(event);
});

$(window).mouseup(function(event) {
    isDragging = false;

    if(maxSaturationColorChanged) {
        makeSelectedColorSaturationGradient();
        maxSaturationColorChanged = false;
    }

    resultColor = posToCol(resultColorRendererPos[0], resultColorRendererPos[1], colorMS[0], colorMS[1], colorMS[2]);

    renderShowResultColor(resultColorRendererPos[0], resultColorRendererPos[1], resultColor);
});

$(window).mousemove(changeColorMaxSaturation);

function changeColorMaxSaturation(event) {
    if( isDragging ) {
        var x = event.pageX;
        var y = event.pageY;

        if(y >= resultHeight + valuesHeight) {
            resultColor = posToCol(x, y, colorMS[0], colorMS[1], colorMS[2]);
            resultColorRendererPos = [x, y];

            updateValues();

            $("#result").css("background-color", resultColor);

            renderShowResultColor(x, y, resultColor);
        } else if ( x >= WIDTH/2 && y <= resultHeight) {
            var r = Math.floor(Math.min(255, Math.max(0, 255*(Math.abs(12*x/WIDTH-9)-1))));
            var g = Math.floor(Math.min(255, Math.max(0, 255*(Math.abs(6*Math.abs(2*x/WIDTH-4/3)-3)-1))));
            var b = Math.floor(Math.min(255, Math.max(0, 255*(Math.abs(6*Math.abs(2*x/WIDTH-5/3)-3)-1))));

            colorMS = [r, g, b];
            renderShowColorMaxSaturation(x, colorMS);
            maxSaturationColorChanged = true;
        }
    }
}
