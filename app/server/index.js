var PROTO_PATH = __dirname + '/../protos/helloworld.proto';
var PROTO_PATH_USER = __dirname + '/../protos/user.proto';
var PROTO_PATH_DOCUMENT = __dirname + '/../protos/document.proto';


var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
const dataUSers = require('../database');

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

var documents = [{id: 1, titulo: 'Documento 1', ultimaAtualizacao: 0, autor: 1, acesso: [1] }]

var notas = [{id: 1, titulo: 'Nota 1', texto: 'texto da nota' , sendoEditada: false, UserEditando: 0, idDocumento: 1}]

function sayHello(call, callback) {
  callback(null, {message: 'Hello ' + call.request.name});
}

async function login(call, callback) {

  var userName = call.request.name;
  users = await dataUSers();

  for(i=0; i < users.length; i++){
    if(users[i].name == userName){
      return callback(null, {message: 'Acesso permitido', token: users[i].id});
    }
  }

  callback(null, {message: 'Acesso negado'});
}

function createDocument(call, callback) {

  var id = call.request.id;
  var titulo = call.request.titulo;
  var ultimaAtualizacao = call.request.ultimaAtualizacao;
  var autor = call.request.autor;
  var acesso = [call.request.autor];

  var documentCreated = {id: id, titulo: titulo, ultimaAtualizacao: ultimaAtualizacao, autor: autor, acesso: acesso};
  documents.push(documentCreated);

  callback(null, {message: 'Criado com sucesso'});
}

function findAllDocuments(call, callback) {

  callback(null, {documents: documents});

}

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
