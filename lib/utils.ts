export function inferirCiclo(nivel: string, grado: string): string {
  const gradoNum = parseInt(grado, 10);

  if (nivel === "Inicial") {
    if (gradoNum === 3 || gradoNum === 4) return "Ciclo I";
    if (gradoNum === 5) return "Ciclo II";
  }

  if (nivel === "Primaria") {
    if (gradoNum === 1 || gradoNum === 2) return "Ciclo II";
    if (gradoNum === 3 || gradoNum === 4) return "Ciclo III";
    if (gradoNum === 5 || gradoNum === 6) return "Ciclo IV";
  }

  if (nivel === "Secundaria") {
    if (gradoNum === 1 || gradoNum === 2) return "Ciclo V";
    if (gradoNum === 3 || gradoNum === 4 || gradoNum === 5) return "Ciclo VI";
  }

  return "-";
}
