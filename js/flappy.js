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
      const alturaSuperior = Math.random() * (altura - abertura);
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

class Barreiras {
  constructor(altura, largura, abertura, espaco, ganharPonto, perderPonto) {
    this.pares = [
      new ParDeBarreiras(altura, abertura, largura),
      new ParDeBarreiras(altura, abertura, largura + espaco),
      new ParDeBarreiras(altura, abertura, largura + espaco * 2),
      new ParDeBarreiras(altura, abertura, largura + espaco * 3),
    ];

    this.colidiu = false;

    const deslocamento = 3;
    this.animar = () => {
      this.pares.forEach((par) => {
        par.setX(par.getX() - deslocamento);

        if (par.getX() < -par.getLargura()) {
          par.setX(par.getX() + espaco * this.pares.length);
          par.sortearAbertura();
        }
        const meio = largura / 2;
        const cruzouMeio =
          par.getX() + deslocamento >= meio && par.getX() < meio;
          
        if (cruzouMeio && !this.colidiu) {
          ganharPonto();
        } else if (cruzouMeio && this.colidiu) {
          perderPonto();
        }
      });
    };
  }

  getColidiu = () => this.colidiu;
  setColidiu = (passaroColidiu) => (this.colidiu = passaroColidiu);
}

class Passaro {
  constructor(alturaJogo) {
    this.elemento = novoElemento("img", "passaro");
    this.elemento.src = "img/carro.png";

    this.getY = () => parseInt(this.elemento.style.bottom.split("px")[0]);
    this.setY = (y) => (this.elemento.style.bottom = `${y}px`);

    window.onkeydown = (e) => {
      if (e.keyCode == "37") {
        this.setY(this.getY() + 15);
      } else if (e.keyCode == "39") {
        this.setY(this.getY() - 15);
      }
    };
    this.setY(alturaJogo / 2);
  }
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
    const areaDoJogo = document.querySelector("[wm-flappy]");
    const altura = areaDoJogo.clientHeight;
    const largura = areaDoJogo.clientWidth;

    const progresso = new Progresso();
    const ganharPonto = () => progresso.atualizarPontos(++pontos);
    const perderPonto = () => progresso.atualizarPontos(--pontos);

    const passaro = new Passaro(altura);

    const barreiras = new Barreiras(
      altura,
      largura,
      200,
      400,
      ganharPonto,
      perderPonto
    );

    areaDoJogo.appendChild(progresso.elemento);
    areaDoJogo.appendChild(passaro.elemento);
    barreiras.pares.forEach((par) => areaDoJogo.appendChild(par.elemento));

    this.start = () => {
      const temporizador = setInterval(() => {
        barreiras.animar();
        barreiras.setColidiu(colidiu(passaro, barreiras));
      }, 20);
    };
  }
}
new FlappyBird().start();
