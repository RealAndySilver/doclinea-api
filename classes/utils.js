exports.remove_empty = function trim_nulls(data) {
	//Esta función tomará los datos de entrada
	//y removerá los que lleguen con el value vacío
	var y;
	for (var x in data) {
	y = data[x];
	if (y==="null" || y===null || y==="" || typeof y === "undefined" || (y instanceof Object && Object.keys(y).length == 0)) {
	  delete data[x];
	}
	if (y instanceof Object) y = trim_nulls(y);
	}
	return data;
};

exports.isJson = function(str) {
	//Esta función verifica si el parámetro de entrada es un JSON ó no
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

exports.regexForString = function (string){
	//esta función regresa un objeto para crear un query
	//con capácidad de búsqueda por regex con string
	return { $regex: string, $options: 'i' };
};

exports.log = function(service_name, request, json){
	//Esta función crea un log con colores diferenciables
	//y hace un poco más sencilla su lectura en la consola
	console.log(new Date().toISOString()+": "+service_name.blue +" "+ request.green+" "+ json.cyan);	
};