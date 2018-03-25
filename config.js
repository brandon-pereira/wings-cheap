var config = { // Default options
	env: process.env.NODE_ENV,
	isDev: true,
	port: 8000
};

var production = {
	isDev: false,
	port: 3000
};

if(config.env === 'production') {
	Object.assign(config, production);
}

module.exports = config;