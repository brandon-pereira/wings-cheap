module.exports = function toJSON(string) {
	if(string !== null && typeof string === 'object') {
		return string;
	}
	var json = {};
	try {
		json = JSON.parse(string);
	} catch(e) {
		console.log("invalid json", string);
	}
	return json;
};