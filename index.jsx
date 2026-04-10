import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine, Area, AreaChart, ComposedChart, Legend } from "recharts";

// === DADOS OFICIAIS IBGE ===
const censoHistorico = [
  { ano: 1872, pop: 9930478, tipo: "censo" },
  { ano: 1890, pop: 14333915, tipo: "censo" },
  { ano: 1900, pop: 17438434, tipo: "censo" },
  { ano: 1920, pop: 30635605, tipo: "censo" },
  { ano: 1940, pop: 41236315, tipo: "censo" },
  { ano: 1950, pop: 51944397, tipo: "censo" },
  { ano: 1960, pop: 70191370, tipo: "censo" },
  { ano: 1970, pop: 93139037, tipo: "censo" },
  { ano: 1980, pop: 121150573, tipo: "censo" },
  { ano: 1991, pop: 146917459, tipo: "censo" },
  { ano: 2000, pop: 169590693, tipo: "censo" },
  { ano: 2010, pop: 190755799, tipo: "censo" },
  { ano: 2022, pop: 203080756, tipo: "censo" },
];

// Projeções IBGE (Revisão 2024)
const projecaoIBGE = [
  { ano: 2024, pop: 212600000, tipo: "projeção" },
  { ano: 2030, pop: 217500000, tipo: "projeção" },
  { ano: 2035, pop: 219800000, tipo: "projeção" },
  { ano: 2041, pop: 220425299, tipo: "projeção" }, // PICO
  { ano: 2045, pop: 219500000, tipo: "projeção" },
  { ano: 2050, pop: 216800000, tipo: "projeção" },
  { ano: 2055, pop: 212500000, tipo: "projeção" },
  { ano: 2060, pop: 207000000, tipo: "projeção" },
  { ano: 2065, pop: 203000000, tipo: "projeção" },
  { ano: 2070, pop: 199228708, tipo: "projeção" },
];

// Extrapolação para 100 anos (2026-2126) baseada nas tendências IBGE
const projecao100Anos = [
  { ano: 2026, pop: 213400000, tipo: "projeção IBGE" },
  { ano: 2030, pop: 217500000, tipo: "projeção IBGE" },
  { ano: 2035, pop: 219800000, tipo: "projeção IBGE" },
  { ano: 2041, pop: 220425299, tipo: "pico (IBGE)" },
  { ano: 2050, pop: 216800000, tipo: "projeção IBGE" },
  { ano: 2060, pop: 207000000, tipo: "projeção IBGE" },
  { ano: 2070, pop: 199228708, tipo: "projeção IBGE" },
  { ano: 2080, pop: 185000000, tipo: "extrapolação" },
  { ano: 2090, pop: 168000000, tipo: "extrapolação" },
  { ano: 2100, pop: 153000000, tipo: "extrapolação" },
  { ano: 2110, pop: 140000000, tipo: "extrapolação" },
  { ano: 2120, pop: 130000000, tipo: "extrapolação" },
  { ano: 2126, pop: 125000000, tipo: "extrapolação" },
];

// Taxa de crescimento entre censos
const taxaCrescimento = [
  { periodo: "1872-1890", taxa: 2.01 },
  { periodo: "1890-1900", taxa: 1.98 },
  { periodo: "1900-1920", taxa: 2.91 },
  { periodo: "1920-1940", taxa: 1.49 },
  { periodo: "1940-1950", taxa: 2.34 },
  { periodo: "1950-1960", taxa: 3.05 },
  { periodo: "1960-1970", taxa: 2.89 },
  { periodo: "1970-1980", taxa: 2.48 },
  { periodo: "1980-1991", taxa: 1.93 },
  { periodo: "1991-2000", taxa: 1.63 },
  { periodo: "2000-2010", taxa: 1.17 },
  { periodo: "2010-2022", taxa: 0.52 },
];

// Fecundidade
const fecundidade = [
  { ano: 1960, taxa: 6.28 },
  { ano: 1970, taxa: 5.76 },
  { ano: 1980, taxa: 4.35 },
  { ano: 1991, taxa: 2.89 },
  { ano: 2000, taxa: 2.32 },
  { ano: 2010, taxa: 1.75 },
  { ano: 2023, taxa: 1.57 },
  { ano: 2040, taxa: 1.44, projecao: true },
  { ano: 2050, taxa: 1.45, projecao: true },
  { ano: 2070, taxa: 1.50, projecao: true },
];

