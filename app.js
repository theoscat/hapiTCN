'use strict';
//Load env variable
require('dotenv').config({path: __dirname + '/.env'});

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: process.env.PORT });

//FIRST ROUTE
server.route({
    method: 'GET',
    path: '/hello/{param?}',
    handler: (request, reply) => {
        return reply({
            'hello': request.params.param ? encodeURIComponent(request.params.param) : null
        }).header('Content-Type', 'application/json');
    }

});


server.start(function(err){
    if(err){
        console.error(err);
    } else {
        console.log('Hapi server successfully started');
    }
});