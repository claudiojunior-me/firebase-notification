# PWA Push Notification usando Firebase

### Recursos usados do Firebase:
- Firestore
- Cloud Function
- Cloud Messaging

### Estrutura Firestore

```bash
|-- users
|  |-- user-01
|  |-- user-02
|  |-- user-03
|-- redes
|  |-- nome-da-rede-01
|  |  |-- notifications
|  |  |  |-- notification-id-01
|  |  |  |-- notification-id-02
|  |-- nome-da-rede-02
|  |  |-- notifications
|  |  |  |-- notification-id-01
|  |  |  |-- notification-id-02
|  |  |  |-- notification-id-03
|  |-- nome-da-rede-03
|  |  |-- notifications
|  |  |  |-- notification-id-01
```

### Cadastro de usuário na base Firestore

Ao logar no sistema, após o usuário permitir receber notificações, uma função *JS* irá ler os cookies pegando o usuário(*email*) e nome da rede, além de recuperar também o *token* do dispositivo atual.

Após, ele irá salvar no Firestore, dentro da *collection* de *users* seguindo a seguinte estrutura:

```json
{
  'user': 'email@rede.com.br',
  'rede': 'nova-rede',
  'deviceToken': 'er7PIAymSa4:APA91bE-t152dxjNCp2M4KTpSRBWlGFNrh...'
}
```

> **obs:** o nome da rede é normalizado, de: Nova Rede, para: nova-rede

### Cadastro de nova notificação na base Firestore

Existe uma Cloud Function registrada no Firebase onde ela observa toda nova entrada na *collection* *redes* e na *subcollection* *notifications*, ou seja, toda nova entrada em *notifications*, ela intercepta os dados, faz a ligação entre notificação e usuário de destino e envia uma *Cloud Message*.

Portando **TODA** notificação, além de ser cadastrada na collection referente a rede, possui um registro do usuário de destino da notificação:

```json
{
  'dateCreated': '2019-04-17 10:54',
  'messageTitle': 'Nova Ordem de Serviço',
  'messageBody': 'Você possui uma nova ordem de serviço cadastrada.',
  'userDestination': 'email@rede.com.br',
}
```


