// ==========================================================================
// CONFIGURAÇÃO — ajuste aqui, sem mexer no resto do código
// ==========================================================================

// Caminho do CSV exportado do TSE (o mesmo formato do "consulta_cand").
// Precisa ter, no mínimo, as colunas: CD_CARGO, SQ_CANDIDATO, NR_CANDIDATO,
// NM_URNA_CANDIDATO, SG_PARTIDO, SG_UF
const CSV_PATH = "candidatos.csv";

// Pasta onde estão as fotos baixadas do TSE (padrão: F<UF><SQ_CANDIDATO>_div.jpg)
const FOTOS_PATH = "fotos";

// Um item por cargo que aparece na colinha, na ordem em que devem aparecer.
// cargo   -> valor da coluna CD_CARGO no csv do TSE para esse cargo
// digitos -> quantos dígitos o número desse cargo tem na urna
// fixo    -> (opcional) número já pré-preenchido, tipo o candidato "dono" da colinha
// travado -> (opcional) true = as caixinhas ficam pré-preenchidas e NÃO dá pra editar
//            (só faz sentido usar junto com "fixo")
const CARGOS = [
  { id: "fed",   label: "Deputado Federal", cargo: 6,  digitos: 4, fixo: "1077", travado: true  },
  { id: "est",   label: "Deputado Estadual", cargo: 7,  digitos: 5, fixo: "45177", travado: true },
  { id: "sen1",  label: "Senador (1º voto)", cargo: 5,  digitos: 3 },
  { id: "sen2",  label: "Senador (2º voto)", cargo: 5,  digitos: 3 },
  { id: "gov",   label: "Governador",        cargo: 3,  digitos: 2 },
  { id: "pres",  label: "Presidente",        cargo: 1,  digitos: 2 },
];
