var patternData = neutronADT;

window.onload = function () {
	new Main();
	new Menu();
	new Search();
	new KeyboardNav();
	new CodeFrame();
};

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

