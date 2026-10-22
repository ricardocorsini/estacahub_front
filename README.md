# React + Vite

Frontend do EstacaHub/EstacaCalc com React, Vite e Tailwind CSS.

## Autenticação e endereço da API

Crie `.env.local` a partir de `.env.example` para desenvolvimento. O build de
produção usa `.env.production` e aponta para:

```text
https://api.estacahub.com/api
```

A sessão é mantida por cookie `HttpOnly`, portanto todas as chamadas usam
`credentials: include`. Cadastro, login, restauração da sessão, proteção das
rotas e logout estão centralizados em `AuthContext`.

```bash
npm ci
npm run dev
npm run build
```

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## Tarefas pendentes 

### Dados de Obra
- Em Dados de Obra vamos definir melhor o que é obrigatório e o que não é. 
- Opcional: mapa para selecionar uma coordenada do google maps. 
- Verificar se a foto não é melhor mais formato padrão paisagem. 

### Sondagens

- No lançamento de sondagem precisamos criar alguns alertas/erros. Por exemplo: Solo ausente, NSPT = 0, Esqueceu de colocar o tipo de solo... não colocou a quantidade de solo suficiente para a profundidade da sondagem. Aviso para nível de água ausente... NSPT com vírgula, negativo etc. 
- No lançamento da leitura, os inputs estão apertados. Arrumar. 
- Criar o crtl + Z no lançamento da sondagem. 
- Melhorar a imagem baixada do relatório. Está ruim.

### Tela da edição de obra

- Essa tela é a que aparece logo após clicar em uma obra. Se torna dispensável a escolha de obra nessa tela, acaba ficando poluído. Remover. Fazer isso, utilizando o plugin no GPT com o github. 

### ESTACAS 

- Melhorar o mini-mapa. Precisa ter uma locação maior, e melhor organizado na tela. Além disso, exportar um bom dxf, com eixos, e tudo que for necessário. 

