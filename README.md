## Para rodar o projeto é necessarios seguir alguns passos.
### Primeiro atualize as dependencias
```bash
  npm i
```

### Rode o servidor com o comando a baixo.

```bash
  npm run server
```

### Com o servidor rodando, use o comando abaixo para iniciar o client.

```bash
  npm run client
```

### Funções do sistema
##### 1. Criar um documento ✅
##### 2. Criar uma nota em um documento ✅
##### 3. Editar uma nota em um documento ❌
##### 4. Listar o conteúdo de uma nota ✅
##### 5. Listar o conteúdo de um documento (todas as notas) ✅
##### 6. Apresentar detalhes sobre um documento: título, última alteração, usuários com acesso, títulos das notas e indicação se há algum usuário editando alguma nota no momento ✅
##### 7. Listar usuários existentes no servidor ✅
##### 8. Associar um outro usuário ao documento ✅
##### 9. Listar documentos que têm acesso apresentando o título de cada documento ✅
##### 10. Listar documentos que têm acesso e que foram alterados a partir de uma data/hora ❌

##### Anotações
##### *PROTO*
_*Ao salvar o arquivo .proto com modificações ele automaticamente muda os arquivos gerados por ele, mas o node que está rodando não "sabe" disso, então o node que estiver com o client/server precisa ser reiniciado.*_