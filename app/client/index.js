var PROTO_PATH_DOCUMENT = __dirname + '/../protos/document.proto';
var PROTO_PATH_NOTE = __dirname + '/../protos/note.proto';



const readline = require('readline');
var parseArgs = require('minimist');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader'); 
const colors = require('../utils/colors');

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

  var clientDocument = new documet_proto.Document(target, grpc.credentials.createInsecure());
  var clientNote = new note_proto.Note(target, grpc.credentials.createInsecure());


  function stopGRPCClients() {
    clientDocument.close(); // Close the document gRPC client
    clientNote.close();
  }

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

  function createNoteShortcut(callback){

    rl.question('Usuario: ', (userAuth) => {
      rl.question('Id do Documento: ', (idDocument) => {
        rl.question('Título da nota: ', (title) => {
          rl.question('Texto da nota: ', (text) => {
            clientNote.editNoteInDocument({idDocument:idDocument, text:text, userAuth: userAuth, title: title}, function(err, response) {
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
        break;
      case '4':
        console.log('Ação de LISTAR O CONTEÚDO DE UMA NOTA seria executada aqui.');
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
        break;
      case '7':
        console.log('Ação de LISTAR USUÁRIOS EXISTENTES NO SERVIDOR seria executada aqui.');
        break;
      case '8':
        console.log('Ação de ASSOCIAR OUTRO USUÁRIO AO DOCUMENTO seria executada aqui.');
        break;
      case '9':
        console.log('Ação de LISTAR DOCUMENTOS COM ACESSO apresentando o título de cada documento seria executada aqui.');
        createDocumentShortcut((callback)=>{
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
    console.log('[4]  - Listar o conteúdo de uma nota');
    console.log('[5]  - '+ colors.green +'Listar o conteúdo de um documento (todas as notas)'+ colors.reset);
    console.log('[6]  - Apresentar detalhes sobre um documento');
    console.log('[7]  - Listar usuários existentes no servidor');
    console.log('[8]  - Associar outro usuário ao documento');
    console.log('[9]  - Listar documentos com acesso');
    console.log('[10] - Listar documentos com acesso alterados a partir de uma data/hora');
    console.log('[11] - Listar Todos os DOcumentos sem restrição');

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
