function novoElemento(tagName, className) {
  const elemento = document.createElement(tagName);
  elemento.className = className;
  return elemento;
}

class Barreira {
  constructor(reversa = false) {
    this.elemento = novoElemento("div", "barreira");
    const borda = novoElemento("div", "borda");
    const corpo = novoElemento("div", "corpo");
    this.elemento.appendChild(reversa ? corpo : borda);
    this.elemento.appendChild(reversa ? borda : corpo);

    this.setAltura = (altura) => (corpo.style.height = `${altura}px`);
  }
}

class ParDeBarreiras {
  constructor(altura, abertura, posicaoNaTela) {
    this.elemento = novoElemento("div", "par-de-barreiras");
    this.superior = new Barreira(true);
    this.inferior = new Barreira(false);

    this.elemento.appendChild(this.superior.elemento);
    this.elemento.appendChild(this.inferior.elemento);

    this.sortearAbertura = () => {
      const alturaSuperior = 0.5 * (altura - abertura);
      const alturaInferior = altura - abertura - alturaSuperior;
      this.superior.setAltura(alturaSuperior);
      this.inferior.setAltura(alturaInferior);
    };
    this.getX = () => parseInt(this.elemento.style.left.split("px")[0]);
    this.setX = (posicaoNaTela) =>
      (this.elemento.style.left = `${posicaoNaTela}px`);
    this.getLargura = () => this.elemento.clientWidth;

    this.sortearAbertura();
    this.setX(posicaoNaTela);
  }
}

const velocidadeMaximaDoJogo = 10;
const velocidadeMinimaDoJogo = 0;

class Barreiras {
  constructor(altura, largura, abertura, espaco, ganharPonto, perderPonto) {
    this.pares = [
      new ParDeBarreiras(altura, abertura, largura),
      new ParDeBarreiras(altura, abertura, largura + espaco),
      new ParDeBarreiras(altura, abertura, largura + espaco * 2),
      new ParDeBarreiras(altura, abertura, largura + espaco * 3),
    ];

    this.colidiu = false;

    this.velocidadeDoJogo = 3;
    this.animar = () => {
      this.pares.forEach((par) => {
        par.setX(par.getX() - this.velocidadeDoJogo);

        if (par.getX() < -par.getLargura()) {
          par.setX(par.getX() + espaco * this.pares.length);
          par.sortearAbertura();
        }
        const meio = largura / 2;
        const cruzouMeio =
          par.getX() + this.velocidadeDoJogo >= meio && par.getX() < meio;

        if (cruzouMeio && !this.colidiu) {
          ganharPonto();
        } else if (cruzouMeio && this.colidiu) {
          perderPonto();
        }
      });
    };
  }

  getVelocidade = () => this.velocidadeDoJogo;
  setVelocidade = (novaVelocidade) => (this.velocidadeDoJogo = novaVelocidade);

  getColidiu = () => this.colidiu;
  setColidiu = (passaroColidiu) => (this.colidiu = passaroColidiu);
}

const minBotton = -37;
const maxBotton = 690;

const pistaBotton = 38;
const pistaTop = 518;

const velocidadeMaximaDoCarro = 300;
const velocidadeMinimaDoCarro = 5;

class Carro {
  constructor(alturaJogo) {
    this.elemento = novoElemento("img", "passaro");
    this.elemento.src = "img/carro.png";

    window.onkeydown = (e) => {
      if (e.keyCode == "37") {
        if (this.getPosicaoCarro() + 15 <= maxBotton)
          this.setPosicaoCarro(this.getPosicaoCarro() + 15);
        else this.setPosicaoCarro(maxBotton);
      } else if (e.keyCode == "39") {
        if (this.getPosicaoCarro() - 15 >= minBotton)
          this.setPosicaoCarro(this.getPosicaoCarro() - 15);
        else this.setPosicaoCarro(minBotton);
      }
    };

    this.velocidadeDoCarro = 15;

    this.setPosicaoCarro(alturaJogo / 2);
  }

  getPosicaoCarro = () => parseInt(this.elemento.style.bottom.split("px")[0]);
  setPosicaoCarro = (novaPosicao) => {
    this.elemento.style.bottom = `${novaPosicao}px`;
  };

