import {
  Building2,
  FileText,
  Gauge,
  Layers3,
  LineChart,
  Map,
  Ruler,
} from "lucide-react";

export const workspaceNavigation = [
  {
    label: "Projeto",
    items: [
      { slug: "dados", label: "Dados da obra", icon: Building2 },
      { slug: "sondagens", label: "Sondagens", icon: Layers3 },
      { slug: "locacao-mapa", label: "Locação / mapa", icon: Map },
    ],
  },
  {
    label: "Análise e entrega",
    items: [
      { slug: "cadastro-estacas", label: "Cadastro de estacas", icon: Ruler },
      { slug: "carga-admissivel", label: "Carga admissível", icon: Gauge },
      { slug: "resultados", label: "Resultados", icon: LineChart },
      { slug: "relatorios", label: "Relatórios", icon: FileText },
    ],
  },
];

export function obterPaginaWorkspace(pathname) {
  const slug = pathname.split("/").filter(Boolean).at(-1);
  return workspaceNavigation
    .flatMap((grupo) => grupo.items)
    .find((item) => item.slug === slug);
}