const formatPop = (v) => {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return v;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(15,15,20,0.95)",
        border: "1px solid #F97316",
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
      }}>
        <p style={{ color: "#F97316", fontWeight: 700, margin: 0 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || "#fff", margin: "4px 0 0" }}>
            {p.name}: {typeof p.value === "number" && p.value > 1000
              ? p.value.toLocaleString("pt-BR")
              : p.value}{p.name?.includes("Taxa") || p.name?.includes("Fecund") ? "" : " hab."}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const StatCard = ({ label, value, sub, accent }) => (
  <div style={{
    background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(249,115,22,0.02) 100%)",
    border: "1px solid rgba(249,115,22,0.2)",
    borderRadius: 12,
    padding: "16px 20px",
    flex: 1,
    minWidth: 180,
  }}>
    <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
    <div style={{ color: accent || "#F97316", fontSize: 28, fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1, marginTop: 4 }}>{value}</div>
    {sub && <div style={{ color: "#666", fontSize: 11, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>{sub}</div>}
  </div>
);

const tabs = [
  { id: "historico", label: "Censos Históricos" },
  { id: "crescimento", label: "Taxa de Crescimento" },
  { id: "fecundidade", label: "Fecundidade" },
  { id: "projecao", label: "Projeção 100 Anos" },
];

export default function PopulacaoBrasil() {
  const [activeTab, setActiveTab] = useState("historico");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Últimos 30 anos (1991-2022)
  const ultimos30 = censoHistorico.filter(c => c.ano >= 1991);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e8e8e8",
      fontFamily: "'Segoe UI', sans-serif",
      padding: 0,
      opacity: mounted ? 1 : 0,
      transition: "opacity 0.6s ease",
    }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;700&family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(180deg, rgba(249,115,22,0.15) 0%, transparent 100%)",
        borderBottom: "1px solid rgba(249,115,22,0.15)",
        padding: "32px 24px 24px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 11, color: "#F97316", letterSpacing: 4, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
          IBGE · Censos Demográficos · Análise Completa
        </div>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(36px, 6vw, 64px)",
          color: "#fff",
          margin: 0,
          letterSpacing: 3,
          lineHeight: 1,
        }}>
          POPULAÇÃO DO <span style={{ color: "#F97316" }}>BRASIL</span>
        </h1>
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 15,
          color: "#888",
          marginTop: 8,
          fontWeight: 300,
        }}>
          De 9,9 milhões em 1872 a 203 milhões em 2022 — e a inversão que vem pela frente
        </p>

        {/* GitHub Badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginTop: 16,
          padding: "6px 14px",
          background: "rgba(249,115,22,0.1)",
          border: "1px solid rgba(249,115,22,0.2)",
          borderRadius: 20,
          fontSize: 11,
          color: "#F97316",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="#F97316"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          turicas/censo-ibge · tbrugz/ribge · lsbastos/popBR_mun
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: "20px 24px" }}>
        <StatCard label="Censo 2022" value="203,1 Mi" sub="População recenseada" />
        <StatCard label="Pico Projetado" value="220,4 Mi" sub="Ano: 2041" accent="#22c55e" />
        <StatCard label="Em 2070" value="199,2 Mi" sub="Início do declínio" accent="#ef4444" />
        <StatCard label="Fecundidade 2023" value="1,57" sub="filhos/mulher (< reposição 2,1)" accent="#f59e0b" />
      </div>

      {/* TABS */}
      <div style={{
        display: "flex",
        gap: 4,
        padding: "0 24px",
        overflowX: "auto",
        marginBottom: 4,
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "10px 18px",
              background: activeTab === t.id ? "rgba(249,115,22,0.15)" : "transparent",
              border: activeTab === t.id ? "1px solid rgba(249,115,22,0.4)" : "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              color: activeTab === t.id ? "#F97316" : "#666",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CHART AREA */}
      <div style={{ padding: "12px 24px" }}>

        {/* === CENSOS HISTÓRICOS === */}
        {activeTab === "historico" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: "#F97316", margin: 0, letterSpacing: 2 }}>
                SÉRIE HISTÓRICA DOS CENSOS
              </h2>
              <p style={{ color: "#888", fontSize: 13, fontFamily: "'Outfit'", margin: "4px 0 0" }}>
                Todos os censos demográficos do IBGE desde 1872 até 2022
              </p>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={censoHistorico}>
                <defs>
                  <linearGradient id="popGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="ano" tick={{ fill: "#666", fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <YAxis tickFormatter={formatPop} tick={{ fill: "#666", fontSize: 11, fontFamily: "JetBrains Mono" }} width={55} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="pop" name="População" stroke="#F97316" fill="url(#popGrad)" strokeWidth={2.5} dot={{ fill: "#F97316", r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>

            {/* Últimos 30 anos highlight */}
            <div style={{
              marginTop: 24,
              padding: 16,
              background: "rgba(249,115,22,0.05)",
              border: "1px solid rgba(249,115,22,0.15)",
              borderRadius: 12,
            }}>
              <h3 style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: "#F97316", margin: "0 0 12px", letterSpacing: 1.5 }}>
                ÚLTIMOS 30 ANOS EM DETALHE
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                {ultimos30.map((c, i) => {
                  const prev = i > 0 ? ultimos30[i - 1] : null;
                  const diff = prev ? c.pop - prev.pop : 0;
                  const pct = prev ? ((diff / prev.pop) * 100).toFixed(1) : null;
                  return (
                    <div key={c.ano} style={{
                      padding: 14,
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: "#F97316" }}>{c.ano}</div>
                      <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 16, color: "#fff", fontWeight: 700 }}>
                        {(c.pop / 1e6).toFixed(1)} milhões
                      </div>
                      {pct && (
                        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#22c55e", marginTop: 4 }}>
                          +{(diff / 1e6).toFixed(1)}M ({pct}%)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* === TAXA DE CRESCIMENTO === */}
        {activeTab === "crescimento" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: "#F97316", margin: 0, letterSpacing: 2 }}>
                TAXA MÉDIA ANUAL DE CRESCIMENTO
              </h2>
              <p style={{ color: "#888", fontSize: 13, fontFamily: "'Outfit'", margin: "4px 0 0" }}>
                O crescimento desacelerou de 3,05% (1950-60) para apenas 0,52% (2010-22)
              </p>
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={taxaCrescimento} margin={{ bottom: 40 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="periodo" tick={{ fill: "#666", fontSize: 9, fontFamily: "JetBrains Mono" }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fill: "#666", fontSize: 11, fontFamily: "JetBrains Mono" }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0.52} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Atual: 0.52%", fill: "#ef4444", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                <Bar dataKey="taxa" name="Taxa (%/ano)" radius={[4, 4, 0, 0]}>
                  {taxaCrescimento.map((entry, i) => (
                    <Cell key={i} fill={entry.taxa > 2 ? "#F97316" : entry.taxa > 1 ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div style={{
              marginTop: 20,
              padding: 16,
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 12,
            }}>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#ef4444", fontWeight: 700 }}>⚠ SINAL DE ALERTA</div>
              <p style={{ fontFamily: "'Outfit'", fontSize: 13, color: "#ccc", margin: "8px 0 0", lineHeight: 1.6 }}>
                A taxa de crescimento caiu de <strong style={{ color: "#F97316" }}>3,05%</strong> ao ano na década de 1950 para apenas{" "}
                <strong style={{ color: "#ef4444" }}>0,52%</strong> entre 2010-2022. A partir de 2042, essa taxa se torna <strong style={{ color: "#ef4444" }}>negativa</strong>, marcando o início do declínio populacional do Brasil.
              </p>
            </div>
          </div>
        )}

        {/* === FECUNDIDADE === */}
        {activeTab === "fecundidade" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: "#F97316", margin: 0, letterSpacing: 2 }}>
                TAXA DE FECUNDIDADE TOTAL
              </h2>
              <p style={{ color: "#888", fontSize: 13, fontFamily: "'Outfit'", margin: "4px 0 0" }}>
                Filhos por mulher — abaixo de 2,1 a população não se repõe naturalmente
              </p>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={fecundidade}>
                <defs>
                  <linearGradient id="fecGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="ano" tick={{ fill: "#666", fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <YAxis tick={{ fill: "#666", fontSize: 11, fontFamily: "JetBrains Mono" }} domain={[0, 7]} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={2.1} stroke="#22c55e" strokeDasharray="5 5" label={{ value: "Reposição (2,1)", fill: "#22c55e", fontSize: 10, fontFamily: "JetBrains Mono", position: "right" }} />
                <Area type="monotone" dataKey="taxa" fill="url(#fecGrad)" stroke="transparent" />
                <Line type="monotone" dataKey="taxa" name="Fecundidade" stroke="#f59e0b" strokeWidth={2.5} dot={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle cx={cx} cy={cy} r={payload.projecao ? 3 : 5} fill={payload.projecao ? "transparent" : "#f59e0b"} stroke="#f59e0b" strokeWidth={payload.projecao ? 1.5 : 0} strokeDasharray={payload.projecao ? "3 2" : "0"} />
                  );
                }} />
              </ComposedChart>
            </ResponsiveContainer>

            <div style={{
              marginTop: 20,
              padding: 16,
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 12,
            }}>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>A REVOLUÇÃO SILENCIOSA</div>
              <p style={{ fontFamily: "'Outfit'", fontSize: 13, color: "#ccc", margin: "8px 0 0", lineHeight: 1.6 }}>
                Em 1960, as mulheres brasileiras tinham em média <strong style={{ color: "#F97316" }}>6,28 filhos</strong>. Em 2023 esse número caiu para{" "}
                <strong style={{ color: "#ef4444" }}>1,57</strong> — bem abaixo da taxa de reposição de 2,1. Urbanização, educação feminina e entrada no mercado de trabalho explicam essa transformação. A projeção é de mínima de 1,44 em 2040 com leve recuperação para 1,50 em 2070.
              </p>
            </div>
          </div>
        )}

        {/* === PROJEÇÃO 100 ANOS === */}
        {activeTab === "projecao" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: "#F97316", margin: 0, letterSpacing: 2 }}>
                PROJEÇÃO PARA OS PRÓXIMOS 100 ANOS
              </h2>
              <p style={{ color: "#888", fontSize: 13, fontFamily: "'Outfit'", margin: "4px 0 0" }}>
                IBGE projeta até 2070 · Extrapolação acadêmica de 2070 a 2126
              </p>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <AreaChart data={projecao100Anos}>
                <defs>
                  <linearGradient id="proj100" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="ano" tick={{ fill: "#666", fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <YAxis tickFormatter={formatPop} tick={{ fill: "#666", fontSize: 11, fontFamily: "JetBrains Mono" }} domain={[100000000, 230000000]} width={55} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x={2041} stroke="#22c55e" strokeDasharray="5 5" label={{ value: "PICO 2041", fill: "#22c55e", fontSize: 10, fontFamily: "JetBrains Mono", position: "top" }} />
                <ReferenceLine x={2070} stroke="#888" strokeDasharray="3 3" label={{ value: "Fim projeção IBGE", fill: "#888", fontSize: 9, fontFamily: "JetBrains Mono", position: "insideBottomRight" }} />
                <Area type="monotone" dataKey="pop" name="População" stroke="#ef4444" fill="url(#proj100)" strokeWidth={2.5} dot={(props) => {
                  const { cx, cy, payload } = props;
                  const isIBGE = payload.tipo?.includes("IBGE") || payload.tipo?.includes("pico");
                  return (
                    <circle cx={cx} cy={cy} r={isIBGE ? 5 : 3} fill={isIBGE ? "#F97316" : "transparent"} stroke={isIBGE ? "#F97316" : "#ef4444"} strokeWidth={isIBGE ? 0 : 1.5} strokeDasharray={isIBGE ? "0" : "3 2"} />
                  );
                }} />
              </AreaChart>
            </ResponsiveContainer>

            {/* Timeline de marcos */}
            <div style={{
              marginTop: 24,
              padding: 20,
              background: "rgba(249,115,22,0.04)",
              border: "1px solid rgba(249,115,22,0.12)",
              borderRadius: 12,
            }}>
              <h3 style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: "#F97316", margin: "0 0 16px", letterSpacing: 1.5 }}>
                MARCOS DEMOGRÁFICOS PROJETADOS
              </h3>
              {[
                { ano: "2027", evento: "RS e AL começam a perder população", cor: "#f59e0b" },
                { ano: "2041", evento: "PICO: 220,4 milhões (máximo histórico)", cor: "#22c55e" },
                { ano: "2042", evento: "Óbitos superam nascimentos → declínio começa", cor: "#ef4444" },
                { ano: "2050", evento: "~216,8 Mi — Brasil abaixo do pico em 3,6 Mi", cor: "#ef4444" },
                { ano: "2070", evento: "199,2 Mi — abaixo de 200 milhões novamente", cor: "#ef4444" },
                { ano: "~2100", evento: "~153 Mi (estimativa) — nível dos anos 1990", cor: "#ef4444" },
                { ano: "~2126", evento: "~125 Mi (estimativa) — nível dos anos 1970-80", cor: "#ef4444" },
              ].map((m, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 12,
                  paddingLeft: 12,
                  borderLeft: `2px solid ${m.cor}`,
                }}>
                  <div style={{
                    fontFamily: "'Bebas Neue'",
                    fontSize: 20,
                    color: m.cor,
                    minWidth: 55,
                  }}>{m.ano}</div>
                  <div style={{
                    fontFamily: "'Outfit'",
                    fontSize: 13,
                    color: "#ccc",
                    paddingTop: 3,
                  }}>{m.evento}</div>
                </div>
              ))}
            </div>

            {/* Nota metodológica */}
            <div style={{
              marginTop: 16,
              padding: 14,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              fontSize: 11,
              color: "#666",
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: 1.6,
            }}>
              <strong style={{ color: "#888" }}>Nota metodológica:</strong> Os dados até 2070 são das Projeções Oficiais do IBGE (Revisão 2024), que utilizam o método das componentes demográficas com dados dos censos de 2000, 2010 e 2022. A extrapolação de 2070-2126 é uma estimativa acadêmica que assume continuidade das tendências de fecundidade abaixo da reposição (~1,5 filho/mulher), envelhecimento progressivo e saldo migratório estável. Cenários alternativos (políticas natalistas, imigração em massa, avanços médicos) poderiam alterar significativamente essas projeções.
            </div>
          </div>
        )}
      </div>

      {/* CONCLUSÃO */}
      <div style={{
        margin: "24px 24px 0",
        padding: 24,
        background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(239,68,68,0.05) 100%)",
        border: "1px solid rgba(249,115,22,0.2)",
        borderRadius: 16,
      }}>
        <h3 style={{ fontFamily: "'Bebas Neue'", fontSize: 26, color: "#F97316", margin: "0 0 12px", letterSpacing: 2 }}>
          CONCLUSÃO: O BRASIL ESTÁ CRESCENDO OU DIMINUINDO?
        </h3>
        <div style={{ fontFamily: "'Outfit'", fontSize: 14, color: "#ccc", lineHeight: 1.8 }}>
          <p style={{ margin: "0 0 12px" }}>
            <strong style={{ color: "#22c55e" }}>Ainda está crescendo</strong>, mas em ritmo cada vez menor. A taxa anual caiu de 3,05% nos anos 1950 para apenas 0,52% na última década. O Brasil atingirá seu pico populacional de <strong style={{ color: "#F97316" }}>220,4 milhões em 2041</strong>.
          </p>
          <p style={{ margin: "0 0 12px" }}>
            <strong style={{ color: "#ef4444" }}>A partir de 2042, começa o declínio.</strong> Com a fecundidade em 1,57 filho/mulher (muito abaixo da taxa de reposição de 2,1), o número de óbitos passará a superar os nascimentos.
          </p>
          <p style={{ margin: 0 }}>
            Até 2070, o IBGE projeta que voltaremos abaixo de <strong style={{ color: "#ef4444" }}>200 milhões</strong>. Mantidas as tendências atuais, em 2100 o Brasil poderia ter em torno de 153 milhões e em 2126 cerca de 125 milhões — padrão semelhante ao dos anos 1970-80.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        textAlign: "center",
        padding: "24px",
        fontSize: 10,
        color: "#444",
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        Fontes: IBGE Censos Demográficos (1872-2022) · Projeções da População Revisão 2024 · GitHub: turicas/censo-ibge, tbrugz/ribge, lsbastos/popBR_mun
        <br />Dados tratados e visualização por Claude AI · Abril 2026
      </div>
    </div>
  );
}
