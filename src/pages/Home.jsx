import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  ChevronRight,
  CircleCheck,
  Database,
  FileText,
  Gauge,
  Layers3,
  LineChart,
  LockKeyhole,
  Ruler,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import "./Home.css";

const recursos = [
  {
    icon: Database,
    index: "01",
    title: "Dados que começam pela obra",
    description:
      "Sondagens, estacas e parâmetros permanecem reunidos no mesmo contexto técnico.",
  },
  {
    icon: LineChart,
    index: "02",
    title: "Cálculo fácil de revisar",
    description:
      "Enxergue premissas, camadas de solo e resultados sem depender de planilhas dispersas.",
  },
  {
    icon: FileText,
    index: "03",
    title: "Relatório completo",
    description:
      "Transforme a análise em uma entrega organizada, clara e pronta para compartilhar.",
  },
];

const etapas = [
  {
    number: "01",
    title: "Abra uma obra",
    description:
      "Crie o espaço do projeto e mantenha cada análise vinculada ao seu usuário.",
  },
  {
    number: "02",
    title: "Cadastre a sondagem",
    description:
      "Registre o perfil geotécnico e organize as informações de campo por profundidade.",
  },
  {
    number: "03",
    title: "Calcule e documente",
    description:
      "Analise a carga admissível da estaca e consolide tudo em um relatório técnico.",
  },
];

