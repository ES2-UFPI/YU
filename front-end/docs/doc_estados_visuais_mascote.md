# Documentação — Estados Visuais do Mascote

**Issue relacionada:** Definir e documentar os estados visuais do mascote

## 1. Objetivo

Mapear cada estado emocional/visual do mascote a condições objetivas derivadas dos dados do usuário (saúde, energia, metas cumpridas e ignoradas).

## 2. Fontes de dados

Os dados serão fornecidos pelo motor de sugestões.

O número total de sugestões diárias é fixo em **5**. Os estados visuais do mascote baseiam-se na quantidade de sugestões realizadas e no histórico dos últimos dias, considerando a quantidade de sugestões concluídas nos dois dias anteriores.

## 3. Seleção de estado

Cada condição é exclusiva. O estado é escolhido com base no número exato de ações realizadas em um determinado intervalo de tempo.

1. **Doente**
2. **Triste**
3. **Neutro**
4. **Feliz**
5. **Animado**

O total de sugestões diárias é fixo em **5**. O estado é definido pela quantidade de sugestões realizadas no dia, exceto o estado **Doente**, que considera o histórico de mais de um dia.

## 4. Estados definidos

### 4.1 Doente

* **Descrição:** Mascote visivelmente doente e abandonado.
* **Condição de disparo:** Mais de um dia consecutivo sem nenhuma ação realizada.
* **Asset:** ... (spritesheet)

### 4.2 Triste

* **Descrição:** Mascote cabisbaixo, com os olhos caídos.
* **Condição de disparo:** Nenhuma sugestão realizada hoje, mas ainda não está há mais de 24 horas nesse estado.
* **Asset:** ... (spritesheet)

### 4.3 Neutro

* **Descrição:** Mascote com expressão neutra. Demonstra estar saudável, mas ainda não está animado.
* **Condição de disparo:** 1 sugestão realizada.
* **Asset:** ... (spritesheet)

### 4.4 Feliz

* **Descrição:** Mascote sorridente, satisfeito com o progresso do dia.
* **Condição de disparo:** De 2 a 3 sugestões realizadas.
* **Asset:** ... (spritesheet)

### 4.5 Animado

* **Descrição:** Mascote com óculos escuros e relaxado.
* **Condição de disparo:** De 4 a 5 sugestões realizadas.
* **Asset:** ... (spritesheet)

## 5. Tabela-resumo

| # | Estado  | Condição de disparo (resumo)                         |
| - | ------- | ---------------------------------------------------- |
| 1 | Doente  | 0 sugestões realizadas por mais de 1 dia consecutivo |
| 2 | Triste  | 0 sugestões realizadas hoje                          |
| 3 | Neutro  | 1 sugestão realizada (de 5)                          |
| 4 | Feliz   | 2 a 3 sugestões realizadas (de 5)                    |
| 5 | Animado | 4 a 5 sugestões realizadas (de 5)                    |

## 6. Especificação técnica dos assets

* **Formato:** PNG spritesheet (frames de animação dispostos em uma grade horizontal).
* **Convenção de nomenclatura:** `mascote_<estado>.png` + `mascote_<estado>.json` (metadados com quantidade de frames, FPS sugerido e dimensões de cada frame).
* **Compatibilidade:** os spritesheets devem ser consumidos via `react-native-reanimated`.
* **Estrutura de pastas sugerida:**

```text
/assets/mascote/
  mascote_animado.png
  mascote_animado.json
  mascote_feliz.png
  mascote_feliz.json
  mascote_neutro.png
  mascote_neutro.json
  mascote_triste.png
  mascote_triste.json
  mascote_doente.png
  mascote_doente.json
```

## 7. Pseudocódigo de seleção de estado

```js
function definirEstadoMascote(dados) {
  const {
    sugestoesRealizadasHoje,
    historicoSugestoes,
  } = dados;

  const ontem = historicoSugestoes[historicoSugestoes.length - 1];

  const doente =
    sugestoesRealizadasHoje === 0 &&
    ontem &&
    ontem.sugestoesRealizadas === 0;

  if (doente) return 'doente';
  if (sugestoesRealizadasHoje === 0) return 'triste';
  if (sugestoesRealizadasHoje === 1) return 'neutro';
  if (sugestoesRealizadasHoje >= 2 && sugestoesRealizadasHoje <= 3) return 'feliz';

  return 'animado';
}
```
