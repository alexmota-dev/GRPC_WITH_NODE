var PROTO_PATH_USER = __dirname + '/../protos/user.proto';
var PROTO_PATH_DOCUMENT = __dirname + '/../protos/document.proto';
var PROTO_PATH_NOTE = __dirname + '/../protos/note.proto';



var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
const dataUSers = require('../database');
const colors = require('../utils/colors');

var packageDefinitionUser= protoLoader.loadSync(
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

var packageDefinitionNote = protoLoader.loadSync(
  PROTO_PATH_NOTE,
  {keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });

var user_proto = grpc.loadPackageDefinition(packageDefinitionUser).user;
var document_proto = grpc.loadPackageDefinition(packageDefinitionDocument).document;
var note_proto = grpc.loadPackageDefinition(packageDefinitionNote).note;


var documents = [{id: 1, title: 'Documento 1', latestUpdate: new Date(), author: 'Alex', acess: ['Alex'] }]

var notes = [{id: 1, title: 'Nota 1', text: 'texto da nota' , beingEdited: false, userWhoIsEditing: "", idDocument: 1}]

async function auth(name) {

  users = await dataUSers();

  for(i=0; i < users.length; i++){
    if(users[i].name == name){
      console.log(users[i],"=",name);
      return true
    }
  }
  console.log("nao autorizado",name);
  return false;
}

async function userHasAcessIsDocument(name, idDocument) {

  for(j=0; j< documents.length; j++){
    if(documents[j].id == idDocument && documents[j].acess.includes(name)){
      return true
    }
  
  }

  return false;
}

async function checksUserHasAccessDocument(userAuth, idDocument){

  if(!(await userHasAcessIsDocument(userAuth, idDocument))){
    errorMessage = colors.red + 'Usuário não tem acesso ao documento.' + colors.reset;
    return errorMessage;
  }
  return false;
}

async function verifyUserIsAuthorized(userAuth){
  
  if(!(await auth(userAuth))){

    var errorMessage = colors.red + 'Usuário não authorizado.' + colors.reset;
    return errorMessage;
  }
}

async function checkDocumentExists(idDocument){

  for(i=0;i<documents.length;i++){

    if(documents[i].id == idDocument){
      return true;
    }
  }

  var errorMessage = colors.red + 'Documento não existe.' + colors.reset;
  return errorMessage;
}

function findNoteById(idNote){

  for(i=0; i< notes.length; i++){
    if(notes[i].id == idNote){
      return notes[i];
    }
  }
  return null;
}

async function documentHasNote(idNote, idDocument) {
  
  var note = findNoteById(idNote);
  for(j=0; j< documents.length; j++){
    if(documents[j].id == idDocument && note.idDocument == idDocument){
      return true
    }
  
  }

  return false;
}

function generetedDocumentId(){
  return documents.length+1;
}

function generetedNoteId(){
  return notes.length+1;
}

async function createDocument(call, callback) {
  
  var author = call.request.userAuth;
  var id = generetedDocumentId();
  var title = call.request.title;
  var acess = [call.request.userAuth];

  if(!(await auth(author))){

    var errorMessage = colors.red + 'Usuário não authorizado' + colors.reset;
    callback(null, {errorMessage: errorMessage});
    return;

  }

  var documentCreated = {id: id, title: title, latestUpdate: new Date(), author: author, acess: acess};
  documents.push(documentCreated);

  var message = colors.green + 'Documento criado' + colors.reset;
  callback(null, {message: message});
}

async function createNote(call, callback) {
  
  var id = generetedNoteId();
  var userAuth = call.request.userAuth;
  var idDocument = call.request.idDocument;
  var title = call.request.title;
  var text = call.request.title;

  errorMessage = await verifyUserIsAuthorized(userAuth);
  errorMessage = await checksUserHasAccessDocument(userAuth, idDocument);
  if(errorMessage){
    callback(null, {errorMessage: errorMessage});
    return;
  }

  notes.push({id:id, title: title, text: text, beingEdited: false, userWhoIsEditing: "", idDocument: call.request.idDocument});
  var message = colors.green + 'Nota criada.' + colors.reset;
  callback(null, {message: message});
}

async function findAllNotesByDocument(call, callback) {
  
  var userAuth = call.request.userAuth;
  var idDocument = call.request.idDocument;
  var errorMessage = "default";
  if(!(await auth(userAuth))){

    errorMessage = colors.red + 'Usuário não authorizado.' + colors.reset;
    callback(null, {errorMessage: errorMessage});
    return;
  }

  errorMessage = await checksUserHasAccessDocument(userAuth, idDocument);
  if(errorMessage){
    callback(null, {errorMessage: errorMessage});
    return;
  }

  var notesWithAcess = [];
  for(i=0;i<notes.length;i++){

    if(notes[i].idDocument == idDocument){
      notesWithAcess.push(notes[i]);
    }
  }

  if(notesWithAcess.length < 1){
    var errorMessage = colors.red + 'Nenhuma nota encontrada.' + colors.reset;
    callback(null, {errorMessage: errorMessage});
    return;
  }

  var message = colors.green + 'Sucesso ao buscar as notas.' + colors.reset;
  callback(null, {message: message, notesWithAcess: notesWithAcess});
}

async function showNote(call, callback){
  
  var idNote = call.request.idNote;
  console.log("showNote: ", idNote);
  var userAuth = call.request.userAuth;
  console.log("userAuth: ", userAuth);
  var note = findNoteById(idNote);
  console.log("note: ", note);

  if(note == null){
    var errorMessage = colors.red + 'Nota não existe.' + colors.reset;
    callback(null, {errorMessage: errorMessage});
    return;
  }
  var idDocument = note.idDocument;
  errorMessage = await checksUserHasAccessDocument(userAuth, idDocument);

  if(errorMessage){
    callback(null, {errorMessage: errorMessage});
    return;
  }

  
  var message = colors.green + 'Sucesso ao buscar Nota.' + colors.reset;
  console.log(message);
  callback(null, {note: note, message: message});
}

async function editNoteInDocument(call, callback) {

  var userAuth = call.request.userAuth;
  var idDocument = call.request.idDocument;
  var idNote = call.request.idNote;
  var errorMessage = "default";
  if(!(await auth(userAuth))){

    errorMessage = colors.red + 'Usuário não authorizado.' + colors.reset;
    callback(null, {errorMessage: errorMessage});
    return;
  }

  errorMessage = await checksUserHasAccessDocument(userAuth, idDocument);
  if(errorMessage){
    callback(null, {errorMessage: errorMessage});
  }

  if(!(await documentHasNote(idNote, idDocument))){

    errorMessage = colors.red + 'Não existe nota com o id informado neste documento.' + colors.reset;
    callback(null, {errorMessage: errorMessage});
    return;
  }
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

async function findAllUsers(call, callback) {

  console.log("chamou a funcao userAll");
  userAuth = call.request.userAuth;
  console.log("o userAuth e: " + userAuth);

  errorMessage = await verifyUserIsAuthorized(userAuth);
  if(errorMessage){
    callback(null, {errorMessage: errorMessage});
    return;
  }

  users = await dataUSers();
  console.log(users);

  var message = colors.green + 'Sucesso ao buscar os usuários.' + colors.reset;
  console.log(message);
  callback(null, {users: users, message: message});

}

function findAllDocuments(call, callback) {

  callback(null, {documents: documents});

}

async function findDocumentById(call, callback) {

  var userAuth = call.request.userAuth;
  var id = call.request.id;
  console.log("dados recebidos id, userAuth: ", id, userAuth);
  let documentById = {
    id: null,
    title: null,
    latestUpdate: null,
    author: null,
    acess: null,
    notesById: null
  }
  let notesById = [];
  
  errorMessage = await verifyUserIsAuthorized(userAuth);
  errorMessage = await checksUserHasAccessDocument(userAuth, id);
  errorMessage = await checkDocumentExists(id);

  for(i=0;i<documents.length;i++){

    if(documents[i].id == id){
      documentById.id = documents[i].id;
      documentById.title = documents[i].title;
      documentById.latestUpdate = documents[i].latestUpdate;
      documentById.author = documents[i].author;
      documentById.acess = documents[i].acess;

    }
  }

  
  for(i=0;i<notes.length;i++){
    
    if(notes[i].idDocument == id){
      notesById.push(notes[i]);
    }
  }
  
  errorMessage = documentById == null ? colors.red + 'Nenhum documento encontrado.' + colors.reset : errorMessage;
  errorMessage = notesById == null ? colors.red + 'Nenhuma nota encontrada.' + colors.reset : errorMessage;

  console.log("a mensagem de erro é errorMessage", errorMessage);
  if(errorMessage){
    callback(null, {errorMessage: errorMessage});
    return;
  }
  console.log("Passou do if do error Message")
  
  documentById.notesById = notesById;
  console.log("Verificando valor do document",documentById);
  var message = colors.green + 'Sucesso ao buscar o documento.' + colors.reset;

  callback(null, {document: documentById, message: message, notes: notesById});

}

async function associateDocumentWithAnotherUser(call, callback) {

  var userAuth = call.request.userAuth;
  var idDocument = call.request.idDocument;
  var newUser = call.request.newUser;

  userIsAuthorized = await auth(userAuth);
  newUser = await auth(newUser);
  documentExists = await checkDocumentExists(idDocument);

  
  errorMessage = await checksUserHasAccessDocument(userAuth, idDocument);
  errorMessage = userIsAuthorized ? errorMessage : colors.red + 'Usuário não authorizado.' + colors.reset;
  console.log('o errorMessage é: ' + errorMessage);
  errorMessage = newUser ? errorMessage : colors.red + 'O novo usuario não é authorizado.' + colors.reset;
  console.log('o errorMessage é: ' + errorMessage);
  errorMessage = documentExists ? errorMessage : colors.red + 'Documento não existe.' + colors.reset;
  console.log('o errorMessage é: ' + errorMessage);
  
  if(errorMessage){
    callback(null, {errorMessage: errorMessage});
    return;
  }

  var message = colors.green + 'Sucesso ao associar o novo usuario ao documento.' + colors.reset;
  callback(null, {message: message});
}



function main() {

  var server = new grpc.Server();

  server.addService(user_proto.User.service, 
    { findAllUsers: findAllUsers
    });


  server.addService(document_proto.Document.service, 
    { createDocument: createDocument,
      findDocumentById: findDocumentById,
      findAllDocuments: findAllDocuments,
      findAllDocumentsWithAcess: findAllDocumentsWithAcess,
      associateDocumentWithAnotherUser: associateDocumentWithAnotherUser
    });
    
  server.addService(note_proto.Note.service,
    { createNote: createNote,
      findAllNotesByDocument: findAllNotesByDocument,
      editNoteInDocument: editNoteInDocument,
      showNote: showNote
    });
    
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
  });

}

main();
