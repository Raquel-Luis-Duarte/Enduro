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
      const alturaSuperior = (0.5) * (altura - abertura);
      const alturaInferior = altura - abertura - alturaSuperior;
      this.superior.setAltura(alturaSuperior);
      this.inferior.setAltura(alturaInferior);
    };
    this.getX = () => parseInt(this.elemento.style.left.split("px")[0]);
    this.setX = (popsicaoNaTela) =>
      (this.elemento.style.left = `${popsicaoNaTela}px`);
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

const baterias = document.getElementsByClassName("bateria");
let energia = 0;

const ColisaoDoPlayerComBaterias = () => {
  for (const bateria of baterias) {
    if (
      bateria.getBoundingClientRect().left <
        personagem.getBoundingClientRect().right &&
      bateria.getBoundingClientRect().right >
        personagem.getBoundingClientRect().left &&
      bateria.getBoundingClientRect().top <
        personagem.getBoundingClientRect().bottom &&
      bateria.getBoundingClientRect().bottom >
        personagem.getBoundingClientRect().top
    ) {
      document.getElementById("recarga").play();
      if (document.getElementById("energia").value <= 100) {
        document.getElementById("energia").value += 5;
      }
      energia++;
      bateria.parentNode.removeChild(bateria);
    }
  }
};

setInterval(() => {
  ColisaoDoPlayerComBaterias();
}, 500);

const consumoDaBarraDeEnergia = () => {
  if (document.getElementById("energia").value <= 0) {
    document.location.reload();
  }
  document.getElementById("energia").value -= 1;
};

setInterval(() => {
  consumoDaBarraDeEnergia();
}, 500);

function estaoSobrepostos(elementoA, elementoB) {
  const a = elementoA.getBoundingClientRect();
  const b = elementoB.getBoundingClientRect();
  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;

  const retorno = horizontal && vertical;
  return retorno;
}

function colidiu(carro, barreiras) {
  let colidiu = false;

  barreiras.pares.forEach((parDeBarreiras) => {
    if (!colidiu) {
      const superior = parDeBarreiras.superior.elemento;
      const inferior = parDeBarreiras.inferior.elemento;
      colidiu =
        estaoSobrepostos(carro.elemento, superior) ||
        estaoSobrepostos(carro.elemento, inferior);
    }
  });
  return colidiu;
}

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
        barreiras.setColidiu(colidiu(carro, barreiras));
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