  getVelocidadeCarro = () => this.velocidadeDoCarro;
  setVelocidadeCarro = (novaVelocidade) => {
    this.velocidadeDoCarro = novaVelocidade;
  };
}

class Progresso {
  constructor() {
    this.elemento = novoElemento("span", "progresso");
    this.atualizarPontos = (pontos) => {
      this.elemento.innerHTML = pontos;
    };
    this.atualizarPontos(0);
  }
}

const telaDeGasolina = document.getElementById("tela-de-gasolinas");

const moverGasolina = () => {
  const gasolinas = document.getElementsByClassName("gasolina");
  for (const gasolina of gasolinas) {
    const posicaoAtual = parseFloat(gasolina.style.left);
    const novaPosicao = posicaoAtual - 0.3;
    gasolina.style.left = `${novaPosicao}%`;

    if (novaPosicao > 100) {
      gasolina.parentNode.removeChild(gasolina);
    }
  }
};

setInterval(moverGasolina, 20);

const ColisaoDoPlayerComGasolina = () => {
  const carro = document.querySelector(".passaro");
  const gasolinas = document.getElementsByClassName("gasolina");
  for (const gasolina of gasolinas) {
    if (
      gasolina.getBoundingClientRect().left <
        carro.getBoundingClientRect().right &&
      gasolina.getBoundingClientRect().right >
        carro.getBoundingClientRect().left &&
      gasolina.getBoundingClientRect().top <
        carro.getBoundingClientRect().bottom &&
      gasolina.getBoundingClientRect().bottom >
        carro.getBoundingClientRect().top
    ) {
      if (energiaBar.value <= 95) {
        energiaBar.value += 5;
      } else {
        energiaBar.value = 100;
      }
      energia++;
      telaDeGasolina.removeChild(gasolina);
    }
  }
};

setInterval(() => {
  ColisaoDoPlayerComGasolina();
}, 500);

const consumoDaBarraDeEnergia = () => {
  if (energiaBar.value <= 0) {
    document.location.reload();
  }
  energiaBar.value -= 1;
};

setInterval(() => {
  consumoDaBarraDeEnergia();
}, 500);


const numeroRandomico = (min, max) => {
  const randon = Math.random();
  return min + Math.floor(randon * (max - min));
};

const pegarPosicao = () => {
  const conteudoElement = document.querySelector(".conteudo");
  const largura = conteudoElement.offsetWidth;
  const altura = conteudoElement.offsetHeight;

  const posicao = {};

  posicao.left = 100;
  posicao.top = numeroRandomico(29, 71);
  posicao.right = 100 - posicao.left;
  posicao.bottom = 100 - posicao.top;

  return posicao;
};

const novoItem = () => {
  const gasolina = novoElemento("div", "gasolina");
  const posicao = pegarPosicao();
  gasolina.style.left = `${posicao.left}%`;
  gasolina.style.top = `${posicao.top}%`;
  gasolina.style.right = `${posicao.right}%`;
  gasolina.style.bottom = `${posicao.bottom}%`;
  return gasolina;
};

const inserirGasolinas = async () => {
  while (true) {
    const gasolina = novoItem("gasolina");
    const posicao = pegarPosicao();

    if (
      posicao.left >= 0 &&
      posicao.left <= 100 &&
      posicao.top >= 20 &&
      posicao.bottom <= 80
    ) {
      gasolina.style.left = `${posicao.left}%`;
      gasolina.style.top = `${posicao.top}%`;
      gasolina.style.right = `${posicao.right}%`;
      gasolina.style.bottom = `${posicao.bottom}%`;

      telaDeGasolina.appendChild(gasolina);
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 10000);
    });
  }
};

inserirGasolinas();

const telaDeInimigos = document.getElementById("tela-de-inimigos");
const energiaBar = document.getElementById("energia");
let energia = 0;

const moverInimigos = () => {
  const inimigos = document.getElementsByClassName("inimigo");
  for (const inimigo of inimigos) {
    const posicaoAtual = parseFloat(inimigo.style.left);
    const novaPosicao = posicaoAtual - 0.3;
    inimigo.style.left = `${novaPosicao}%`;

    if (novaPosicao > 100) {
      inimigo.parentNode.removeChild(inimigo);
    }
  }
};

