var Hapi = require('hapi');
var Joi =require('joi');
var server = new Hapi.Server(process.env.PORT || 3000);
var mysql = require ('mysql');
var config =require('./config');

var gammuDB=mysql.createConnection(config.connectionObject);

server.route({
    method: 'GET',
    path: '/sendSMS/{phoneNumber}/{message}/{secret}',
    handler: function (request, reply) {
        var post = {DestinationNumber: request.params.phoneNumber, TextDecoded: request.params.message};
	    gammuDB.query('INSERT INTO outbox SET ?', post, function (err, result) {
	      if (err)
	         reply(err.toString());
	      if (result)
	         reply(JSON.stringify(result));
	    });
    },
     config: {
        validate: {
            params: {
                phoneNumber: Joi.string().min(12).max(12).required(),
                message:Joi.string().required().min(1).max(160),
                secret:Joi.string().regex(config.secret)
            }
        }
    }
});
server.start(function () {
    console.log('Server running at:', server.info.uri);
});