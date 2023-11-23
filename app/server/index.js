/*
 *
 * Copyright 2015 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

var PROTO_PATH = __dirname + '/../protos/helloworld.proto';
var PROTO_PATH_USER = __dirname + '/../protos/user.proto';


var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinitionHello = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });

var packageDefinitionUser = protoLoader.loadSync(
  PROTO_PATH_USER,
  {keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });



var hello_proto = grpc.loadPackageDefinition(packageDefinitionHello).helloworld;
var user_proto = grpc.loadPackageDefinition(packageDefinitionUser).user;

/**
 * Implements the methods hello
 */
function sayHello(call, callback) {
  callback(null, {message: 'Hello ' + call.request.name});
}

/**
 * Implements the methods user
 */

function login(call, callback) {
  var userName = call.request.name;
  console.log('userName', userName);
  if(userName == 'Alex') {
    callback(null, {message: 'Acesso liberado ' + userName});
  }
  else{
    callback(null, {message: 'Acesso negado'});
  }
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  var server = new grpc.Server();
  server.addService(hello_proto.Greeter.service, {sayHello: sayHello});
  server.addService(user_proto.User.service, { login: login});
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
  });
}

main();
