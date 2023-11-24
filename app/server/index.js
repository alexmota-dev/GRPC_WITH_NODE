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
var PROTO_PATH_DOCUMENT = __dirname + '/../protos/document.proto';


var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
const dataUSers = require('../database');
const { number } = require('yargs');

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

var packageDefinitionDocument = protoLoader.loadSync(
  PROTO_PATH_DOCUMENT,
  {keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });

var hello_proto = grpc.loadPackageDefinition(packageDefinitionHello).helloworld;
var user_proto = grpc.loadPackageDefinition(packageDefinitionUser).user;
var document_proto = grpc.loadPackageDefinition(packageDefinitionDocument).document;

// var users = [
//   {id: 1, name: 'Alex', password: '123456', email: 'alex@alex'},
//   {id: 2, name: 'Maria', password: '123456', email: 'maria@maria'},
//   {id: 3, name: 'Jorge', password: '123456', email: 'jorge@jorge'},
//   {id: 4, name: 'Weslley', password: '123456', email: 'weslley@weslley'},
//   {id: 5, name: 'Andre', password: '123456', email: 'andre@andre'},
//   {id: 6, name: 'Kauan', password: '123456', email: 'kauan@kauan'}]

var documents = [{id: 1, titulo: 'Documento 1', ultimaAtualizacao: 0, autor: 1, acesso: [1] }]

var notas = [{id: 1, titulo: 'Nota 1', texto: 'texto da nota' , sendoEditada: false, UserEditando: 0, idDocumento: 1}]







/**
 * Implements the methods hello
 */
function sayHello(call, callback) {
  callback(null, {message: 'Hello ' + call.request.name});
}

/**
 * Implements the methods user
 */

async function login(call, callback) {
  var userName = call.request.name;
  users = await dataUSers();
  console.log(users);

  for(i=0; i < users.length; i++){
    if(users[i].name == userName){
      return callback(null, {message: 'Acesso permitido', token: users[i].id});
    }
  }

  callback(null, {message: 'Acesso negado'});
}

function createDocument(call, callback) {
  console.log("Chamou o creteDocument")
  var id = call.request.id;
  var titulo = call.request.titulo;
  var ultimaAtualizacao = call.request.ultimaAtualizacao;
  var autor = call.request.autor;
  var acesso = [call.request.autor];

  var documentCreated = {id: id, titulo: titulo, ultimaAtualizacao: ultimaAtualizacao, autor: autor, acesso: acesso};
  documents.push(documentCreated);
  console.log("Encerrou o creteDocument")
  callback(null, {message: 'Criado com sucesso'});
}

function findAllDocuments(call, callback) {
  console.log("Chamou o findAllDocuments")
  callback(null, {documents: documents});
}

/**
 * Starting Server
 */
function main() {
  var server = new grpc.Server();
  server.addService(hello_proto.Greeter.service, {sayHello: sayHello});
  server.addService(user_proto.User.service, { login: login});
  server.addService(document_proto.Document.service, { createDocument: createDocument, findAllDocuments: findAllDocuments});
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
  });
}

main();
