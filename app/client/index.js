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


var parseArgs = require('minimist');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader'); 
var yargs = require('yargs');

var packageDefinition = protoLoader.loadSync(
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

var hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;
var user_proto = grpc.loadPackageDefinition(packageDefinitionUser).user;
var documet_proto = grpc.loadPackageDefinition(packageDefinitionDocument).document;


function main() {
  var argv = parseArgs(process.argv.slice(2), {
    string: 'target'
  });
  var target;
  if (argv.target) {
    target = argv.target;
  } else {
    target = 'localhost:50051';
  }

  var clientUser = new user_proto.User(target, grpc.credentials.createInsecure());

  function loginShortcut(){
    clientUser.login({name: 'Jorge'}, function(err, response) {
      console.log('Resposta:', response);
    })
  }

  var clientDocument = new documet_proto.Document(target, grpc.credentials.createInsecure());

  function createDocumentShortcut(){
    clientDocument.createDocument({id: 2, titulo: 'Documento 2', ultimaAtualizacao: 0, autor: 2 }, function(err, response) {
      console.log('Resposta:', response);
    })
  }

  function findAllDocumentsShortcut(){
    clientDocument.findAllDocuments({test:1}, function(err, response) {
      console.log('Resposta:', response);
    })
  }

  const args = yargs(process.argv.slice(2)).argv;
  const functionName = args._[0];

  switch (functionName) {
    case 'login':
      loginShortcut();
      break;
    
    case 'create-document':
      createDocumentShortcut();
      break;
    
    case 'find-all-documents':
      findAllDocumentsShortcut();
      break;

  
    default:
      console.log('Função não reconhecida', functionName);
      break;
  }
}

main();
