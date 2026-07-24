# Guia de Deploy

## Publicação no GitHub Pages

### 1. Criar o repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Nomeie como `erp-gestao-ferramentas`
3. Marque como **Público**
4. Não adicione README inicial (já existe)

### 2. Subir o código

```bash
git init
git add .
git commit -m "feat: versão inicial do ERP de gestão de ferramentas"
git branch -M main
git remote add origin https://github.com/usuario/erp-gestao-ferramentas.git
git push -u origin main
```

### 3. Habilitar GitHub Pages

1. No repositório, vá em **Settings → Pages**
2. Em **Source**, selecione **Deploy from a branch**
3. Escolha a branch `main` e pasta `/ (root)`
4. Salve e aguarde a publicação

A URL será: `https://usuario.github.io/erp-gestao-ferramentas/`

### 4. Configurar Firebase

1. No console do Firebase, adicione o domínio do GitHub Pages em **Authentication → Settings → Authorized domains**
2. Em **Firestore → Rules**, configure as regras de segurança:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. CI/CD Automático

O arquivo `.github/workflows/deploy.yml` já está configurado para validar o deploy a cada push.
