'use strict';

// Load env variable
require('dotenv').config({path: __dirname + '/.env'});

const Hapi = require('hapi');
const Joi = require('joi');

const server = new Hapi.Server();
server.connection({ port: process.env.PORT });

//function adding the 2 sec delay required
async function delay() {
    await new Promise(res => setTimeout(res, process.env.DELAY));
}


// FIRST ROUTE
server.route({
    method: 'GET',
    path: '/hello/{param?}',
    handler: (request, reply) => {
        return reply({
            'hello': request.params.param ? encodeURIComponent(request.params.param) : null
        }).header('Content-Type', 'application/json');
    }

});


// SECOND ROUTE
server.route({
    method: 'POST',
    path: '/test',
    handler: (request, reply) => {
        delay().then(function(){
            return reply({ ok: 1 }).header('Content-Type', 'application/json');
        }).catch(function(err){
            //TODO global error handling
            return reply(err);
        });
    },
    config: {
        validate: {
            payload: {
                email: Joi.string().email().required(),
                mdp: Joi.string().regex(/^\d+$/).required()
                // mdp: Joi.number().integer().positive().required() //Not validating huge number (integer limit)
            }
        }
    }
});


server.start(function(err){
    if(err){
        console.error(err);
    } else {
        console.log('Hapi server successfully started');
    }
});