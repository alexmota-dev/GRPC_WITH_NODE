var PROTO_PATH_USER = __dirname + '/../protos/user.proto';
var PROTO_PATH_DOCUMENT = __dirname + '/../protos/document.proto';
var PROTO_PATH_NOTE = __dirname + '/../protos/note.proto';



const readline = require('readline');
var parseArgs = require('minimist');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader'); 
const colors = require('../utils/colors');

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

var packageDefinitionNote = protoLoader.loadSync(
  PROTO_PATH_NOTE,
  {keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });

var user_proto = grpc.loadPackageDefinition(packageDefinitionUser).user;
var documet_proto = grpc.loadPackageDefinition(packageDefinitionDocument).document;
var note_proto = grpc.loadPackageDefinition(packageDefinitionNote).note;




const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
  var clientDocument = new documet_proto.Document(target, grpc.credentials.createInsecure());
  var clientNote = new note_proto.Note(target, grpc.credentials.createInsecure());


  function stopGRPCClients() {
    clientDocument.close(); // Close the document gRPC client
    clientNote.close();
  }

  // 1 CRIAR UM DOCUMENTO
  function createDocumentShortcut(callback){

    rl.question('Quem é o author do documento: ', (userAuth) => {
      rl.question('Título do documento: ', (title) => {
        clientDocument.createDocument({userAuth: userAuth, title: title}, function(err, response) {
          if(response.errorMessage){
            console.log(response.errorMessage);
          }
          else if(response.message){
            console.log(response.message);
          }
          callback(true);
        })
      });
    });
  }
  
  //2 CRIAR UMA NOTA EM UM DOCUMENTO
  function createNoteShortcut(callback){

    rl.question('Usuario: ', (userAuth) => {
      rl.question('Id do Documento: ', (idDocument) => {
        rl.question('Título da nota: ', (title) => {
          rl.question('Texto da nota: ', (text) => {
            clientNote.createNote({idDocument:idDocument, text:text, userAuth: userAuth, title: title}, function(err, response) {
              if(response.errorMessage){
                console.log(response.errorMessage);
              }
              else if(response.message){
                console.log(response.message);
              }
              callback(true);
            })
          });
        });
      });
    });
  }

  // 3 EDITAR UMA NOTA EM UM DOCUMENTO
  function editNoteInDocumentShortcut(callback){

    rl.question('Usuario: ', (userAuth) => {
      rl.question('Id do Note: ', (idNote) => {
        clientNote.editNoteInDocument({idNote:idNote, userAuth: userAuth}, function(err, response) {
          if(response.errorMessage){
            console.log(response.errorMessage);
            callback(true);
          }
          else if(response.message){
            console.log("Entrou aqui entao vem mais texto")
            console.log(response.message);
            rl.question('Titulo da nota: ', (title) => {
              rl.question('Texto da nota: ', (text) => {
                clientNote.secondPartOfEditing({text:text, title: title, idNote: idNote}, function(err, responseSecondPart) {
                  if(responseSecondPart.message){
                    console.log(responseSecondPart.message);
                  }
                  callback(true);
                })
              })
            })
          }
        })
      });
    });
  }
  // 4 LISTAR O CONTEÚDO DE UMA NOTA
  function showNoteShortcut(callback){

    rl.question('Usuario: ', (userAuth) => {
      rl.question('Id da Nota: ', (idNote) => {
        clientNote.showNote({idNote:idNote, userAuth: userAuth}, function(err, response) {
          if(response.errorMessage){
            console.log(response.errorMessage);
          }
          else if(response.message && response.note){
            console.log(response.message);
            console.log(response.note);
          }
          callback(true);
        })
      });
    })
  }

  // 5 LISTAR O CONTEÚDO DE UM DOCUMENTO (todas as notas)
  function findAllNotesByDocumentShortcut(callback){
    rl.question('Usuario: ', (userAuth) => {
      rl.question('Id do Documento: ', (idDocument) => {
        clientNote.findAllNotesByDocument({userAuth: userAuth, idDocument: idDocument}, function(err, response) {
          if(response.errorMessage){
            console.log(response.errorMessage);
          }
          else if(response.message && response.notesWithAcess){
            console.log(response.message);
            console.log(response.notesWithAcess);
          }
          callback(true);
        });
      });
    })
  }

  // 6 APRESENTAR DETALHES SOBRE UM DOCUMENTO
  function showDocumentShortcut(callback){

    rl.question('Usuario: ', (userAuth) => {
      rl.question('Id do Documento: ', (idDocument) => {
        clientDocument.showDocument({idDocument:idDocument, userAuth: userAuth}, function(err, response) {
          if(response.errorMessage){
            console.log(response.errorMessage);
          }
          else if(response.message && response.document){
            console.log(response.message);
            console.log(response.document);
            console.log(response.notes);

          }
          callback(true);
        })
      });
    })
  }

  // 7 LISTAR USUÁRIOS EXISTENTES NO SERVIDOR
  function findAllUsersShortcut(callback){

    rl.question('Usuario: ', (userAuth) => {
      clientUser.findAllUsers({userAuth: userAuth}, function(err, response) {
        if(response.errorMessage){
          console.log(response.errorMessage);
        }
        else if(response.message && response.users){
          console.log(response.message);
          console.log(response.users);
        }
        callback(true);
      })
    });
  }

  //8 ASSOCIAR OUTRO USUÁRIO AO DOCUMENTO
  function associateDocumentWithAnotherUserShortcut(callback){

    rl.question('Usuario: ', (userAuth) => {
      rl.question('Id do Documento: ', (idDocument) => {
        rl.question('Novo Usuário: ', (newUser) => {
          clientDocument.associateDocumentWithAnotherUser({idDocument:idDocument, userAuth: userAuth, newUser: newUser}, function(err, response) {
            if(response.errorMessage){
              console.log(response.errorMessage);
            }
            else if(response.message){
              console.log(response.message);
            }
            callback(true);
          })
        });
      });
    })
  }

  //9 LISTAR DOCUMENTOS COM ACESSO
  function showDocumentsWithAcessShortcut(callback){

    rl.question('Usuario: ', (userAuth) => {
      clientDocument.showDocumentsWithAcess({userAuth: userAuth}, function(err, response) {
        if(response.errorMessage){
          console.log(response.errorMessage);
        }
        else if(response.message && response.documentsWithAcess){
          console.log("Message e documentsWithAcess"); 
          console.log(response.message);
          console.log(response.documentsWithAcess);
        }
        callback(true);
      })
    })
  }

  function findAllDocumentsShortcut(callback){
    clientDocument.findAllDocuments({test:1}, function(err, response) {
      console.log(response);
      callback(true);
    })
  }

  function action(opcao) {
    
    switch (opcao) {
      case '0':
        console.log('>>>');
        stopGRPCClients();
        break;
      case '1':
        console.log('Ação de CRIAR UM DOCUMENTO seria executada aqui.');
        createDocumentShortcut((callback)=>{
          if(callback){
            startMenu();
          }
        });
        break;
      case '2':
        console.log('Ação de CRIAR UMA NOTA EM UM DOCUMENTO seria executada aqui.');
        createNoteShortcut((callback)=>{
          if(callback){
            startMenu();
          }
        })
        break;
      case '3':
        console.log('Ação de EDITAR UMA NOTA EM UM DOCUMENTO seria executada aqui.');
        editNoteInDocumentShortcut((callback)=>{
          if(callback){
            startMenu();
          }
        })
        break;
      case '4':
        console.log('Ação de LISTAR O CONTEÚDO DE UMA NOTA seria executada aqui.');
        showNoteShortcut((callback)=>{
          if(callback){
            startMenu();
          }
        })
        break;
      case '5':
        console.log('Ação de LISTAR O CONTEÚDO DE UM DOCUMENTO (todas as notas) seria executada aqui.');
        findAllNotesByDocumentShortcut((callback)=>{
          if(callback){
            startMenu();
          }
        })
        break;
      case '6':
        console.log('Ação de APRESENTAR DETALHES SOBRE UM DOCUMENTO seria executada aqui.');
        showDocumentShortcut((callback)=>{
          if(callback){
            startMenu();
          }
        })
        break;
      case '7':
        console.log('Ação de LISTAR USUÁRIOS EXISTENTES NO SERVIDOR seria executada aqui.');
        findAllUsersShortcut((callback)=>{
          if(callback){
            startMenu();
          }
        })
        break;
      case '8':
        console.log('Ação de ASSOCIAR OUTRO USUÁRIO AO DOCUMENTO seria executada aqui.');
        associateDocumentWithAnotherUserShortcut((callback)=>{
          if(callback){
            startMenu();
          }
        })
        break;
      case '9':
        console.log('Ação de LISTAR DOCUMENTOS COM ACESSO apresentando o título de cada documento seria executada aqui.');
        showDocumentsWithAcessShortcut((callback)=>{
          if(callback){
            startMenu();
          }
        });
        break;
      case '10':
        console.log('Ação de LISTAR DOCUMENTOS COM ACESSO ALTERADOS A PARTIR DE UMA DATA/HORA seria executada aqui.');
        break;
      case '11':
        console.log("Exibi Todos os Documentos sem restrição");
        findAllDocumentsShortcut((callback)=>{
          if(callback){
            startMenu();
          }
        })
      default:
        console.log('Opção inválida!');
        startMenu();
        break;
    }
  }
  
  function showMenu() {
    console.log('\nMENU PRINCIPAL');
    console.log('Escolha uma opção:');
    console.log('[0]  - '+ colors.green +'Fechar Client' + colors.reset);
    console.log('[1]  - '+ colors.green +'Criar um documento' + colors.reset);
    console.log('[2]  - '+ colors.green +'Criar uma nota em um documento'+ colors.reset);
    console.log('[3]  - Editar uma nota em um documento');
    console.log('[4]  - '+ colors.green +'Listar o conteúdo de uma nota'+ colors.reset);
    console.log('[5]  - '+ colors.green +'Listar o conteúdo de um documento (todas as notas)'+ colors.reset);
    console.log('[6]  - '+ colors.green +'Apresentar detalhes sobre um documento' + colors.reset);
    console.log('[7]  - '+ colors.green +'Listar usuários existentes no servidor'+ colors.reset);
    console.log('[8]  - '+ colors.green +'Associar outro usuário ao documento'+ colors.reset);
    console.log('[9]  - '+ colors.green +'Listar documentos com acesso'+ colors.reset);
    console.log('[10] - Listar documentos com acesso alterados a partir de uma data/hora');
    console.log('[11] - '+ colors.green +'Listar Todos os DOcumentos sem restrição'+ colors.reset);

  }
  
  function startMenu() {
    showMenu();
    rl.question('Escolha uma opção: ', (opcao) => {
      action(opcao);
    });
  }
  

  startMenu();
}

main();