export default function Home() {
  const { autenticado, carregando } = useAuth();
  const destinoPrincipal = autenticado
    ? "/dashboard"
    : "/login?modo=cadastro";
  const textoPrincipal = autenticado
    ? "Abrir meu dashboard"
    : "Calcular gratuitamente";

  return (
    <div className="landing-page min-h-screen overflow-hidden text-[#18181b]">
      <header className="landing-header sticky top-0 z-50 border-b border-black/[0.06]">
        <div className="landing-container flex h-[72px] items-center justify-between gap-6">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3"
            aria-label="EstacaHub — página inicial"
          >
            <BrandMark />
            <span className="text-[17px] font-semibold tracking-[-0.03em]">
              EstacaHub
            </span>
          </Link>

          <nav
            className="hidden items-center gap-8 text-[13px] font-medium text-zinc-500 lg:flex"
            aria-label="Navegação principal"
          >
            <a className="landing-nav-link" href="#recursos">
              Recursos
            </a>
            <a className="landing-nav-link" href="#como-funciona">
              Como funciona
            </a>
            <a className="landing-nav-link" href="#relatorio">
              Relatório
            </a>
          </nav>

          <div className="flex min-w-[138px] items-center justify-end gap-2 sm:min-w-[250px]">
            {carregando ? (
              <div className="h-10 w-32 animate-pulse rounded-full bg-zinc-200/70" />
            ) : autenticado ? (
              <Link
                to="/dashboard"
                className="landing-button landing-button-dark"
              >
                Dashboard
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login?modo=entrar"
                  className="hidden rounded-full px-4 py-2.5 text-[13px] font-semibold text-zinc-600 transition-colors hover:text-zinc-950 sm:inline-flex"
                >
                  Entrar
                </Link>
                <Link
                  to="/login?modo=cadastro"
                  className="landing-button landing-button-dark"
                >
                  Criar conta
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative pb-20 pt-16 sm:pb-28 sm:pt-24 lg:pb-36 lg:pt-28">
          <div className="landing-grid pointer-events-none absolute inset-x-0 top-0 h-[760px]" />
          <div className="landing-glow pointer-events-none absolute left-1/2 top-[-180px] h-[620px] w-[920px] -translate-x-1/2" />

          <div className="landing-container relative">
            <div className="mx-auto max-w-5xl text-center">
              <div className="landing-reveal landing-reveal-1 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm shadow-violet-100/50 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                Engenharia de fundações, sem planilhas dispersas
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </div>

              <h1 className="landing-display landing-reveal landing-reveal-2 mx-auto mt-7 max-w-[980px] text-[clamp(3.25rem,8vw,7.35rem)] font-semibold leading-[0.91] tracking-[-0.072em] text-zinc-950">
                Calcule a carga admissível.
                <span className="landing-title-muted block">
                  Entregue um relatório completo.
                </span>
              </h1>

              <p className="landing-reveal landing-reveal-3 mx-auto mt-8 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8">
                Organize suas obras, transforme dados de sondagem em análises
                rastreáveis e leve cada decisão de fundação até uma entrega
                técnica clara.
              </p>

              <div className="landing-reveal landing-reveal-4 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to={destinoPrincipal}
                  className="landing-button landing-button-primary min-w-[214px]"
                >
                  {textoPrincipal}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href="#como-funciona"
                  className="landing-button landing-button-light min-w-[178px]"
                >
                  Ver como funciona
                </a>
              </div>

              <div className="landing-reveal landing-reveal-4 mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-zinc-500">
                <MicroBenefit>Gratuito para começar</MicroBenefit>
                <MicroBenefit>Sem cartão</MicroBenefit>
                <MicroBenefit>Dados separados por obra</MicroBenefit>
              </div>
            </div>

            <div className="landing-reveal landing-reveal-5 relative mx-auto mt-16 max-w-6xl lg:mt-20">
              <div className="landing-product-halo pointer-events-none absolute inset-x-[12%] bottom-[-8%] top-[8%] rounded-full" />
              <ProductPreview />
            </div>
          </div>
        </section>

        <section className="border-y border-black/[0.06] bg-white/65">
          <div className="landing-container grid divide-y divide-black/[0.06] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            <Capability icon={Building2} label="Obras organizadas" />
            <Capability icon={Layers3} label="Sondagens por perfil" />
            <Capability icon={Gauge} label="Carga admissível" />
            <Capability icon={FileText} label="Relatório técnico" />
          </div>
        </section>

        <section id="recursos" className="landing-section scroll-mt-24">
          <div className="landing-container">
            <div className="max-w-5xl">
              <SectionEyebrow>Feito para o raciocínio técnico</SectionEyebrow>
              <h2 className="landing-display mt-5 text-[clamp(2.55rem,5.7vw,5.6rem)] font-medium leading-[1.01] tracking-[-0.06em] text-zinc-950">
                Menos retrabalho.
                <span className="text-zinc-400">
                  {" "}Mais confiança em cada decisão de fundação.
                </span>
              </h2>
            </div>

            <div className="mt-16 grid border-y border-black/[0.07] md:grid-cols-3 md:divide-x md:divide-black/[0.07]">
              {recursos.map((recurso) => (
                <FeatureCard key={recurso.index} {...recurso} />
              ))}
            </div>
          </div>
        </section>

        <section className="pb-24 sm:pb-32 lg:pb-40">
          <div className="landing-container">
            <div className="grid items-center gap-12 lg:grid-cols-[0.76fr_1.24fr] lg:gap-16">
              <div className="max-w-lg">
                <SectionEyebrow>Workspace técnico</SectionEyebrow>
                <h2 className="landing-display mt-5 text-4xl font-medium leading-[1.04] tracking-[-0.055em] text-zinc-950 sm:text-6xl">
                  A engenharia inteira no mesmo contexto.
                </h2>
                <p className="mt-6 text-base leading-7 text-zinc-600">
                  Cada obra funciona como um ambiente independente. Você
                  avança da caracterização do solo ao resultado sem perder a
                  origem de nenhum dado.
                </p>

                <ul className="mt-8 space-y-4">
                  <CheckItem>Perfil de sondagem organizado por camada</CheckItem>
                  <CheckItem>Estacas e parâmetros reunidos por obra</CheckItem>
                  <CheckItem>Resultados fáceis de conferir e comparar</CheckItem>
                </ul>
              </div>

              <WorkspacePreview />
            </div>
          </div>
        </section>

        <section
          id="como-funciona"
          className="scroll-mt-24 border-y border-black/[0.06] bg-white"
        >
          <div className="landing-container py-24 sm:py-32 lg:py-40">
            <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <SectionEyebrow>Do campo ao resultado</SectionEyebrow>
                <h2 className="landing-display mt-5 max-w-xl text-4xl font-medium leading-[1.04] tracking-[-0.055em] text-zinc-950 sm:text-6xl">
                  Um fluxo claro em três etapas.
                </h2>
              </div>
              <p className="max-w-xl text-base leading-7 text-zinc-600 lg:justify-self-end">
                Comece pela obra, registre o que foi encontrado no terreno e
                avance para o dimensionamento com todo o histórico no lugar.
              </p>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-20">
              <div className="divide-y divide-black/[0.07] border-y border-black/[0.07]">
                {etapas.map((etapa) => (
                  <div
                    key={etapa.number}
                    className="grid grid-cols-[44px_1fr] gap-5 py-7 sm:grid-cols-[56px_1fr] sm:py-8"
                  >
                    <span className="pt-1 font-mono text-[11px] tracking-[0.12em] text-violet-600">
                      {etapa.number}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-[-0.025em] text-zinc-950">
                        {etapa.title}
                      </h3>
                      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                        {etapa.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <SoilProfilePreview />
            </div>
          </div>
        </section>

        <section id="relatorio" className="landing-section scroll-mt-24">
          <div className="landing-container">
            <div className="landing-report-shell overflow-hidden rounded-[30px] border border-zinc-800 bg-[#17171a] text-white shadow-2xl shadow-zinc-950/15">
              <div className="grid lg:grid-cols-[0.86fr_1.14fr]">
                <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16">
                  <div>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                      <FileText className="h-5 w-5 text-violet-300" />
                    </div>
                    <h2 className="landing-display mt-8 max-w-lg text-4xl font-medium leading-[1.03] tracking-[-0.055em] sm:text-6xl">
                      O resultado não termina em um número.
                    </h2>
                    <p className="mt-6 max-w-md text-sm leading-7 text-zinc-400 sm:text-base">
                      Reúna identificação da obra, dados de entrada, critérios
                      adotados e resultados em um documento que explica o
                      cálculo.
                    </p>
                  </div>

                  <div className="mt-10 space-y-3 text-sm text-zinc-300">
                    <DarkCheck>Premissas e parâmetros registrados</DarkCheck>
                    <DarkCheck>Resultados com leitura objetiva</DarkCheck>
                    <DarkCheck>Documento pronto para compartilhar</DarkCheck>
                  </div>
                </div>

                <ReportPreview />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-black/[0.06] bg-white py-20 sm:py-28">
          <div className="landing-container">
            <div className="grid gap-8 sm:grid-cols-3 sm:gap-12">
              <TrustItem
                icon={LockKeyhole}
                title="Suas obras, no seu acesso"
                text="Cada projeto permanece associado à conta que o criou."
              />
              <TrustItem
                icon={ShieldCheck}
                title="Histórico organizado"
                text="Dados técnicos reunidos dentro do contexto correto."
              />
              <TrustItem
                icon={BarChart3}
                title="Decisão rastreável"
                text="Entradas e resultados apresentados de forma legível."
              />
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="landing-glow landing-glow-bottom pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/2" />
          <div className="landing-container relative text-center">
            <SectionEyebrow centered>Comece gratuitamente</SectionEyebrow>
            <h2 className="landing-display mx-auto mt-5 max-w-4xl text-[clamp(2.7rem,6.5vw,6.2rem)] font-medium leading-[0.98] tracking-[-0.065em] text-zinc-950">
              Seu próximo cálculo pode começar agora.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-zinc-600">
              Crie uma conta, abra sua primeira obra e mantenha a análise do
              início ao relatório em um único lugar.
            </p>
            <Link
              to={destinoPrincipal}
              className="landing-button landing-button-primary mt-9 min-w-[214px]"
            >
              {textoPrincipal}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/[0.07] bg-white">
        <div className="landing-container flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BrandMark compact />
            <div>
              <p className="text-sm font-semibold tracking-[-0.02em] text-zinc-900">
                EstacaHub
              </p>
              <p className="text-xs text-zinc-500">
                Engenharia de fundações, organizada.
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} EstacaHub. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function BrandMark({ compact = false }) {
  return (
    <span
      className={`landing-brand-mark ${compact ? "h-8 w-8 rounded-[10px]" : "h-9 w-9 rounded-xl"}`}
      aria-hidden="true"
    >
      <span className="landing-brand-line landing-brand-line-1" />
      <span className="landing-brand-line landing-brand-line-2" />
      <span className="landing-brand-line landing-brand-line-3" />
      <span className="landing-brand-dot" />
    </span>
  );
}

function MicroBenefit({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Check className="h-3.5 w-3.5 text-violet-600" aria-hidden="true" />
      {children}
    </span>
  );
}

function Capability({ icon: Icon, label }) {
  return (
    <div className="flex items-center justify-center gap-3 px-5 py-5 text-sm font-medium text-zinc-600 sm:py-6">
      <Icon className="h-4 w-4 text-violet-600" strokeWidth={1.8} />
      {label}
    </div>
  );
}

function SectionEyebrow({ children, centered = false }) {
  return (
    <div
      className={`flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-violet-700 ${
        centered ? "justify-center" : ""
      }`}
    >
      <span className="h-px w-5 bg-violet-400" />
      {children}
    </div>
  );
}

function FeatureCard({ icon: Icon, index, title, description }) {
  return (
    <article className="group border-b border-black/[0.07] py-10 md:border-b-0 md:px-8 md:py-12 first:md:pl-0 last:md:pr-0">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
          <Icon className="h-5 w-5" strokeWidth={1.7} />
        </span>
        <span className="font-mono text-[10px] tracking-[0.12em] text-zinc-400">
          FIG {index}
        </span>
      </div>
      <h3 className="mt-12 text-lg font-semibold tracking-[-0.025em] text-zinc-950">
        {title}
      </h3>
      <p className="mt-3 max-w-xs text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </article>
  );
}

function CheckItem({ children }) {
  return (
    <li className="flex items-start gap-3 text-sm font-medium text-zinc-700">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
        <Check className="h-3 w-3" strokeWidth={2.5} />
      </span>
      {children}
    </li>
  );
}

function DarkCheck({ children }) {
  return (
    <div className="flex items-center gap-3">
      <CircleCheck className="h-4 w-4 text-violet-300" strokeWidth={1.8} />
      {children}
    </div>
  );
}

function TrustItem({ icon: Icon, title, text }) {
  return (
    <article className="border-l border-black/[0.07] pl-5 sm:first:border-l-0 sm:first:pl-0">
      <Icon className="h-5 w-5 text-violet-600" strokeWidth={1.7} />
      <h3 className="mt-5 text-base font-semibold tracking-[-0.025em] text-zinc-950">
        {title}
      </h3>
      <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">{text}</p>
    </article>
  );
}

function ProductPreview() {
  return (
    <div className="landing-product relative overflow-hidden rounded-[22px] border border-zinc-300/80 bg-[#f9f9fb] p-2 shadow-[0_32px_90px_rgba(24,24,27,0.18)] sm:rounded-[28px] sm:p-3">
      <div className="overflow-hidden rounded-[16px] border border-zinc-200 bg-white sm:rounded-[20px]">
        <div className="flex h-11 items-center justify-between border-b border-zinc-200 bg-zinc-50/80 px-4">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          </div>
          <div className="hidden rounded-md border border-zinc-200 bg-white px-16 py-1 text-[9px] text-zinc-400 sm:block">
            www.estacahub.com
          </div>
          <span className="h-5 w-5 rounded-md border border-zinc-200 bg-white" />
        </div>

        <div className="grid min-h-[430px] grid-cols-[58px_1fr] sm:min-h-[520px] sm:grid-cols-[188px_1fr]">
          <aside className="border-r border-zinc-200 bg-[#fafafa] p-3 sm:p-4">
            <div className="flex items-center gap-2 border-b border-zinc-200 pb-4">
              <BrandMark compact />
              <span className="hidden text-xs font-semibold text-zinc-800 sm:block">
                EstacaHub
              </span>
            </div>
            <div className="mt-5 space-y-2">
              <PreviewNav active icon={Building2} label="Dados da obra" />
              <PreviewNav icon={Layers3} label="Sondagens" />
              <PreviewNav icon={Ruler} label="Estacas" />
              <PreviewNav icon={Gauge} label="Carga admissível" />
              <PreviewNav icon={BarChart3} label="Resultados" />
              <PreviewNav icon={FileText} label="Relatórios" />
            </div>
          </aside>

          <div className="min-w-0 bg-[#f7f7f9]">
            <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-zinc-400 sm:text-[9px]">
                  Obra aberta
                </p>
                <p className="truncate text-[11px] font-semibold text-zinc-800 sm:text-xs">
                  Edifício Jardim Atlântico
                </p>
              </div>
              <div className="flex h-7 items-center rounded-lg bg-violet-50 px-2.5 text-[9px] font-semibold text-violet-700 sm:px-3">
                Sincronizada
              </div>
            </div>

            <div className="p-3 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-violet-600">
                    Cálculo
                  </p>
                  <h3 className="mt-1 text-base font-semibold tracking-[-0.03em] text-zinc-900 sm:text-xl">
                    Carga admissível
                  </h3>
                </div>
                <span className="hidden rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[9px] font-semibold text-zinc-500 sm:inline-flex">
                  Salvo agora
                </span>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[1.12fr_0.88fr]">
                <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <p className="text-[10px] font-semibold text-zinc-800 sm:text-xs">
                      Parâmetros da estaca
                    </p>
                    <span className="text-[8px] text-zinc-400 sm:text-[9px]">
                      E-12
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <PreviewField label="Tipo" value="Hélice contínua" />
                    <PreviewField label="Diâmetro" value="40 cm" />
                    <PreviewField label="Comprimento" value="16,0 m" />
                    <PreviewField label="Sondagem" value="SPT-01" />
                  </div>
                  <MiniChart />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-600 to-indigo-600 p-4 text-white shadow-lg shadow-violet-500/15 sm:rounded-2xl sm:p-5">
                    <p className="text-[9px] font-medium text-violet-100 sm:text-[10px]">
                      Carga admissível calculada
                    </p>
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-2xl font-semibold tracking-[-0.05em] sm:text-4xl">
                        1.086
                      </span>
                      <span className="text-xs font-medium text-violet-100">
                        kN
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 border-t border-white/15 pt-3 text-[9px] font-medium text-violet-50">
                      <CircleCheck className="h-3.5 w-3.5" />
                      Verificação concluída
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-2xl">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-semibold text-zinc-700 sm:text-[10px]">
                        Composição da resistência
                      </p>
                      <BarChart3 className="h-3.5 w-3.5 text-zinc-400" />
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div className="h-full w-[68%] rounded-full bg-violet-500" />
                    </div>
                    <div className="mt-3 flex justify-between text-[8px] text-zinc-400">
                      <span>Lateral 68%</span>
                      <span>Ponta 32%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="absolute -bottom-3 right-6 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[9px] font-medium text-zinc-400 shadow-sm sm:right-10">
        Exemplo visual
      </span>
    </div>
  );
}

function PreviewNav({ icon: Icon, label, active = false }) {
  return (
    <div
      className={`flex h-8 items-center gap-2 rounded-lg px-2 text-[9px] font-medium sm:px-2.5 ${
        active
          ? "bg-violet-600 text-white shadow-sm"
          : "text-zinc-500"
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
      <span className="hidden truncate sm:block">{label}</span>
    </div>
  );
}

function PreviewField({ label, value }) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-2.5">
      <p className="text-[7px] uppercase tracking-[0.1em] text-zinc-400 sm:text-[8px]">
        {label}
      </p>
      <p className="mt-1 truncate text-[9px] font-semibold text-zinc-700 sm:text-[10px]">
        {value}
      </p>
    </div>
  );
}

function MiniChart() {
  return (
    <div className="mt-4 rounded-lg border border-zinc-100 bg-zinc-50 p-2 sm:p-3">
      <div className="mb-2 flex items-center justify-between text-[8px] text-zinc-400">
        <span>Resistência × profundidade</span>
        <span>0–16 m</span>
      </div>
      <svg
        viewBox="0 0 310 72"
        className="h-14 w-full"
        role="img"
        aria-label="Gráfico ilustrativo da resistência por profundidade"
      >
        <defs>
          <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 66H310" stroke="#e4e4e7" strokeWidth="1" />
        <path d="M0 44H310" stroke="#ececf0" strokeDasharray="3 4" />
        <path d="M0 22H310" stroke="#ececf0" strokeDasharray="3 4" />
        <path
          d="M0 61 C35 58 47 52 68 53 C95 54 108 39 134 42 C162 44 178 26 203 30 C233 34 247 16 274 18 C290 19 301 10 310 8 L310 72 L0 72 Z"
          fill="url(#chart-fill)"
        />
        <path
          d="M0 61 C35 58 47 52 68 53 C95 54 108 39 134 42 C162 44 178 26 203 30 C233 34 247 16 274 18 C290 19 301 10 310 8"
          fill="none"
          stroke="#7c3aed"
          strokeLinecap="round"
          strokeWidth="2.5"
        />
      </svg>
    </div>
  );
}

function WorkspacePreview() {
  return (
    <div className="landing-workspace-card relative overflow-hidden rounded-[28px] border border-zinc-200 bg-white p-4 shadow-[0_24px_80px_rgba(24,24,27,0.1)] sm:p-6">
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-100/70 blur-3xl" />
      <div className="relative flex items-center justify-between border-b border-zinc-100 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
            Obra Jardim Atlântico
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-900">
            Perfil geotécnico consolidado
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
          Completo
        </span>
      </div>

      <div className="relative mt-5 grid gap-4 sm:grid-cols-[1fr_0.86fr]">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-800">SPT-01</p>
            <span className="text-[9px] text-zinc-400">Prof. 18,45 m</span>
          </div>
          <div className="mt-4 grid grid-cols-[30px_1fr] gap-3">
            <div className="flex flex-col justify-between py-1 text-right font-mono text-[8px] text-zinc-400">
              <span>0 m</span>
              <span>5 m</span>
              <span>10 m</span>
              <span>15 m</span>
              <span>18 m</span>
            </div>
            <div className="h-72 overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <div className="h-[16%] bg-[#dac4a6] p-2 text-[8px] font-medium text-[#73593b]">
                Aterro
              </div>
              <div className="h-[27%] bg-[#f2c978] p-2 text-[8px] font-medium text-[#7b5814]">
                Areia siltosa
              </div>
              <div className="h-[31%] bg-[#ba916b] p-2 text-[8px] font-medium text-[#513923]">
                Argila arenosa
              </div>
              <div className="h-[26%] bg-[#d6a94f] p-2 text-[8px] font-medium text-[#65480e]">
                Areia compacta
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <MetricCard label="Sondagens" value="3" detail="perfis cadastrados" />
          <MetricCard label="Estacas" value="18" detail="elementos analisados" />
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.11em] text-violet-500">
              Próxima ação
            </p>
            <p className="mt-2 text-xs font-semibold text-violet-950">
              Revisar resultados
            </p>
            <p className="mt-1 text-[10px] leading-4 text-violet-700/70">
              Cálculos prontos para conferência.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-[9px] uppercase tracking-[0.11em] text-zinc-400">
        {label}
      </p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <span className="text-2xl font-semibold tracking-[-0.04em] text-zinc-900">
          {value}
        </span>
        <span className="pb-1 text-right text-[9px] text-zinc-400">
          {detail}
        </span>
      </div>
    </div>
  );
}

function SoilProfilePreview() {
  const layers = [
    { depth: "0–2 m", name: "Aterro", color: "#dfc7a7", nspt: "3" },
    { depth: "2–6 m", name: "Areia siltosa", color: "#e9c070", nspt: "8" },
    { depth: "6–12 m", name: "Argila arenosa", color: "#b88b66", nspt: "15" },
    { depth: "12–18 m", name: "Areia compacta", color: "#c99b3d", nspt: "28" },
  ];

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-zinc-200 bg-[#f8f8fa] p-5 shadow-sm sm:p-8">
      <div className="landing-blueprint pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-violet-600">
            Perfil SPT-01
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-zinc-900">
            Leitura do subsolo
          </h3>
        </div>
        <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[9px] font-medium text-zinc-500">
          N.A. 3,20 m
        </span>
      </div>

      <div className="relative mt-8 grid grid-cols-[1fr_74px] gap-5 sm:grid-cols-[1fr_110px]">
        <div className="overflow-hidden rounded-2xl border border-zinc-300 bg-white shadow-sm">
          {layers.map((layer, index) => (
            <div
              key={layer.depth}
              className="flex min-h-[68px] items-center justify-between border-b border-black/10 px-4 last:border-b-0 sm:min-h-[78px]"
              style={{ backgroundColor: layer.color }}
            >
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-black/45">
                  {layer.depth}
                </p>
                <p className="mt-1 text-xs font-semibold text-black/75">
                  {layer.name}
                </p>
              </div>
              <span className="rounded-md bg-white/45 px-2 py-1 font-mono text-[9px] font-semibold text-black/55">
                N {layer.nspt}
              </span>
              {index === 1 && (
                <span className="absolute left-0 right-[99px] border-t border-dashed border-sky-700/50 sm:right-[135px]" />
              )}
            </div>
          ))}
        </div>

        <div className="relative flex justify-center rounded-2xl border border-zinc-200 bg-white/80 py-5">
          <div className="relative h-full w-5 rounded-b-lg border-x-2 border-b-2 border-violet-400 bg-violet-100/60">
            <div className="absolute -top-3 left-1/2 h-5 w-10 -translate-x-1/2 rounded-md border border-violet-300 bg-white shadow-sm" />
            <div className="absolute bottom-0 left-1/2 h-[56%] w-2 -translate-x-1/2 rounded-t-full bg-violet-600" />
            <div className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-violet-600" />
          </div>
          <span className="absolute bottom-3 font-mono text-[8px] text-zinc-400">
            16,0 m
          </span>
        </div>
      </div>
    </div>
  );
}

function ReportPreview() {
  return (
    <div className="relative min-h-[560px] overflow-hidden bg-gradient-to-br from-zinc-900 to-[#26232d] p-7 sm:p-10 lg:p-14">
      <div className="absolute -right-28 -top-24 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="relative mx-auto max-w-md rotate-[1.2deg] rounded-[6px] bg-white p-5 text-zinc-900 shadow-[0_35px_80px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="flex items-start justify-between border-b border-zinc-200 pb-5">
          <div className="flex items-center gap-2.5">
            <BrandMark compact />
            <div>
              <p className="text-[10px] font-bold tracking-[-0.02em]">
                EstacaHub
              </p>
              <p className="text-[7px] text-zinc-400">Relatório técnico</p>
            </div>
          </div>
          <span className="font-mono text-[7px] text-zinc-400">RLT-00012</span>
        </div>

        <div className="py-6">
          <p className="text-[8px] font-semibold uppercase tracking-[0.13em] text-violet-600">
            Capacidade de carga
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em]">
            Edifício Jardim Atlântico
          </h3>
          <p className="mt-1 text-[8px] text-zinc-400">
            Estaca E-12 · Hélice contínua · Ø 40 cm
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <ReportMetric label="Comprimento" value="16,0 m" />
          <ReportMetric label="Carga admissível" value="1.086 kN" featured />
          <ReportMetric label="Sondagem" value="SPT-01" />
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 p-3">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-semibold">Resumo dos resultados</p>
            <span className="text-[7px] text-emerald-600">Verificado</span>
          </div>
          <div className="mt-4 space-y-2">
            <ReportRow label="Resistência lateral" value="738 kN" />
            <ReportRow label="Resistência de ponta" value="348 kN" />
            <ReportRow label="Carga admissível" value="1.086 kN" strong />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-[1fr_0.72fr] gap-3">
          <div className="rounded-lg bg-zinc-50 p-3">
            <p className="text-[7px] font-semibold text-zinc-500">
              Perfil considerado
            </p>
            <div className="mt-3 flex h-16 items-end gap-1">
              {[22, 34, 29, 48, 42, 58, 68, 63, 78, 88].map((height, index) => (
                <span
                  key={`${height}-${index}`}
                  className="flex-1 rounded-t-sm bg-violet-400"
                  style={{ height: `${height}%`, opacity: 0.45 + index * 0.045 }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-lg bg-violet-50 p-3">
            <p className="text-[7px] font-semibold text-violet-700">
              Status da análise
            </p>
            <CircleCheck className="h-6 w-6 text-violet-600" />
            <p className="text-[7px] leading-3 text-violet-700/70">
              Dados completos para emissão.
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-end justify-between border-t border-zinc-200 pt-4 text-[6px] text-zinc-400">
          <span>Documento gerado pelo EstacaHub</span>
          <span>01 / 08</span>
        </div>
      </div>
    </div>
  );
}

function ReportMetric({ label, value, featured = false }) {
  return (
    <div
      className={`rounded-lg p-2.5 ${
        featured ? "bg-violet-600 text-white" : "bg-zinc-100"
      }`}
    >
      <p className={`text-[6px] ${featured ? "text-violet-200" : "text-zinc-400"}`}>
        {label}
      </p>
      <p className="mt-1 text-[8px] font-semibold">{value}</p>
    </div>
  );
}

function ReportRow({ label, value, strong = false }) {
  return (
    <div
      className={`flex items-center justify-between border-b border-zinc-100 pb-2 text-[7px] last:border-0 last:pb-0 ${
        strong ? "font-semibold text-zinc-900" : "text-zinc-500"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
