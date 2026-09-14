// ==========================================================================
// Lógica da colinha: lê o CSV do TSE, indexa por cargo+número e liga aos
// campos de digitação. Não precisa entender tudo pra usar — só ajuste
// config.js. Comentários explicam cada parte pra quem for mexer.
// ==========================================================================

let INDEX = {}; // INDEX[cargo][numero] = { nome, partido, foto }

// -- 1. Carrega e indexa o CSV -------------------------------------------
function carregarCandidatos() {
  return new Promise((resolve, reject) => {
    Papa.parse(CSV_PATH, {
      download: true,
      header: true,
      delimiter: ";", // o TSE costuma exportar separado por ; — troque pra "," se o seu vier assim
      skipEmptyLines: true,
      complete: (res) => {
        res.data.forEach((row) => {
          const cargo = String(row.CD_CARGO || "").trim();
          const numero = String(row.NR_CANDIDATO || "").trim();
          if (!cargo || !numero) return;

          const sqCandidato = String(row.SQ_CANDIDATO || "").trim();
          const uf = String(row.SG_UF || "").trim();

          if (!INDEX[cargo]) INDEX[cargo] = {};
          INDEX[cargo][numero] = {
            nome: row.NM_URNA_CANDIDATO || row.NM_CANDIDATO || "",
            partido: row.SG_PARTIDO || "",
            // padrão de arquivo baixado do TSE: F<UF><SQ_CANDIDATO>_div.jpg
            foto: `${FOTOS_PATH}/F${uf}${sqCandidato}_div.jpg`,
          };
        });
        resolve();
      },
      error: reject,
    });
  });
}

// -- 2. Monta o HTML de cada cargo ---------------------------------------
function montarInterface() {
  const container = document.getElementById("offices");

  CARGOS.forEach((cargoCfg) => {
    const office = document.createElement("div");
    office.className = "office";
    office.id = `office-${cargoCfg.id}`;

    office.innerHTML = `
      <img class="avatar" id="avatar-${cargoCfg.id}" src="" alt="">
      <div class="office-info">
        <div class="office-label">${cargoCfg.label}</div>
        <div class="office-name" id="nome-${cargoCfg.id}"></div>
        <div class="office-party" id="partido-${cargoCfg.id}"></div>
        <div class="office-hint" id="hint-${cargoCfg.id}">Digite ${cargoCfg.digitos} dígitos</div>
      </div>
      <div class="digits" id="digits-${cargoCfg.id}"></div>
    `;
    container.appendChild(office);

    const digitsWrap = office.querySelector(`#digits-${cargoCfg.id}`);
    const valorInicial = (cargoCfg.fixo || "").split("");

    for (let i = 0; i < cargoCfg.digitos; i++) {
      const input = document.createElement("input");
      input.type = "tel";
      input.inputMode = "numeric";
      input.maxLength = 1;
      input.className = "digit";
      input.dataset.index = i;
      input.value = valorInicial[i] || "";

      if (cargoCfg.travado) {
        input.readOnly = true;
        input.tabIndex = -1; // não para nele com Tab nem recebe clique de digitação
        input.classList.add("locked");
      }

      digitsWrap.appendChild(input);
    }

    ligarEventos(cargoCfg);
    atualizarCargo(cargoCfg); // já preenche se tiver número "fixo"
  });
}

// -- 3. Navegação entre caixinhas e atualização ao digitar ----------------
function ligarEventos(cargoCfg) {
  if (cargoCfg.travado) return; // campo travado não recebe digitação

  const inputs = [
    ...document.querySelectorAll(`#digits-${cargoCfg.id} .digit`),
  ];

  inputs.forEach((input, i) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^0-9]/g, "");
      if (input.value && i < inputs.length - 1) {
        inputs[i + 1].focus();
      }
      atualizarCargo(cargoCfg);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && i > 0) {
        inputs[i - 1].focus();
      }
    });
  });
}

// -- 4. Busca o candidato no índice e atualiza a tela ----------------------

const AVATAR_VAZIO = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

function atualizarCargo(cargoCfg) {
  const inputs = [
    ...document.querySelectorAll(`#digits-${cargoCfg.id} .digit`),
  ];
  const numero = inputs.map((i) => i.value).join("");

  const nomeEl = document.getElementById(`nome-${cargoCfg.id}`);
  const partidoEl = document.getElementById(`partido-${cargoCfg.id}`);
  const avatarEl = document.getElementById(`avatar-${cargoCfg.id}`);
  const hintEl = document.getElementById(`hint-${cargoCfg.id}`);
  const officeEl = document.getElementById(`office-${cargoCfg.id}`);

  const candidato =
    numero.length === cargoCfg.digitos
      ? (INDEX[cargoCfg.cargo] || {})[numero]
      : null;

  if (candidato) {
    nomeEl.textContent = candidato.nome;
    partidoEl.textContent = candidato.partido;
    avatarEl.src = candidato.foto;
    avatarEl.onerror = () => (avatarEl.src = AVATAR_VAZIO); // sem foto encontrada
    hintEl.style.display = "none";
    officeEl.classList.add("filled");
  } else {
    nomeEl.textContent = "";
    partidoEl.textContent = "";
    avatarEl.src = AVATAR_VAZIO;
    hintEl.style.display = "block";
    officeEl.classList.remove("filled");
  }
}

// -- 5. Exporta a colinha como imagem --------------------------------------
function ligarBotaoGerar() {
  document.getElementById("btn-gerar").addEventListener("click", () => {
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS && navigator.canShare) {
      compartilharImagem();
    } else {
      html2canvas(document.getElementById("colinha-card"), { scale: 2 }).then(
        (canvas) => {
          const link = document.createElement("a");
          link.download = "socorro-45177-2026.png";
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
      );
    }
  });
}

async function compartilharImagem() {
  try {
    const canvas = await html2canvas(document.getElementById("colinha-card"), { scale: 2 });
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const file = new File([blob], 'colinha-2026.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Colinha-Socorro-45177',
        text: 'Confira minha colinha de votação para 2026!'
      });
    } else {
      alert("Seu dispositivo não suporta o compartilhamento direto. Por favor, use o botão de Salvar.");
    }
  } catch (error) {
    console.error("Erro ao compartilhar a imagem:", error);
  }
}


// -- Start ------------------------------------------------------------------
carregarCandidatos()
  .then(montarInterface)
  .then(ligarBotaoGerar)
  .catch((err) => {
    console.error("Erro ao carregar candidatos.csv:", err);
    document.getElementById("offices").innerHTML =
      "<p>Não consegui carregar candidatos.csv — confira o caminho do arquivo e o separador (; ou ,) em config.js.</p>";
  });
