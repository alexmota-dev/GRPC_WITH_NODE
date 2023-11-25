var PROTO_PATH = __dirname + '/../protos/helloworld.proto';
var PROTO_PATH_USER = __dirname + '/../protos/user.proto';
var PROTO_PATH_DOCUMENT = __dirname + '/../protos/document.proto';


const readline = require('readline');
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

  function stopGRPCClients() {
    clientUser.close(); // Close the user gRPC client
    clientDocument.close(); // Close the document gRPC client
  }

  function createDocumentShortcut(callback){

    rl.question('Quem é o author do documento: ', (userAuth) => {
      rl.question('Título do documento: ', (title) => {
        clientDocument.createDocument({userAuth: userAuth, title: title}, function(err, response) {
          console.log('Resposta:', response);
          callback(true);
        })
      });
    });
  }

  function findAllDocumentsWithAcessShortcut(){
    clientDocument.findAllDocumentsWithAcess({test:1}, function(err, response) {
      console.log('Resposta:', response);
    })
  }

  function findAllDocumentsShortcut(callback){
    clientDocument.findAllDocuments({test:1}, function(err, response) {
      console.log('Resposta:', response);
      callback(true);
    })
  }

  function action(opcao) {
    switch (opcao) {
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
        break;
      case '3':
        console.log('Ação de EDITAR UMA NOTA EM UM DOCUMENTO seria executada aqui.');
        break;
      case '4':
        console.log('Ação de LISTAR O CONTEÚDO DE UMA NOTA seria executada aqui.');
        break;
      case '5':
        console.log('Ação de LISTAR O CONTEÚDO DE UM DOCUMENTO (todas as notas) seria executada aqui.');
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
    console.log('[1] - Criar um documento');
    console.log('[2] - Criar uma nota em um documento');
    console.log('[3] - Editar uma nota em um documento');
    console.log('[4] - Listar o conteúdo de uma nota');
    console.log('[5] - Listar o conteúdo de um documento (todas as notas)');
    console.log('[6] - Apresentar detalhes sobre um documento');
    console.log('[7] - Listar usuários existentes no servidor');
    console.log('[8] - Associar outro usuário ao documento');
    console.log('[9] - Listar documentos com acesso');
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
