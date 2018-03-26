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


// wait the required amount of time then sort the input array
function waitAndSort(inArray, next){
    delay().then(function(){
        next(undefined, inArray.sort((a,b) => { return b - a; } ));
    }).catch(function(err){
        next(err);
    });
}

server.method('waitAndSort', waitAndSort, {
    cache: {
        expiresIn: 30000,
        generateTimeout: 16000
    },
    generateKey: function(opts) {
        return JSON.stringify(opts);
    }
});

// THIRD ROUTE
server.route({
    method: 'POST',
    path: '/cache',
    handler: (request, reply) => {
        let inArray = request.payload.inArray;
        server.methods.waitAndSort(inArray, function(err, outArray) {
            if(!err){
                return reply({ outArray: outArray }).header('Content-Type', 'application/json');
            } else {
                //TODO global error handling
                return reply(err);
            }
        });
    },
    config: {
        validate: {
            payload: {
                inArray: Joi.array().items(Joi.number().integer().required()).required()
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