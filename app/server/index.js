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

var documents = [{id: 1, title: 'Documento 1', latestUpdate: new Date(), author: 1, acess: [1] }]

var notas = [{id: 1, title: 'Nota 1', text: 'texto da nota' , beingEdited: false, userWhoIsEditing: 0, idDocument: 1}]

function sayHello(call, callback) {
  callback(null, {message: 'Hello ' + call.request.name});
}

async function auth(name) {

  users = await dataUSers();

  for(i=0; i < users.length; i++){
    if(users[i].name == name){
      return true
    }
  }

  return false;
}

function generetedDocumentId(){
  for(i = 0;i<documents.length;i++){
    if(documents[i].id == i){
      return i+1;
    }
  }
}

async function createDocument(call, callback) {
  
  var author = call.request.userAuth;
  if(!(await auth(author))){
    console.log('Usuário não authorizado');
    callback(null, {message: 'Usuário não authorizado'});
    return;
  }

  console.log('Usuário authorizado');

  var id = generetedDocumentId();
  var title = call.request.title;
  var acess = [call.request.userAuth];

  var documentCreated = {id: id, title: title, latestUpdate: new Date(), author: author, acess: acess};
  documents.push(documentCreated);

  callback(null, {message: 'Criado com sucesso'});
}

function findAllDocumentsWithAcess(call, callback) {
  var documentsWithAcess = [];
  for(i=0;i<documents.length;i++){
    if(documents[i].acess.includes(call.request.userAuth)){
      documentsWithAcess.push(documents[i]);
    }
  }
  callback(null, {documentsWithAcess: documentsWithAcess});

}

function findAllDocuments(call, callback) {

  callback(null, {documents: documents});

}



function main() {

  var server = new grpc.Server();

  server.addService(document_proto.Document.service, 
    { createDocument: createDocument,
      findAllDocuments: findAllDocuments,
      findAllDocumentsWithAcess: findAllDocumentsWithAcess
    });
    
  server.addService(note_proto.Note.service,
    { createNote: createNote,
    });
    
  server.addService(document_proto.Document.service, { createDocument: createDocument, findAllDocuments: findAllDocuments});
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
  });

}

main();
