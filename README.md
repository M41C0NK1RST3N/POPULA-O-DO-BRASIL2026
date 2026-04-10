# 🇧🇷 População do Brasil — Dashboard IBGE

![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![License](https://img.shields.io/badge/License-MIT-green)

> Dashboard interativo com dados oficiais do Censo IBGE mostrando a evolução da população brasileira de 1872 a 2022, com projeções até 2126.

## 🔴 [Ver Online](https://SEU-USUARIO.github.io/populacao-brasil-ibge/)

## 📊 O que mostra

- **Série Histórica**: Todos os censos demográficos (1872-2022)
- **Taxa de Crescimento**: Desaceleração de 3,05% (1950) → 0,52% (2022)
- **Taxa de Fecundidade**: Queda de 6,28 (1960) → 1,57 (2023) filhos/mulher
- **Projeção 100 Anos**: Pico em 2041 (220,4 Mi) → Declínio até ~125 Mi em 2126

## 🚀 Como rodar localmente

```bash
git clone https://github.com/SEU-USUARIO/populacao-brasil-ibge.git
cd populacao-brasil-ibge
npm install
npm run dev
```

Abra http://localhost:5173 no navegador.

## 📦 Deploy no GitHub Pages

O deploy é **automático** via GitHub Actions. Cada push na branch `main` gera um build e publica em:

```
https://SEU-USUARIO.github.io/populacao-brasil-ibge/
```

### Configuração única necessária:
1. Vá em **Settings → Pages** no seu repositório
2. Em **Source**, selecione **GitHub Actions**
3. Pronto! O próximo push faz o deploy.

## 🗂 Fontes de Dados

| Fonte | Descrição |
|-------|-----------|
| [IBGE Censos Demográficos](https://www.ibge.gov.br/estatisticas/sociais/populacao.html) | Dados oficiais 1872-2022 |
| [Projeções IBGE Revisão 2024](https://www.ibge.gov.br/estatisticas/sociais/populacao/9109-projecao-da-populacao.html) | Projeções 2023-2070 |
| [turicas/censo-ibge](https://github.com/turicas/censo-ibge) | Scripts de captura dados IBGE |
| [tbrugz/ribge](https://github.com/tbrugz/ribge) | Pacote R para dados IBGE |
| [lsbastos/popBR_mun](https://github.com/lsbastos/popBR_mun) | Estimativas municipais |

## 🛠 Tecnologias

- **React 18** + **Vite 5** — Build ultrarrápido
- **Recharts** — Gráficos interativos
- **GitHub Actions** — CI/CD automático
- **GitHub Pages** — Hospedagem gratuita

## 📝 Licença

MIT — Dados do IBGE são públicos. Cite a fonte ao reutilizar.

---

**Desenvolvido por [Prof. Maicon Kirsten](https://github.com/Mdk1997)** · Matelândia, PR 🇧🇷