setInterval(moverInimigos, 20);

const ColisaoDoPlayerComInimigo = () => {
  const carro = document.querySelector(".passaro");
  const inimigos = document.getElementsByClassName("inimigo");
  for (const inimigo of inimigos) {
    if (
      inimigo.getBoundingClientRect().left <
        carro.getBoundingClientRect().right &&
      inimigo.getBoundingClientRect().right >
        carro.getBoundingClientRect().left &&
      inimigo.getBoundingClientRect().top <
        carro.getBoundingClientRect().bottom &&
      inimigo.getBoundingClientRect().bottom > carro.getBoundingClientRect().top
    ) {
      if (energiaBar.value <= 95) {
        energiaBar.value += 5;
      } else {
        energiaBar.value = 100;
      }
      energia++;
      telaDeInimigo.removeChild(inimigo);
    }
  }
};

setInterval(() => {
  ColisaoDoPlayerComInimigo();
}, 500);


const novoInimigo = () => {
  const inimigo = novoElemento("div", "inimigo");
  const posicao = pegarPosicao();
  inimigo.style.left = `${posicao.left}%`;
  inimigo.style.top = `${posicao.top}%`;
  inimigo.style.right = `${posicao.right}%`;
  inimigo.style.bottom = `${posicao.bottom}%`;
  return inimigo;
};

const inserirInimigos = async () => {
  while (true) {
    const inimigo = novoInimigo("inimigo");
    const posicao = pegarPosicao();

    if (
      posicao.left >= 0 &&
      posicao.left <= 100 &&
      posicao.top >= 20 &&
      posicao.bottom <= 80
    ) {
      inimigo.style.left = `${posicao.left}%`;
      inimigo.style.top = `${posicao.top}%`;
      inimigo.style.right = `${posicao.right}%`;
      inimigo.style.bottom = `${posicao.bottom}%`;

      telaDeInimigo.appendChild(inimigo);
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 10000);
    });
  }
};

inserirInimigos();

class FlappyBird {
  constructor() {
    let pontos = 0;
    const areaDoJogo = document.querySelector("[wm-enduro]");
    const altura = areaDoJogo.clientHeight;
    const largura = areaDoJogo.clientWidth;

    const progresso = new Progresso();
    const ganharPonto = () => progresso.atualizarPontos(++pontos);
    const perderPonto = () => progresso.atualizarPontos(--pontos);

    const carro = new Carro(altura);

    const barreiras = new Barreiras(
      altura,
      largura,
      405,
      200,
      ganharPonto,
      perderPonto
    );

    areaDoJogo.appendChild(progresso.elemento);
    areaDoJogo.appendChild(carro.elemento);
    barreiras.pares.forEach((par) => areaDoJogo.appendChild(par.elemento));

    this.start = () => {
      const jogo = setInterval(() => {
        barreiras.animar();
        barreiras.setColidiu(barreiras.getColidiu(carro, barreiras));
      }, 20);

      const aceleracao = setInterval(() => {
        if (
          carro.getPosicaoCarro() >= pistaBotton &&
          carro.getPosicaoCarro() <= pistaTop
        ) {
          if (barreiras.getVelocidade() < velocidadeMaximaDoJogo)
            barreiras.setVelocidade(barreiras.getVelocidade() + 1);

          if (carro.getVelocidadeCarro() < velocidadeMaximaDoCarro)
            carro.setVelocidadeCarro(carro.getVelocidadeCarro() + 50);
        } else {
          if (barreiras.getVelocidade() > velocidadeMinimaDoJogo) {
            if (barreiras.getVelocidade() - 2 >= velocidadeMinimaDoJogo)
              barreiras.setVelocidade(barreiras.getVelocidade() - 2);
            else barreiras.setVelocidade(velocidadeMinimaDoJogo);
          }

          if (carro.getVelocidadeCarro() < velocidadeMinimaDoCarro) {
            if (carro.getVelocidadeCarro() - 70 >= velocidadeMinimaDoCarro)
              carro.setVelocidadeCarro(carro.getVelocidadeCarro() - 70);
            else carro.setVelocidadeCarro(velocidadeMinimaDoCarro);
          }
        }
      }, 2000);
    };
  }
}

new FlappyBird().start();
