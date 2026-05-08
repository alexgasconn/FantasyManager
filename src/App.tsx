/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, User, Users, Store, Trophy, LogOut, ArrowUpDown, BarChart, Settings, Calendar, LayoutTemplate } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Scatter, ComposedChart, ReferenceArea, ReferenceLine } from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const PlayerDetails = ({ playerSlug, isOpen, onClose, enhancedCatalog, teams }: { playerSlug: string | null; isOpen: boolean; onClose: () => void, enhancedCatalog: any[], teams: any }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const enhancedData = useMemo(() => {
    return enhancedCatalog.find((p) => p.slug === playerSlug);
  }, [enhancedCatalog, playerSlug]);

  useEffect(() => {
    if (!playerSlug || !isOpen) return;
    setLoading(true);
    fetch(`/api/biwenger/player/${playerSlug}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d.data);
      })
      .finally(() => setLoading(false));
  }, [playerSlug, isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="w-[90vw] sm:max-w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalles del Jugador</SheetTitle>
          <SheetDescription>
            {enhancedData && teams?.[enhancedData.teamID]?.name}
          </SheetDescription>
        </SheetHeader>
        {loading || !data ? (
          <div className="space-y-4 mt-8">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border rounded-sm">
                <AvatarImage src={`https://img.biwenger.com/players/${data.slug}.png`} />
                <AvatarFallback>{data.name?.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{data.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                   <Badge variant="outline">{{1:"POR", 2:"DEF", 3:"CEN", 4:"DEL"}[data.position as number] || data.position}</Badge>
                   <span className="text-sm font-semibold text-emerald-600">
                     {new Intl.NumberFormat('es-ES').format(data.price)} €
                   </span>
                   {enhancedData?.marketLabel && (
                     <Badge variant="outline" className={enhancedData.marketLabel.includes('CHOLLO') || enhancedData.marketLabel.includes('Ganga') || enhancedData.marketLabel.includes('APTO') ? 'text-emerald-600 border-emerald-600 bg-emerald-50' : enhancedData.marketLabel === 'En Alza' || enhancedData.marketLabel === 'Buen Momento' ? 'text-blue-600 border-blue-600 bg-blue-50' : enhancedData.marketLabel.includes('Sobrevalorado') ? 'text-red-500 border-red-500 bg-red-50' : enhancedData.marketLabel === 'Cuidado' ? 'text-orange-500 border-orange-500 bg-orange-50' : 'bg-slate-100'}>
                       {enhancedData.marketLabel}
                     </Badge>
                   )}
                </div>
              </div>
              {enhancedData && (
                 <div className="text-right">
                   <div className="text-3xl font-black text-slate-800">{enhancedData.playerScore}</div>
                   <div className="text-[10px] uppercase font-bold text-slate-400">Score IA</div>
                 </div>
              )}
            </div>

            {enhancedData?.nextMatch && (
              <div className="p-5 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 border border-indigo-100 rounded-xl flex flex-col gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-600">Próximo Encuentro</p>
                    <Badge variant="outline" className="bg-white/60 text-[10px] border-indigo-200 text-indigo-700">{enhancedData.nextMatch.isHome ? 'Juega en Casa' : 'Juega Fuera'}</Badge>
                  </div>
                  <div className="flex items-center gap-2 bg-white/50 px-2 py-1 rounded-md border border-white/60 shadow-sm">
                     <p className="text-xs font-semibold text-slate-600">Dificultad:</p>
                     <MatchDifficulty diff={enhancedData.nextMatch.difficulty} />
                  </div>
                </div>
                
                <div className="flex justify-between items-center relative z-10 px-2">
                   <div className="flex flex-col items-center gap-2 w-1/3">
                     <Avatar className="h-14 w-14 border-2 border-white shadow-md bg-white">
                       <AvatarImage src={`https://img.biwenger.com/teams/${enhancedData.teamID}.png`} />
                     </Avatar>
                     <span className="font-bold text-slate-800 text-sm text-center">{teams?.[enhancedData.teamID]?.name}</span>
                   </div>
                   
                   <div className="flex flex-col items-center justify-center w-1/3 gap-1">
                     <div className="text-xs font-black text-slate-400 bg-white shadow-sm px-3 py-1 rounded-full border">VS</div>
                     <p className="text-[10px] text-slate-500 font-semibold">{enhancedData.nextMatch.date ? format(new Date(enhancedData.nextMatch.date * 1000), "d MMM, HH:mm", {locale: es}) : ''}</p>
                   </div>
                   
                   <div className="flex flex-col items-center gap-2 w-1/3">
                     <Avatar className="h-14 w-14 border-2 border-white shadow-md bg-white">
                       <AvatarImage src={`https://img.biwenger.com/teams/${enhancedData.nextMatch.opponentID}.png`} />
                     </Avatar>
                     <span className="font-bold text-slate-800 text-sm text-center">{teams?.[enhancedData.nextMatch.opponentID]?.name}</span>
                   </div>
                </div>
                
                <div className="mt-2 pt-3 border-t border-indigo-100/50 flex justify-between gap-4 relative z-10 text-xs">
                  <div className="flex-1 bg-white/50 rounded-lg p-2 border border-white">
                     <p className="text-slate-500 mb-1 leading-tight">Tendencia de PTS en {enhancedData.nextMatch.isHome ? 'Casa' : 'Fuera'}</p>
                     <p className="font-bold text-indigo-700">{enhancedData.nextMatch.isHome ? enhancedData.pointsHome : enhancedData.pointsAway} pts en {enhancedData.nextMatch.isHome ? enhancedData.playedHome : enhancedData.playedAway} partidos</p>
                  </div>
                  <div className="flex-1 bg-white/50 rounded-lg p-2 border border-white">
                     <p className="text-slate-500 mb-1 leading-tight">Impacto de la Dificultad</p>
                     <p className="font-bold text-indigo-700">
                        {enhancedData.nextMatch.difficulty >= 4 ? 'Rival Difícil (Posible penalización)' : enhancedData.nextMatch.difficulty <= 2 ? 'Rival Asequible (Posible bono)' : 'Dificultad Estándar'}
                     </p>
                  </div>
                </div>

              </div>
            )}

            {enhancedData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                 <div className="p-3 bg-white shadow-sm rounded-lg border flex flex-col justify-between">
                   <div className="flex gap-2 items-center mb-1">
                     <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                     <p className="text-xs font-bold text-slate-500 uppercase">Rendimiento</p>
                   </div>
                   <div className="flex items-end justify-between">
                     <p className="font-black text-2xl text-slate-800">{enhancedData.performanceScore}</p>
                     <p className="text-[10px] text-slate-400 text-right w-[60%] leading-tight">Basado en puntos, racha y frecuencia.</p>
                   </div>
                 </div>
                 <div className="p-3 bg-white shadow-sm rounded-lg border flex flex-col justify-between">
                   <div className="flex gap-2 items-center mb-1">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <p className="text-xs font-bold text-slate-500 uppercase">Mercado</p>
                   </div>
                   <div className="flex items-end justify-between">
                     <p className="font-black text-2xl text-slate-800">{enhancedData.marketScore}</p>
                     <p className="text-[10px] text-slate-400 text-right w-[60%] leading-tight">Basado en precio, valor esperado y tendencia.</p>
                   </div>
                 </div>
                 <div className="p-3 bg-white shadow-sm rounded-lg border flex flex-col justify-between">
                   <div className="flex gap-2 items-center mb-1">
                     <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                     <p className="text-xs font-bold text-slate-500 uppercase">Prox. Partido</p>
                   </div>
                   <div className="flex items-end justify-between">
                     <p className="font-black text-2xl text-slate-800">{enhancedData.nextMatchScore}</p>
                     <p className="text-[10px] text-slate-400 text-right w-[60%] leading-tight">Impacto de localía y dificultad rival.</p>
                   </div>
                 </div>
              </div>
            )}

            {enhancedData && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                 <div className="p-3 bg-slate-50 rounded border">
                   <p className="text-xs text-slate-500">Puntos Totales</p>
                   <p className="font-bold text-lg">{enhancedData.points}</p>
                 </div>
                 <div className="p-3 bg-slate-50 rounded border">
                   <p className="text-xs text-slate-500">Valor Esperado</p>
                   <p className="font-bold text-blue-600">{new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(enhancedData.expectedPrice)} €</p>
                 </div>
                 <div className="p-3 bg-slate-50 rounded border">
                   <p className="text-xs text-slate-500">Racha (Últ. 5)</p>
                   <p className="font-bold">{enhancedData.form}</p>
                 </div>
                 <div className="p-3 bg-slate-50 rounded border">
                   <p className="text-xs text-slate-500">ROI %</p>
                   <p className={`font-bold ${enhancedData.roi > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                     {enhancedData.roi > 0 ? '+' : ''}{enhancedData.roi}%
                   </p>
                 </div>
                 <div className="p-3 bg-slate-50 rounded border">
                   <p className="text-xs text-slate-500">Dist. Regresión</p>
                   <p className={`font-bold ${enhancedData.marketDistance < 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                     {enhancedData.marketDistance > 0 ? '+' : ''}{new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(enhancedData.marketDistance)} €
                   </p>
                 </div>
                 <div className="p-3 bg-slate-50 rounded border">
                   <p className="text-xs text-slate-500">Puntos/Millón</p>
                   <p className="font-bold text-blue-600">{enhancedData.ppm}</p>
                 </div>
                 <div className="p-3 bg-slate-50 rounded border">
                   <p className="text-xs text-slate-500">Fiabilidad %</p>
                   <p className="font-bold text-slate-700">{enhancedData.reliability}%</p>
                 </div>
              </div>
            )}

            {enhancedData && (
              <div>
                <h4 className="font-semibold mb-3 text-slate-700">Rangos de Mercado</h4>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm p-2 rounded bg-emerald-50 text-emerald-800">
                    <span>Ganga (Comprar sin duda)</span>
                    <span className="font-bold">&lt; {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(enhancedData.purchaseRange.desired)} €</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-2 rounded bg-blue-50 text-blue-800">
                    <span>Precio Justo</span>
                    <span className="font-bold">~ {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(enhancedData.purchaseRange.considerable)} €</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-2 rounded bg-orange-50 text-orange-800">
                    <span>Cuidado (Riesgo alto)</span>
                    <span className="font-bold">&gt; {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(enhancedData.purchaseRange.risky)} €</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-2 rounded bg-red-50 text-red-800">
                    <span>Sobrevalorado (Evitar o Vender)</span>
                    <span className="font-bold">&gt; {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(enhancedData.purchaseRange.overpriced)} €</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-4 text-slate-700">Evolución de Precio</h4>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.prices?.map((p: any) => {
                    const str = p[0].toString();
                    const dateObj = new Date(parseInt('20' + str.substring(0,2)), parseInt(str.substring(2,4))-1, parseInt(str.substring(4,6)));
                    return {
                      date: dateObj,
                      value: p[1]
                    };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(date, "d MMM", { locale: es })}
                      tick={{ fontSize: 12 }} 
                    />
                    <YAxis 
                      tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} 
                      tick={{ fontSize: 12 }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      labelFormatter={(label) => format(label, "d 'de' MMMM", { locale: es })}
                      formatter={(val: number) => [`${new Intl.NumberFormat('es-ES').format(val)} €`, "Precio"]}
                    />
                    <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-slate-700">Puntos por Jornada</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.reports?.map((report: any, idx: number) => {
                  const match = report.match;
                  const pts = report.points ? report.points["5"] : "-";
                  const events = report.events || [];
                  
                  let scoreColorClass = "border-slate-200 bg-slate-50 text-slate-400";
                  if (pts !== "-") {
                    if (pts >= 10) scoreColorClass = "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
                    else if (pts >= 6) scoreColorClass = "border-blue-500 bg-blue-50 text-blue-700";
                    else if (pts >= 2) scoreColorClass = "border-orange-400 bg-orange-50 text-orange-700";
                    else scoreColorClass = "border-red-500 bg-red-50 text-red-700";
                  }

                  return (
                    <div key={idx} className="flex gap-4 items-center p-3 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                       <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full border-2 ${scoreColorClass} font-black text-lg`}>
                         {pts}
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center mb-1">
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{match?.round?.name || `Jornada ${idx+1}`}</p>
                         </div>
                         <div className="flex items-center gap-2 text-sm font-medium text-slate-700 truncate">
                            {match?.home?.id === data.teamID ? <span className="font-bold">{match?.home?.name}</span> : <span>{match?.home?.name}</span>}
                            <span>{match?.home?.score ?? '-'} - {match?.away?.score ?? '-'}</span>
                            {match?.away?.id === data.teamID ? <span className="font-bold">{match?.away?.name}</span> : <span>{match?.away?.name}</span>}
                         </div>
                         {events.length > 0 && (
                           <div className="mt-2 flex flex-wrap gap-1.5">
                             {events.map((ev: any, eidx: number) => {
                               let icon = "🎯";
                               if (ev.type === 1) icon = "⚽";
                               if (ev.type === 2) icon = "👟";
                               if (ev.type === 3) icon = "🟨";
                               if (ev.type === 4) icon = "🟥";
                               return (
                                 <div key={eidx} className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-600 border">
                                   <span>{icon}</span>
                                   <span>{ev.type === 1 ? "Gol" : ev.type === 2 ? "Asist" : ev.type === 3 ? "Ama" : ev.type === 4 ? "Roja" : "Ev"}</span>
                                 </div>
                               )
                             })}
                           </div>
                         )}
                       </div>
                    </div>
                  );
                }).reverse()}
                {!data.reports?.length && <p className="text-sm text-slate-500">No hay historial de puntos.</p>}
              </div>
            </div>

          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

const MatchDifficulty = ({ diff }: { diff: number }) => {
  const colors = [
    "bg-slate-200", // 0
    "bg-emerald-500", // 1 (Easy)
    "bg-lime-500",    // 2
    "bg-yellow-400",  // 3
    "bg-orange-500",  // 4
    "bg-red-500",     // 5 (Hard)
  ];
  const color = colors[diff] || "bg-slate-200";
  
  return (
    <div className="flex gap-0.5 mt-1" title={`Dificultad: ${diff}/5 (${diff >= 4 ? 'Difícil' : diff <= 2 ? 'Fácil' : 'Media'})`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={`h-1.5 w-1.5 rounded-full ${i <= diff ? color : 'bg-slate-100'}`} />
      ))}
    </div>
  );
};

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accountData, setAccountData] = useState<any>(null);
  const [catalog, setCatalog] = useState<any>(null);
  const [teams, setTeams] = useState<any>(null);
  const [clubElo, setClubElo] = useState<Record<string, number>>({});
  const [userPlayers, setUserPlayers] = useState<any[]>([]);
  const [marketData, setMarketData] = useState<any>(null);
  const [leagueData, setLeagueData] = useState<any>(null);
  const [finances, setFinances] = useState<any>(null);
  const [fixtures, setFixtures] = useState<any>(null);
  const [captainLimit, setCaptainLimit] = useState(3000000);
  const [strikerLimit, setStrikerLimit] = useState(3000000);
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState(2);
  const [selectedFormation, setSelectedFormation] = useState<string>("4-3-3");
  const [playerSearchTerm, setPlayerSearchTerm] = useState("");
  const [selectedPlayerSlug, setSelectedPlayerSlug] = useState<string | null>(null);

  const [chartFilterPosition, setChartFilterPosition] = useState<string>("all");
  const [chartFilterMaxPrice, setChartFilterMaxPrice] = useState<number>(100000000);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500 text-white";
    if (score >= 60) return "bg-lime-500 text-white";
    if (score >= 40) return "bg-yellow-400 text-yellow-900";
    if (score >= 20) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

  const nextRound = useMemo(() => {
    if (!fixtures) return null;
    return fixtures.find((f: any) => f.status === 'active' || f.status === 'scheduled') || fixtures[0];
  }, [fixtures]);

  const teamNextMatch = useMemo(() => {
    if (!nextRound || !nextRound.matches || !teams) return {};
    const mapping: Record<number, any> = {};

    const getElo = (teamId: number) => {
      const name = teams[teamId]?.name;
      if (!name) return 1500;
      let norm = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (norm.includes("atletico")) return clubElo["atletico"] || 1500;
      if (norm.includes("athletic")) return clubElo["athletic"] || 1500;
      if (norm.includes("real madrid")) return clubElo["realmadrid"] || 1500;
      if (norm.includes("barcelona")) return clubElo["barcelona"] || 1500;
      if (norm.includes("betis")) return clubElo["betis"] || 1500;
      if (norm.includes("sociedad")) return clubElo["sociedad"] || 1500;
      if (norm.includes("celta")) return clubElo["celta"] || 1500;
      if (norm.includes("espanyol")) return clubElo["espanyol"] || 1500;
      if (norm.includes("mallorca")) return clubElo["mallorca"] || 1500;
      if (norm.includes("osasuna")) return clubElo["osasuna"] || 1500;
      if (norm.includes("valencia")) return clubElo["valencia"] || 1500;
      if (norm.includes("villarreal")) return clubElo["villarreal"] || 1500;
      if (norm.includes("alaves")) return clubElo["alaves"] || 1500;
      if (norm.includes("rayo")) return clubElo["rayo"] || 1500;
      if (norm.includes("valladolid")) return clubElo["valladolid"] || 1500;
      if (norm.includes("las palmas")) return clubElo["laspalmas"] || 1500;
      if (norm.includes("leganes")) return clubElo["leganes"] || 1500;
      if (norm.includes("getafe")) return clubElo["getafe"] || 1500;
      if (norm.includes("sevilla")) return clubElo["sevilla"] || 1500;
      if (norm.includes("girona")) return clubElo["girona"] || 1500;
      
      const directMatch = clubElo[norm.replace(/\s+/g, '')];
      if (directMatch) return directMatch;
      
      // Fallback: search for partial match
      const key = Object.keys(clubElo).find(k => k.includes(norm.replace(/\s+/g, '')) || norm.replace(/\s+/g, '').includes(k));
      return key ? clubElo[key] : 1500;
    };

    nextRound.matches.forEach((m: any) => {
      const homeElo = getElo(m.homeID) + 100; // Home advantage (~100 ELO points)
      const awayElo = getElo(m.awayID);
      
      const diffHome = awayElo - homeElo;
      const diffAway = homeElo - awayElo;
      
      // Convert difference to a 1-5 difficulty.
      // -400 diff means super easy, +400 means super hard.
      const calcDiffScore = (diff: number) => {
         let d = Math.max(-400, Math.min(400, diff));
         let raw = 3 + (d / 200); 
         return Math.max(1, Math.min(5, Math.round(raw)));
      };

      mapping[m.homeID] = { opponentID: m.awayID, isHome: true, date: m.date, difficulty: calcDiffScore(diffHome) };
      mapping[m.awayID] = { opponentID: m.homeID, isHome: false, date: m.date, difficulty: calcDiffScore(diffAway) };
    });
    return mapping;
  }, [nextRound, teams, clubElo]);

  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc'|'desc' }>({ key: 'points', direction: 'desc' });
  const [metricsView, setMetricsView] = useState<'basic'|'advanced'|'scores'>('basic');

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const enhancedCatalog = useMemo(() => {
    if (!catalog) return [];
    
    const catVals = Object.values(catalog);
    let maxMatches = 0;
    let maxPoints = 0;
    let maxPointsHome = 0;
    let maxPointsAway = 0;
    let maxForm = 0;
    let maxAvg = 0;
    let maxIncrement = 0;
    
    // Pass 1: Find maximums for normalization
    catVals.forEach((p: any) => {
      const played = (p.playedHome || 0) + (p.playedAway || 0);
      if (played > maxMatches) maxMatches = played;
      if (p.points > maxPoints) maxPoints = p.points;
      if (p.pointsHome > maxPointsHome) maxPointsHome = p.pointsHome;
      if (p.pointsAway > maxPointsAway) maxPointsAway = p.pointsAway;
      
      const avg = played > 0 ? (p.points / played) : 0;
      if (avg > maxAvg) maxAvg = avg;

      if (p.priceIncrement > maxIncrement) maxIncrement = p.priceIncrement;
      
      const fitness = Array.isArray(p.fitness) ? p.fitness.filter((x: any) => typeof x === 'number') : [];
      if (fitness.length > 0) {
        const sum = fitness.reduce((a: number, b: number) => a + b, 0);
        const form = sum / fitness.length;
        if (form > maxForm) maxForm = form;
      }
    });

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let validCount = 0;

    // Pass 2: Calculate basic metrics and accumulators for Regression
    const preCalculated = catVals.map((p: any) => {
      const played = (p.playedHome || 0) + (p.playedAway || 0);
      const avg = played > 0 ? (p.points / played) : 0;
      const ppm = p.price > 0 ? (p.points / (p.price / 1000000)) : 0;
      
      const fitness = Array.isArray(p.fitness) ? p.fitness.filter((x: any) => typeof x === 'number') : [];
      let form = 0;
      if (fitness.length > 0) {
        const sum = fitness.reduce((a: number, b: number) => a + b, 0);
        form = sum / fitness.length;
      }
      
      const normPoints = maxPoints > 0 ? (p.points / maxPoints) : 0;
      const normForm = maxForm > 0 ? (form / maxForm) : 0;
      const normReliability = maxMatches > 0 ? (played / maxMatches) : 0;
      const normAvg = maxAvg > 0 ? (avg / maxAvg) : 0;
      
      // === PERFORMANCE SCORE ===
      // Measures how well they are playing, form, rotation risk (reliability)
      let performanceScoreRaw = (normPoints * 0.20) + (normForm * 0.40) + (normAvg * 0.20) + (normReliability * 0.20);
      let performanceScore = performanceScoreRaw * 100;

      if (p.status === 'injured' || p.status === 'suspended') performanceScore *= 0.2;
      else if (p.status === 'doubtful') performanceScore *= 0.6;
      
      performanceScore = Math.min(100, Math.max(0, performanceScore));

      // Calculate regression components from active/meaningful players
      if (p.points > 5 && p.price > 150000 && p.status === 'ok') {
        sumX += performanceScore; // Base expected price on performance
        sumY += p.price;
        sumXY += (performanceScore * p.price);
        sumX2 += (performanceScore * performanceScore);
        validCount++;
      }

      return { ...p, played, avg, form, ppm, performanceScore };
    });

    // Calculate Regression Model
    const slope = validCount > 0 ? ((validCount * sumXY) - (sumX * sumY)) / ((validCount * sumX2) - (sumX * sumX)) : 0;
    const intercept = validCount > 0 ? (sumY - (slope * sumX)) / validCount : 0;

    // Pass 3: Final mappings using Regression Base Expected Price & specific scores
    return preCalculated.map((p: any) => {
      // Linear expected price based on AI Score
      let expectedLinearPrice = (slope * p.performanceScore) + intercept;
      if (isNaN(expectedLinearPrice) || expectedLinearPrice < 150000) expectedLinearPrice = 150000;

      // Position multipliers adjustment
      const positionMultipliers: Record<number, number> = { 1: 0.85, 2: 1.0, 3: 1.15, 4: 1.4 };
      const posMultiplier = positionMultipliers[p.position] || 1;
      let expectedPrice = expectedLinearPrice * posMultiplier;

      // Ensure 0 score doesn't become huge
      if (p.performanceScore === 0) expectedPrice = p.price > 150000 ? p.price * 0.5 : 150000;
      
      // Status modifiers for Expected Price
      if (p.status === 'injured') expectedPrice *= 0.45;
      if (p.status === 'doubtful') expectedPrice *= 0.8;
      if (p.status === 'suspended') expectedPrice *= 0.6;

      const roi = p.price > 0 ? ((expectedPrice - p.price) / p.price) * 100 : 0;
      const marketDistance = p.price - expectedPrice; // Residual: positive means expensive, negative means bargain
      const marketDistancePercent = expectedPrice > 0 ? (marketDistance / expectedPrice) * 100 : 0;
      const reliability = maxMatches > 0 ? (p.played / maxMatches) * 100 : 0;
      const nextMatch = teamNextMatch[p.teamID] || null;

      // === MARKET SCORE ===
      // Evaluates how good of a signing it is (ROI, trend, value)
      let normalizedRoi = Math.max(0, Math.min(100, (roi + 50))); // Map ROI to a 0-100 scale roughly
      let normalizedTrend = maxIncrement > 0 ? (Math.max(0, p.priceIncrement) / maxIncrement) * 100 : 0;
      let normalizedPrice = 100 - (Math.min(p.price, 25000000) / 25000000 * 100); // Cheaper gives a slight boost
      
      let marketScore = (normalizedRoi * 0.6) + (normalizedTrend * 0.3) + (normalizedPrice * 0.1);
      if (p.status !== 'ok') marketScore *= 0.6;
      marketScore = Math.min(100, Math.max(0, marketScore));

      // === NEXT MATCH SCORE ===
      let nextMatchScore = 0;
      
      if (nextMatch) {
         let homeAwayFactor = 0.5;
         if (nextMatch.isHome) {
            homeAwayFactor = p.playedHome > 0 ? (p.pointsHome / p.playedHome) / (maxAvg || 1) : p.avg / (maxAvg || 1);
         } else {
            homeAwayFactor = p.playedAway > 0 ? (p.pointsAway / p.playedAway) / (maxAvg || 1) : p.avg / (maxAvg || 1);
         }
         homeAwayFactor = Math.min(1, Math.max(0, homeAwayFactor || 0));

         let diffFactor = 1.0;
         if (nextMatch.difficulty) {
           diffFactor = 1.2 - ((nextMatch.difficulty - 1) * 0.1); // 1->1.2, 5->0.8
         }
         
         // Forward against easy diff = bonus
         if (p.position === 4 && nextMatch.difficulty <= 2) diffFactor += 0.2;
         // Defender against hard diff = penalty
         if (p.position === 2 && nextMatch.difficulty >= 4) diffFactor -= 0.15;
         
         let nmRaw = (p.performanceScore * 0.5) + (homeAwayFactor * 100 * 0.5);
         nextMatchScore = nmRaw * diffFactor;
         
         if (p.status === 'injured' || p.status === 'suspended') nextMatchScore = 0;
         else if (p.status === 'doubtful') nextMatchScore *= 0.5;
         
         nextMatchScore = Math.min(100, Math.max(0, nextMatchScore));
      } else {
         nextMatchScore = p.performanceScore * 0.8;
      }

      // === GENERAL SCORE ===
      let playerScore = (p.performanceScore * 0.4) + (marketScore * 0.3) + (nextMatchScore * 0.3);
      playerScore = Math.min(100, Math.max(0, playerScore));

      // Improved Market Tags using the residuals
      let marketLabel = 'Precio Justo';
      if (marketDistancePercent > 35) marketLabel = 'Sobrevalorado++';
      else if (marketDistancePercent > 15) marketLabel = 'Sobrevalorado';
      else if (marketDistancePercent < -30) marketLabel = 'CHOLLO';
      else if (marketDistancePercent < -15) marketLabel = 'Ganga';
      else if (p.priceIncrement > 50000) marketLabel = 'En Alza';

      // Specific Game Options Logic (Captain/Striker under limit)
      if (p.price <= captainLimit && playerScore > 75 && p.status === 'ok') {
        marketLabel = `APTO CAPITÁN`;
      } else if (p.price <= strikerLimit && playerScore > 65 && p.status === 'ok') {
        marketLabel = `APTO ARIETE`;
      }

      // Recommendation logic
      let recommendation = 'Rotación';
      if (p.status !== 'ok' && roi < -10) recommendation = 'Vender YA';
      else if (p.status !== 'ok' && roi > 25) recommendation = 'Mantener Lesionado';
      else if (playerScore > 88 && p.form > 8) recommendation = 'ESTRELLA';
      else if (playerScore > 70 || p.form > 6) recommendation = 'TITULAR';
      else if (playerScore < 25) recommendation = 'Descarte';
      else if (roi > 30 && reliability < 40) recommendation = 'Inversión';
      
      // Override recommendation if it's a specific budget gem
      if (marketLabel === 'APTO CAPITÁN') recommendation = 'CAPITÁN ECON.';
      if (marketLabel === 'APTO ARIETE') recommendation = 'ARIETE ECON.';

      return {
        ...p,
        costPerPoint: p.points > 0 ? (p.price / p.points) : 0,
        expectedPrice,
        roi: parseFloat(roi.toFixed(1)),
        reliability: parseFloat(reliability.toFixed(1)),
        playerScore: parseFloat(playerScore.toFixed(1)), // Overall score 
        performanceScore: parseFloat(p.performanceScore.toFixed(1)),
        marketScore: parseFloat(marketScore.toFixed(1)),
        nextMatchScore: parseFloat(nextMatchScore.toFixed(1)),
        recommendation,
        marketLabel,
        marketDistance,
        marketDistancePercent,
        nextMatch,
        purchaseRange: {
          desired: expectedPrice * 0.85,    // Ideal entry price (-15%)
          considerable: expectedPrice,      // Acceptable
          risky: expectedPrice * 1.15,      // Risky (+15%)
          overpriced: expectedPrice * 1.40  // Avoid (+40%)
        }
      };
    });
  }, [catalog, teamNextMatch, captainLimit, strikerLimit]);

  const myTeamData = useMemo(() => {
    return userPlayers
      .map(up => enhancedCatalog.find(p => p.id === up.id))
      .filter(Boolean)
      .sort((a: any, b: any) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        valA = valA || 0;
        valB = valB || 0;
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortConfig.direction === 'asc' ? (valA > valB ? 1 : -1) : (valB > valA ? 1 : -1);
      });
  }, [userPlayers, enhancedCatalog, sortConfig]);

  const suggestOptimalFormation = () => {
    const formations = ['4-3-3', '4-4-2', '3-4-3', '3-5-2', '3-3-4', '5-3-2', '5-4-1', '4-5-1'];
    let bestF = selectedFormation;
    let maxScore = -1;

    const myPlayers = userPlayers.map(up => enhancedCatalog.find(p => p.id === up.id)).filter(Boolean);
    const playersByPos = {
      1: myPlayers.filter(p => p.position === 1).sort((a: any, b: any) => b.playerScore - a.playerScore),
      2: myPlayers.filter(p => p.position === 2).sort((a: any, b: any) => b.playerScore - a.playerScore),
      3: myPlayers.filter(p => p.position === 3).sort((a: any, b: any) => b.playerScore - a.playerScore),
      4: myPlayers.filter(p => p.position === 4).sort((a: any, b: any) => b.playerScore - a.playerScore),
    };

    for (const f of formations) {
      const parts = f.split('-');
      const counts = {
        1: 1, 
        2: parseInt(parts[0]), 
        3: parseInt(parts[1]), 
        4: parseInt(parts[2])  
      };

      let currentScore = 0;
      let valid = true;
      const teamCounts: Record<string, number> = {};

      for (let pos = 1; pos <= 4; pos++) {
        const required = counts[pos as keyof typeof counts];
        const allAvailable = playersByPos[pos as keyof typeof playersByPos];
        let filled = 0;

        for (const p of allAvailable) {
          if (filled >= required) break;
          const teamID = p.teamID;
          const currentTeamCount = teamCounts[teamID] || 0;

          if (currentTeamCount < maxPlayersPerTeam) {
            currentScore += p.playerScore;
            teamCounts[teamID] = currentTeamCount + 1;
            filled++;
          }
        }
        if (filled < required) {
           valid = false;
        }
      }

      if (valid && currentScore > maxScore) {
        maxScore = currentScore;
        bestF = f;
      }
    }
    
    setSelectedFormation(bestF);
  };

  const bestLineup = useMemo(() => {
    const parts = selectedFormation.split('-');
    const counts = {
      1: 1, // POR
      2: parseInt(parts[0]), // DEF
      3: parseInt(parts[1]), // CEN
      4: parseInt(parts[2])  // DEL
    };

    const myPlayers = userPlayers.map(up => enhancedCatalog.find(p => p.id === up.id)).filter(Boolean);

    const playersByPos = {
      1: myPlayers.filter(p => p.position === 1).sort((a: any, b: any) => b.playerScore - a.playerScore),
      2: myPlayers.filter(p => p.position === 2).sort((a: any, b: any) => b.playerScore - a.playerScore),
      3: myPlayers.filter(p => p.position === 3).sort((a: any, b: any) => b.playerScore - a.playerScore),
      4: myPlayers.filter(p => p.position === 4).sort((a: any, b: any) => b.playerScore - a.playerScore),
    };

    const lineup: any[] = [];
    const subs: Record<number, any> = {}; 
    const reserves: any[] = [];
    
    let captain = null;
    let ariete = null;

    const teamCounts: Record<string, number> = {};

    for (let pos = 1; pos <= 4; pos++) {
      const required = counts[pos as keyof typeof counts];
      const allAvailable = playersByPos[pos as keyof typeof playersByPos];
      let filled = 0;

      for (const p of allAvailable) {
        const teamID = p.teamID;
        const currentTeamCount = teamCounts[teamID] || 0;

        if (filled < required && currentTeamCount < maxPlayersPerTeam) {
          lineup.push(p);
          teamCounts[teamID] = currentTeamCount + 1;
          filled++;
        } else if (!subs[pos]) {
          subs[pos] = p; // First available non-starter is the sub
        } else {
          reserves.push(p);
        }
      }
    }

    // Select Captain from lineup (highest score under captainLimit)
    const eligibleCaptains = lineup.filter(p => p.price <= captainLimit && p.status === 'ok').sort((a,b) => b.playerScore - a.playerScore);
    if (eligibleCaptains.length > 0) captain = eligibleCaptains[0];

    // Select Ariete from lineup (under strikerLimit)
    const eligibleArietes = lineup.filter(p => p.price <= strikerLimit && p.status === 'ok' && p.id !== captain?.id).sort((a,b) => b.playerScore - a.playerScore);
    if (eligibleArietes.length > 0) ariete = eligibleArietes[0];

    return { lineup, subs, reserves, captain, ariete, counts };
  }, [userPlayers, enhancedCatalog, selectedFormation, maxPlayersPerTeam, captainLimit, strikerLimit]);

  useEffect(() => {
    // Check if we have token saved
    const savedToken = localStorage.getItem("biwenger_token");
    if (savedToken) {
      setToken(savedToken);
      fetchAccountData(savedToken);
    }
    fetchCatalog();
    fetchClubElo();
  }, []);

  const [clubEloRaw, setClubEloRaw] = useState<any[]>([]);

  const fetchClubElo = async () => {
    try {
      const res = await fetch("/api/clubelo");
      const csv = await res.text();
      
      const lines = csv.split('\n');
      const eloMap: Record<string, number> = {};
      const eloData = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [rank, club, country, level, eloStr] = line.split(',');
        const elo = parseFloat(eloStr);
        if (!isNaN(elo)) {
           eloData.push({ rank: parseInt(rank), club, country, level, elo });
           if (country === 'ESP') {
             let normalizedClub = club.toLowerCase();
             normalizedClub = normalizedClub.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
             eloMap[normalizedClub] = elo;
           }
        }
      }
      setClubElo(eloMap);
      setClubEloRaw(eloData);
    } catch(e) {
      console.error(e);
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await fetch("/api/biwenger/catalog");
      const data = await res.json();
      setCatalog(data.data?.players || {});
      setTeams(data.data?.teams || {});
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/biwenger/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      
      if (data.token) {
        setToken(data.token);
        localStorage.setItem("biwenger_token", data.token);
        fetchAccountData(data.token);
      } else {
        setError(data.message || "Fallo en el inicio de sesión");
      }
    } catch (e) {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setAccountData(null);
    localStorage.removeItem("biwenger_token");
  };

  const fetchAccountData = async (authToken: string) => {
    try {
      const res = await fetch("/api/biwenger/account", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.status === 200 && data.data) {
        setAccountData(data.data);
        // Default to first league
        if (data.data.leagues && data.data.leagues.length > 0) {
          const league = data.data.leagues[0];
          fetchLeagueDetails(authToken, league.id, league.user.id);
          fetchUserTeam(authToken, league.id, league.user.id);
          fetchMarket(authToken, league.id, league.user.id);
          fetchFinances(authToken, league.id, league.user.id);
          fetchFixtures(authToken, league.id);
        }
      } else {
        logout();
      }
    } catch (e) {
      logout();
    }
  };

  const fetchFinances = async (authToken: string, leagueId: string, userId: string) => {
    try {
      let offset = 0;
      const allEvents: any[] = [];
      // Fetch up to 1500 board events to calculate history
      for (let i = 0; i < 15; i++) {
        const res = await fetch(`/api/biwenger/board?offset=${offset}&limit=100`, {
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "X-League": leagueId,
            "X-User": userId,
          }
        });
        const data = await res.json();
        const events = data.data || [];
        if (events.length === 0) break;
        allEvents.push(...events);
        offset += 100;
        if (events.length < 100) break;
      }
      
      const balances: Record<string, { spent: number, earned: number }> = {};
      
      // Process events
      allEvents.forEach((ev: any) => {
        if (ev.type === 'transfer') {
          const amount = ev.amount || 0;
          
          let sellerId = ev.from?.id ?? ev.from;
          let buyerId = ev.to?.id ?? ev.to;
          
          if (sellerId) {
            sellerId = String(sellerId);
            if (!balances[sellerId]) balances[sellerId] = { spent: 0, earned: 0 };
            balances[sellerId].earned += amount;
          }
          
          if (buyerId) {
            buyerId = String(buyerId);
            if (!balances[buyerId]) balances[buyerId] = { spent: 0, earned: 0 };
            balances[buyerId].spent += amount;
          }
        }
      });
      
      setFinances(balances);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFixtures = async (authToken: string, leagueId: string) => {
    try {
      const res = await fetch("/api/biwenger/fixtures", {
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "X-League": leagueId,
        }
      });
      const data = await res.json();
      setFixtures(data.data || null);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLeagueDetails = async (authToken: string, leagueId: string, userId: string) => {
    try {
      const res = await fetch("/api/biwenger/league", {
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "X-League": leagueId,
          "X-User": userId,
        }
      });
      const data = await res.json();
      if (data.status === 200) {
        setLeagueData(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUserTeam = async (authToken: string, leagueId: string, userId: string) => {
    try {
      // The python module fetches user?fields=players(id,owner)
      const res = await fetch("/api/biwenger/user", {
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "X-League": leagueId,
          "X-User": userId,
        }
      });
      const data = await res.json();
      if (data.status === 200) {
        setUserPlayers(data.data?.players || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMarket = async (authToken: string, leagueId: string, userId: string) => {
    try {
      const res = await fetch("/api/biwenger/market", {
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "X-League": leagueId,
          "X-User": userId,
        }
      });
      const data = await res.json();
      if (data.status === 200) {
        setMarketData(data.data?.sales || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const chartData = useMemo(() => {
    return enhancedCatalog
      .filter((p) => p.price > 150000 && p.points > 10)
      .filter((p) => chartFilterPosition === "all" || p.position.toString() === chartFilterPosition)
      .filter((p) => p.price <= chartFilterMaxPrice)
      .map((p) => ({
        name: p.name,
        score: p.playerScore,
        price: p.price,
        expected: p.expectedPrice,
        status: p.status,
        label: p.marketLabel,
      }))
      .sort((a, b) => a.score - b.score);
  }, [enhancedCatalog, chartFilterPosition, chartFilterMaxPrice]);

  if (!token || !accountData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Biwenger Manager</CardTitle>
            <CardDescription>
              Inicia sesión con tu cuenta de Biwenger (las credenciales viajan directas a la API oficial)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Entrar a mi Equipo"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const league = accountData.leagues && accountData.leagues[0];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              B
            </div>
            <h1 className="font-semibold text-lg">Biwenger Stats</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 hidden sm:block">
              {league?.name}
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-slate-500">
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {!leagueData ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-[400px] w-full mt-4" />
          </div>
        ) : (
          <Tabs defaultValue="team" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="team"><User className="w-4 h-4 mr-2" /> Mi Equipo</TabsTrigger>
              <TabsTrigger value="lineup"><LayoutTemplate className="w-4 h-4 mr-2" /> Alineación</TabsTrigger>
              <TabsTrigger value="market"><Store className="w-4 h-4 mr-2" /> Mercado</TabsTrigger>
              <TabsTrigger value="all-players"><Users className="w-4 h-4 mr-2" /> Jugadores</TabsTrigger>
              <TabsTrigger value="charts"><BarChart className="w-4 h-4 mr-2" /> Gráficas</TabsTrigger>
              <TabsTrigger value="elo"><Trophy className="w-4 h-4 mr-2" /> Rankings ELO</TabsTrigger>
              <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" /></TabsTrigger>
            </TabsList>

            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle>Plantilla de {league?.user?.name}</CardTitle>
                  <CardDescription>
                    {userPlayers.length} Jugadores en tu alineación actual.
                  </CardDescription>
                  <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <Input 
                      placeholder="Buscar jugador en tu equipo..." 
                      value={playerSearchTerm}
                      onChange={(e) => setPlayerSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                    <Tabs value={metricsView} onValueChange={(val) => setMetricsView(val as any)} className="w-[500px]">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Básicas</TabsTrigger>
                        <TabsTrigger value="advanced">Avanzadas</TabsTrigger>
                        <TabsTrigger value="scores">IA Scores</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] border rounded-md">
                    <Table>
                      <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm border-b">
                        <TableRow>
                          <TableHead className="cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('name')}>
                            Jugador {sortConfig.key === 'name' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                          </TableHead>
                          <TableHead className="cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('position')}>
                            Pos {sortConfig.key === 'position' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                          </TableHead>
                          <TableHead className="cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('teamID')}>
                            Equipo {sortConfig.key === 'teamID' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">Prox. Rival</TableHead>
                          <TableHead className="text-center whitespace-nowrap">Rec.</TableHead>
                          
                          {metricsView === 'basic' ? (
                            <>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('played')}>
                                Partidos {sortConfig.key === 'played' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('pointsHome')}>
                                Pts Casa {sortConfig.key === 'pointsHome' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('pointsAway')}>
                                Pts Fuera {sortConfig.key === 'pointsAway' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('points')}>
                                Total Pts {sortConfig.key === 'points' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('avg')}>
                                Media {sortConfig.key === 'avg' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('price')}>
                                Valor {sortConfig.key === 'price' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                            </>
                          ) : metricsView === 'advanced' ? (
                            <>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('form')}>
                                Racha (últ. 5) {sortConfig.key === 'form' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('ppm')}>
                                Pts / M€ {sortConfig.key === 'ppm' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('costPerPoint')}>
                                Coste / Pto {sortConfig.key === 'costPerPoint' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('priceIncrement')}>
                                Tendencia {sortConfig.key === 'priceIncrement' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('reliability')}>
                                Fiabilidad % {sortConfig.key === 'reliability' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('expectedPrice')}>
                                Precio Esperado {sortConfig.key === 'expectedPrice' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('roi')}>
                                ROI % {sortConfig.key === 'roi' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                            </>
                          ) : (
                            <>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('performanceScore')}>
                                Rendimiento {sortConfig.key === 'performanceScore' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('marketScore')}>
                                Mercado {sortConfig.key === 'marketScore' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('nextMatchScore')}>
                                Prox. Rival {sortConfig.key === 'nextMatchScore' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap bg-indigo-50 border-l" onClick={() => handleSort('playerScore')}>
                                General {sortConfig.key === 'playerScore' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                            </>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myTeamData
                          .filter((p: any) => {
                             const teamName = teams && teams[p.teamID] ? teams[p.teamID].name : "";
                             return p.name.toLowerCase().includes(playerSearchTerm.toLowerCase()) || teamName.toLowerCase().includes(playerSearchTerm.toLowerCase());
                          })
                          .map((p: any) => {
                            return (
                              <TableRow key={p.id} className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setSelectedPlayerSlug(p.slug)}>
                                <TableCell className="font-medium flex items-center gap-3 whitespace-nowrap">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://img.biwenger.com/players/${p.slug}.png`} />
                                    <AvatarFallback>{p.name.substring(0,2)}</AvatarFallback>
                                  </Avatar>
                                  {p.name}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="font-mono bg-slate-100">
                                    {{1:"POR", 2:"DEF", 3:"CEN", 4:"DEL"}[p.position as number] || p.position}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap">
                                  {teams && teams[p.teamID] ? teams[p.teamID].name : p.teamID}
                                </TableCell>
                                <TableCell className="text-center">
                                  {p.nextMatch && (
                                    <div className="flex flex-col items-center justify-center">
                                      <Avatar className="h-6 w-6 border shadow-sm">
                                        <AvatarImage src={`https://img.biwenger.com/teams/${p.nextMatch.opponentID}.png`} title={`${p.nextMatch.isHome ? 'En casa' : 'Fuera'} vs ${teams?.[p.nextMatch.opponentID]?.name}`} />
                                      </Avatar>
                                      <MatchDifficulty diff={p.nextMatch.difficulty} />
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant={['TITULAR', 'ESTRELLA', 'CAPITÁN ECON.', 'ARIETE ECON.', 'Inversión'].includes(p.recommendation) ? 'default' : p.recommendation.includes('Vender') ? 'destructive' : 'secondary'} className={p.recommendation === 'ESTRELLA' ? 'bg-yellow-500 hover:bg-yellow-600' : p.recommendation === 'TITULAR' ? 'bg-blue-600' : p.recommendation.includes('ECON.') ? 'bg-emerald-600' : p.recommendation === 'Inversión' ? 'bg-purple-600' : ''}>
                                    {p.recommendation}
                                  </Badge>
                                </TableCell>
                                
                                {metricsView === 'basic' ? (
                                  <>
                                    <TableCell className="text-right text-slate-500 tabular-nums">{p.played}</TableCell>
                                    <TableCell className="text-right text-slate-500 tabular-nums">{p.pointsHome || 0}</TableCell>
                                    <TableCell className="text-right text-slate-500 tabular-nums">{p.pointsAway || 0}</TableCell>
                                    <TableCell className="text-right font-bold text-slate-700 tabular-nums">{p.points || 0}</TableCell>
                                    <TableCell className="text-right font-medium text-slate-600 tabular-nums">{p.avg}</TableCell>
                                    <TableCell className="text-right font-semibold text-emerald-600 tabular-nums whitespace-nowrap">
                                      {new Intl.NumberFormat('es-ES').format(p.price)} €
                                    </TableCell>
                                  </>
                                ) : metricsView === 'advanced' ? (
                                  <>
                                    <TableCell className="text-right font-medium tabular-nums">{p.form}</TableCell>
                                    <TableCell className="text-right font-medium tabular-nums">{p.ppm}</TableCell>
                                    <TableCell className="text-right text-slate-500 tabular-nums">
                                      {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(p.costPerPoint)} €
                                    </TableCell>
                                    <TableCell className={`text-right font-medium tabular-nums ${p.priceIncrement > 0 ? "text-emerald-600" : p.priceIncrement < 0 ? "text-red-500" : "text-slate-500"}`}>
                                      {p.priceIncrement > 0 ? "+" : ""}{new Intl.NumberFormat('es-ES').format(p.priceIncrement)}
                                    </TableCell>
                                    <TableCell className="text-right text-slate-500 tabular-nums">{p.reliability}%</TableCell>
                                    <TableCell className="text-right font-medium text-blue-600 tabular-nums whitespace-nowrap">
                                      {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(p.expectedPrice)} €
                                    </TableCell>
                                    <TableCell className={`text-right font-bold tabular-nums ${p.roi > 0 ? "text-emerald-600" : "text-red-500"}`}>
                                      {p.roi > 0 ? "+" : ""}{p.roi}%
                                    </TableCell>
                                  </>
                                ) : (
                                  <>
                                    <TableCell className="text-right font-medium text-slate-600 tabular-nums">{p.performanceScore}</TableCell>
                                    <TableCell className="text-right font-medium text-slate-600 tabular-nums">{p.marketScore}</TableCell>
                                    <TableCell className="text-right font-medium text-slate-600 tabular-nums">{p.nextMatchScore}</TableCell>
                                    <TableCell className="text-right font-bold tabular-nums border-l"><span className={`px-2 py-0.5 rounded text-xs ${getScoreColor(p.playerScore)}`}>{p.playerScore}</span></TableCell>
                                  </>
                                )}
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lineup">
              <Card>
                <CardHeader>
                  <CardTitle>Alineación Recomendada</CardTitle>
                  <CardDescription>
                    Selecciona tu formación y el sistema elegirá a los mejores jugadores según su AI Score.
                  </CardDescription>
                  <div className="pt-4 flex items-center gap-4">
                    <Label htmlFor="formation" className="font-semibold text-slate-700">Formación:</Label>
                    <select
                      id="formation"
                      className="flex h-10 w-40 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedFormation}
                      onChange={(e) => setSelectedFormation(e.target.value)}
                    >
                      <option value="4-3-3">4-3-3</option>
                      <option value="4-4-2">4-4-2</option>
                      <option value="3-4-3">3-4-3</option>
                      <option value="3-5-2">3-5-2</option>
                      <option value="3-3-4">3-3-4</option>
                      <option value="5-3-2">5-3-2</option>
                      <option value="5-4-1">5-4-1</option>
                      <option value="4-5-1">4-5-1</option>
                    </select>
                    <Button onClick={suggestOptimalFormation} variant="secondary" className="bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100">
                      Sugerir Mejor Alineación
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#4a8a3a] rounded-xl p-6 shadow-inner relative overflow-hidden border-4 border-[#3c722f] mt-4 min-h-[600px] flex flex-col justify-between">
                    {/* Pitch lines */}
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-white/30 -translate-y-1/2 border-[#3c722f] z-0"></div>
                    <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2 z-0"></div>
                    <div className="absolute top-0 left-1/2 w-48 h-24 border-b-2 border-x-2 border-white/30 -translate-x-1/2 rounded-b-sm z-0"></div>
                    <div className="absolute bottom-0 left-1/2 w-48 h-24 border-t-2 border-x-2 border-white/30 -translate-x-1/2 rounded-t-sm z-0"></div>
                    
                    {/* DEL */}
                    <div className="flex justify-evenly relative z-10 pt-4">
                       {bestLineup.lineup.filter(p => p.position === 4).map((p: any) => (
                         <div key={p.id} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform" onClick={() => setSelectedPlayerSlug(p.slug)}>
                           <div className="relative">
                             <Avatar className="h-14 w-14 border-2 border-white shadow-lg bg-orange-100">
                               <AvatarImage src={`https://img.biwenger.com/players/${p.slug}.png`} />
                               <AvatarFallback>{p.name.substring(0,2)}</AvatarFallback>
                             </Avatar>
                             <div className={`absolute -top-2 -right-2 ${getScoreColor(p.playerScore)} text-[10px] font-black rounded-full h-6 w-6 flex items-center justify-center shadow`}>
                               {Math.round(p.playerScore)}
                             </div>
                             {bestLineup.captain?.id === p.id && (
                               <div className="absolute -bottom-2 lg:-bottom-2 -left-2 bg-yellow-500 text-white text-[10px] font-black rounded h-5 p-1 flex items-center shadow-md border border-yellow-600 z-20" title="Capitán (x2 Puntos)">
                                 ©
                               </div>
                             )}
                             {bestLineup.ariete?.id === p.id && (
                               <div className="absolute -bottom-2 -right-2 bg-rose-600 text-white text-[10px] font-black rounded h-5 p-1 flex items-center shadow-md border border-rose-700 z-20" title="Ariete (+3 Puntos por Gol)">
                                 A
                               </div>
                             )}
                           </div>
                           <div className="mt-2 bg-slate-900/80 px-2 py-0.5 rounded text-white text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] shadow-sm">
                             {p.name.split(' ')[0]}
                           </div>
                         </div>
                       ))}
                    </div>

                    {/* CEN */}
                    <div className="flex justify-evenly relative z-10">
                       {bestLineup.lineup.filter(p => p.position === 3).map((p: any) => (
                         <div key={p.id} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform" onClick={() => setSelectedPlayerSlug(p.slug)}>
                           <div className="relative">
                             <Avatar className="h-14 w-14 border-2 border-white shadow-lg bg-green-100">
                               <AvatarImage src={`https://img.biwenger.com/players/${p.slug}.png`} />
                               <AvatarFallback>{p.name.substring(0,2)}</AvatarFallback>
                             </Avatar>
                             <div className={`absolute -top-2 -right-2 ${getScoreColor(p.playerScore)} text-[10px] font-black rounded-full h-6 w-6 flex items-center justify-center shadow`}>
                               {Math.round(p.playerScore)}
                             </div>
                             {bestLineup.captain?.id === p.id && (
                               <div className="absolute -bottom-2 -left-2 bg-yellow-500 text-white text-[10px] font-black rounded h-5 p-1 flex items-center shadow-md border border-yellow-600 z-20" title="Capitán (x2 Puntos)">
                                 ©
                               </div>
                             )}
                             {bestLineup.ariete?.id === p.id && (
                               <div className="absolute -bottom-2 -right-2 bg-rose-600 text-white text-[10px] font-black rounded h-5 p-1 flex items-center shadow-md border border-rose-700 z-20" title="Ariete (+3 Puntos por Gol)">
                                 A
                               </div>
                             )}
                           </div>
                           <div className="mt-2 bg-slate-900/80 px-2 py-0.5 rounded text-white text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] shadow-sm">
                             {p.name.split(' ')[0]}
                           </div>
                         </div>
                       ))}
                    </div>

                    {/* DEF */}
                    <div className="flex justify-evenly relative z-10">
                       {bestLineup.lineup.filter(p => p.position === 2).map((p: any) => (
                         <div key={p.id} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform" onClick={() => setSelectedPlayerSlug(p.slug)}>
                           <div className="relative">
                             <Avatar className="h-14 w-14 border-2 border-white shadow-lg bg-blue-100">
                               <AvatarImage src={`https://img.biwenger.com/players/${p.slug}.png`} />
                               <AvatarFallback>{p.name.substring(0,2)}</AvatarFallback>
                             </Avatar>
                             <div className={`absolute -top-2 -right-2 ${getScoreColor(p.playerScore)} text-[10px] font-black rounded-full h-6 w-6 flex items-center justify-center shadow`}>
                               {Math.round(p.playerScore)}
                             </div>
                             {bestLineup.captain?.id === p.id && (
                               <div className="absolute -bottom-2 -left-2 bg-yellow-500 text-white text-[10px] font-black rounded h-5 p-1 flex items-center shadow-md border border-yellow-600 z-20" title="Capitán (x2 Puntos)">
                                 ©
                               </div>
                             )}
                             {bestLineup.ariete?.id === p.id && (
                               <div className="absolute -bottom-2 -right-2 bg-rose-600 text-white text-[10px] font-black rounded h-5 p-1 flex items-center shadow-md border border-rose-700 z-20" title="Ariete (+3 Puntos por Gol)">
                                 A
                               </div>
                             )}
                           </div>
                           <div className="mt-2 bg-slate-900/80 px-2 py-0.5 rounded text-white text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] shadow-sm">
                             {p.name.split(' ')[0]}
                           </div>
                         </div>
                       ))}
                    </div>

                    {/* POR */}
                    <div className="flex justify-center relative z-10 pb-4">
                       {bestLineup.lineup.filter(p => p.position === 1).map((p: any) => (
                         <div key={p.id} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform" onClick={() => setSelectedPlayerSlug(p.slug)}>
                           <div className="relative">
                             <Avatar className="h-14 w-14 border-2 border-white shadow-lg bg-yellow-100">
                               <AvatarImage src={`https://img.biwenger.com/players/${p.slug}.png`} />
                               <AvatarFallback>{p.name.substring(0,2)}</AvatarFallback>
                             </Avatar>
                             <div className={`absolute -top-2 -right-2 ${getScoreColor(p.playerScore)} text-[10px] font-black rounded-full h-6 w-6 flex items-center justify-center shadow`}>
                               {Math.round(p.playerScore)}
                             </div>
                             {bestLineup.captain?.id === p.id && (
                               <div className="absolute -bottom-2 -left-2 bg-yellow-500 text-white text-[10px] font-black rounded h-5 p-1 flex items-center shadow-md border border-yellow-600 z-20" title="Capitán (x2 Puntos)">
                                 ©
                               </div>
                             )}
                             {bestLineup.ariete?.id === p.id && (
                               <div className="absolute -bottom-2 -right-2 bg-rose-600 text-white text-[10px] font-black rounded h-5 p-1 flex items-center shadow-md border border-rose-700 z-20" title="Ariete (+3 Puntos por Gol)">
                                 A
                               </div>
                             )}
                           </div>
                           <div className="mt-2 bg-slate-900/80 px-2 py-0.5 rounded text-white text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] shadow-sm">
                             {p.name.split(' ')[0]}
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="mt-8 space-y-6">
                    {(bestLineup.subs[1] || bestLineup.subs[2] || bestLineup.subs[3] || bestLineup.subs[4]) && (
                      <div>
                        <h3 className="text-lg font-bold mb-4 text-slate-800">Banquillo Titular (Por Posición)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          {[1, 2, 3, 4].map(pos => {
                            const p = bestLineup.subs[pos as keyof typeof bestLineup.subs];
                            const label = {1:"POR", 2:"DEF", 3:"CEN", 4:"DEL"}[pos] || pos;
                            return p ? (
                              <div key={p.id} className="flex flex-col items-center bg-slate-50 border p-3 rounded-lg cursor-pointer hover:border-slate-300" onClick={() => setSelectedPlayerSlug(p.slug)}>
                                <div className="text-xs font-bold text-slate-400 mb-2">{label} SUPLENTE</div>
                                <Avatar className="h-12 w-12 border shadow-sm mb-2">
                                  <AvatarImage src={`https://img.biwenger.com/players/${p.slug}.png`} />
                                  <AvatarFallback>{p.name.substring(0,2)}</AvatarFallback>
                                </Avatar>
                                <p className="font-semibold text-sm truncate w-full text-center">{p.name}</p>
                                <div className={`text-xs mt-1 px-2 py-0.5 rounded ${getScoreColor(p.playerScore)}`}>
                                  Score: {Math.round(p.playerScore)}
                                </div>
                              </div>
                            ) : (
                              <div key={`empty-${pos}`} className="flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-300 p-3 rounded-lg text-slate-400">
                                <div className="text-xs font-bold mb-2">{label} SUPLENTE</div>
                                <LayoutTemplate className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-sm">Sin jugador</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {bestLineup.reserves.length > 0 && (
                      <div>
                        <h3 className="text-md justify-between font-bold mb-3 text-slate-700 flex items-center">
                          Resto de Jugadores
                          <Badge variant="outline">{bestLineup.reserves.length}</Badge>
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {bestLineup.reserves.sort((a,b) => b.playerScore - a.playerScore).map((p: any) => (
                            <div key={p.id} className="flex items-center gap-3 bg-white border p-2 rounded-lg pr-4 cursor-pointer hover:border-slate-300 shadow-sm" onClick={() => setSelectedPlayerSlug(p.slug)}>
                              <Avatar className="h-10 w-10 border shadow-sm">
                                <AvatarImage src={`https://img.biwenger.com/players/${p.slug}.png`} />
                                <AvatarFallback>{p.name.substring(0,2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-sm max-w-[120px] truncate">{p.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-slate-100">
                                    {{1:"POR", 2:"DEF", 3:"CEN", 4:"DEL"}[p.position as number] || p.position}
                                  </Badge>
                                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${getScoreColor(p.playerScore)}`}>
                                    {Math.round(p.playerScore)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="market">
              <Card>
                <CardHeader>
                  <CardTitle>Mercado de Fichajes</CardTitle>
                  <CardDescription>Jugadores actualmente en venta</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketData?.map((item: any, idx: number) => {
                      const p = item.player;
                      const pInfo = enhancedCatalog.find(catP => catP.id === p.id);
                      return (
                        <div key={item.id || idx} className="flex items-center justify-between p-4 rounded-lg border bg-card flex-col sm:flex-row gap-4 hover:border-slate-300 transition-colors cursor-pointer" onClick={() => pInfo && setSelectedPlayerSlug(pInfo.slug)}>
                          <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="relative">
                              <Avatar className="h-16 w-16 border rounded-sm">
                                <AvatarImage src={`https://img.biwenger.com/players/${pInfo?.slug}.png`} />
                                <AvatarFallback>{pInfo?.name?.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div>
                              <p className="font-semibold truncate text-lg">{pInfo?.name || `Jugador ${p.id}`}</p>
                              <div className="flex gap-2 items-center text-xs text-slate-500 mt-1">
                                {item.user ? (
                                  <span className="flex items-center"><User className="w-3 h-3 mr-1" /> Vende {item.user}</span>
                                ) : (
                                  <span className="flex items-center text-blue-600"><Store className="w-3 h-3 mr-1" /> Vende Biwenger</span>
                                )}
                                {pInfo && (
                                  <Badge variant="outline" className={pInfo.marketLabel.includes('CHOLLO') || pInfo.marketLabel.includes('Ganga') || pInfo.marketLabel.includes('APTO') ? 'text-emerald-600 border-emerald-600' : pInfo.marketLabel === 'En Alza' || pInfo.marketLabel === 'Buen Momento' ? 'text-blue-600 border-blue-600' : pInfo.marketLabel.includes('Sobrevalorado') ? 'text-red-500 border-red-500' : pInfo.marketLabel === 'Cuidado' ? 'text-orange-500 border-orange-500' : ''}>
                                    {pInfo.marketLabel}
                                  </Badge>
                                )}
                                {pInfo?.nextMatch && (
                                  <div className="flex items-center gap-1 border rounded px-1.5 py-0.5 bg-slate-50">
                                    <Avatar className="h-4 w-4">
                                      <AvatarImage src={`https://img.biwenger.com/teams/${pInfo.nextMatch.opponentID}.png`} title={`${pInfo.nextMatch.isHome ? 'En casa' : 'Fuera'} vs ${teams?.[pInfo.nextMatch.opponentID]?.name}`} />
                                    </Avatar>
                                    <MatchDifficulty diff={pInfo.nextMatch.difficulty} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="hidden md:flex gap-6 items-center">
                            {pInfo && (
                              <div className="flex items-center gap-6">
                                <div className="flex gap-4">
                                  <div className="flex flex-col items-center">
                                    <span className="text-[10px] uppercase text-slate-500 font-bold">Rend</span>
                                    <span className="font-semibold text-sm text-slate-700">{pInfo.performanceScore}</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="text-[10px] uppercase text-slate-500 font-bold">Merc</span>
                                    <span className="font-semibold text-sm text-slate-700">{pInfo.marketScore}</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="text-[10px] uppercase text-slate-500 font-bold">Prox</span>
                                    <span className="font-semibold text-sm text-slate-700">{pInfo.nextMatchScore}</span>
                                  </div>
                                  <div className="flex flex-col items-center pl-4 border-l border-slate-200">
                                    <span className="text-[10px] uppercase text-indigo-500 font-bold">General</span>
                                    <span className={`font-black text-sm px-2 py-0.5 rounded ${getScoreColor(pInfo.playerScore)}`}>{pInfo.playerScore}</span>
                                  </div>
                                </div>
                                <div className="text-sm border-l pl-6 border-slate-200">
                                  <p className="text-slate-500 text-xs text-right">Rango Max. Recomendado</p>
                                  <p className="font-medium text-right text-slate-700">
                                    {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(pInfo.purchaseRange.desired)} € - {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(pInfo.purchaseRange.risky)} €
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 gap-4">
                             <div className="text-right">
                              <p className="text-xs text-slate-500">Piden</p>
                              <p className="font-semibold text-emerald-600 tabular-nums text-lg">
                                {new Intl.NumberFormat('es-ES').format(item.price)} €
                              </p>
                             </div>
                          </div>
                        </div>
                      );
                    })}
                    {!marketData?.length && (
                      <div className="text-center p-8 text-slate-500">
                        Cargando mercado...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="all-players">
              <Card>
                <CardHeader>
                  <CardTitle>Base de Datos de Jugadores</CardTitle>
                  <CardDescription>Todos los jugadores disponibles y sus estadísticas completas.</CardDescription>
                  <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <Input 
                      placeholder="Buscar jugador por nombre o equipo..." 
                      value={playerSearchTerm}
                      onChange={(e) => setPlayerSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                    <Tabs value={metricsView} onValueChange={(val) => setMetricsView(val as any)} className="w-[500px]">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Básicas</TabsTrigger>
                        <TabsTrigger value="advanced">Avanzadas</TabsTrigger>
                        <TabsTrigger value="scores">IA Scores</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] border rounded-md">
                    <Table>
                      <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm border-b">
                        <TableRow>
                          <TableHead className="cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('name')}>
                            Jugador {sortConfig.key === 'name' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                          </TableHead>
                          <TableHead className="cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('position')}>
                            Pos {sortConfig.key === 'position' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                          </TableHead>
                          <TableHead className="cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('teamID')}>
                            Equipo {sortConfig.key === 'teamID' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                          </TableHead>
                          <TableHead className="text-center whitespace-nowrap">Prox. Rival</TableHead>
                          
                          {metricsView === 'basic' ? (
                            <>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('played')}>
                                Partidos {sortConfig.key === 'played' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('pointsHome')}>
                                Pts Casa {sortConfig.key === 'pointsHome' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('pointsAway')}>
                                Pts Fuera {sortConfig.key === 'pointsAway' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('points')}>
                                Total Pts {sortConfig.key === 'points' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('avg')}>
                                Media {sortConfig.key === 'avg' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('price')}>
                                Valor {sortConfig.key === 'price' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                            </>
                          ) : metricsView === 'advanced' ? (
                            <>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('form')}>
                                Racha (últ. 5) {sortConfig.key === 'form' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('ppm')}>
                                Pts / M€ {sortConfig.key === 'ppm' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('costPerPoint')}>
                                Coste / Pto {sortConfig.key === 'costPerPoint' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('priceIncrement')}>
                                Tendencia {sortConfig.key === 'priceIncrement' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('reliability')}>
                                Fiabilidad % {sortConfig.key === 'reliability' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('expectedPrice')}>
                                Precio Esperado {sortConfig.key === 'expectedPrice' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('roi')}>
                                ROI % {sortConfig.key === 'roi' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                            </>
                          ) : (
                            <>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('performanceScore')}>
                                Rendimiento {sortConfig.key === 'performanceScore' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('marketScore')}>
                                Mercado {sortConfig.key === 'marketScore' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap" onClick={() => handleSort('nextMatchScore')}>
                                Prox. Rival {sortConfig.key === 'nextMatchScore' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                              <TableHead className="text-right cursor-pointer hover:bg-slate-100 whitespace-nowrap bg-indigo-50 border-l" onClick={() => handleSort('playerScore')}>
                                General {sortConfig.key === 'playerScore' && <ArrowUpDown className="inline w-3 h-3 ml-1"/>}
                              </TableHead>
                            </>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enhancedCatalog
                          .filter((p: any) => {
                             const teamName = teams && teams[p.teamID] ? teams[p.teamID].name : "";
                             return p.name.toLowerCase().includes(playerSearchTerm.toLowerCase()) || teamName.toLowerCase().includes(playerSearchTerm.toLowerCase());
                          })
                          .sort((a: any, b: any) => {
                            let valA = a[sortConfig.key];
                            let valB = b[sortConfig.key];
                            
                            valA = valA || 0;
                            valB = valB || 0;
                            if (typeof valA === 'string' && typeof valB === 'string') {
                              return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                            }
                            
                            return sortConfig.direction === 'asc' ? (valA > valB ? 1 : -1) : (valB > valA ? 1 : -1);
                          })
                          .map((p: any) => {
                            return (
                              <TableRow key={p.id} className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setSelectedPlayerSlug(p.slug)}>
                                <TableCell className="font-medium flex items-center gap-3 whitespace-nowrap">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://img.biwenger.com/players/${p.slug}.png`} />
                                    <AvatarFallback>{p.name.substring(0,2)}</AvatarFallback>
                                  </Avatar>
                                  {p.name}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="font-mono bg-slate-100">
                                    {{1:"POR", 2:"DEF", 3:"CEN", 4:"DEL"}[p.position as number] || p.position}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-600 whitespace-nowrap">
                                  {teams && teams[p.teamID] ? teams[p.teamID].name : p.teamID}
                                </TableCell>
                                <TableCell className="text-center">
                                  {p.nextMatch && (
                                    <div className="flex flex-col items-center justify-center">
                                      <Avatar className="h-6 w-6 border shadow-sm">
                                        <AvatarImage src={`https://img.biwenger.com/teams/${p.nextMatch.opponentID}.png`} title={`${p.nextMatch.isHome ? 'En casa' : 'Fuera'} vs ${teams?.[p.nextMatch.opponentID]?.name}`} />
                                      </Avatar>
                                      <MatchDifficulty diff={p.nextMatch.difficulty} />
                                    </div>
                                  )}
                                </TableCell>
                                
                                {metricsView === 'basic' ? (
                                  <>
                                    <TableCell className="text-right text-slate-500 tabular-nums">{p.played}</TableCell>
                                    <TableCell className="text-right text-slate-500 tabular-nums">{p.pointsHome || 0}</TableCell>
                                    <TableCell className="text-right text-slate-500 tabular-nums">{p.pointsAway || 0}</TableCell>
                                    <TableCell className="text-right font-bold text-slate-700 tabular-nums">{p.points || 0}</TableCell>
                                    <TableCell className="text-right font-medium text-slate-600 tabular-nums">{p.avg}</TableCell>
                                    <TableCell className="text-right font-semibold text-emerald-600 tabular-nums whitespace-nowrap">
                                      {new Intl.NumberFormat('es-ES').format(p.price)} €
                                    </TableCell>
                                  </>
                                ) : metricsView === 'advanced' ? (
                                  <>
                                    <TableCell className="text-right font-medium tabular-nums">{p.form}</TableCell>
                                    <TableCell className="text-right font-medium tabular-nums">{p.ppm}</TableCell>
                                    <TableCell className="text-right text-slate-500 tabular-nums">
                                      {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(p.costPerPoint)} €
                                    </TableCell>
                                    <TableCell className={`text-right font-medium tabular-nums ${p.priceIncrement > 0 ? "text-emerald-600" : p.priceIncrement < 0 ? "text-red-500" : "text-slate-500"}`}>
                                      {p.priceIncrement > 0 ? "+" : ""}{new Intl.NumberFormat('es-ES').format(p.priceIncrement)}
                                    </TableCell>
                                    <TableCell className="text-right text-slate-500 tabular-nums">{p.reliability}%</TableCell>
                                    <TableCell className="text-right font-medium text-blue-600 tabular-nums whitespace-nowrap">
                                      {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(p.expectedPrice)} €
                                    </TableCell>
                                    <TableCell className={`text-right font-bold tabular-nums ${p.roi > 0 ? "text-emerald-600" : "text-red-500"}`}>
                                      {p.roi > 0 ? "+" : ""}{p.roi}%
                                    </TableCell>
                                  </>
                                ) : (
                                  <>
                                    <TableCell className="text-right font-medium text-slate-600 tabular-nums">{p.performanceScore}</TableCell>
                                    <TableCell className="text-right font-medium text-slate-600 tabular-nums">{p.marketScore}</TableCell>
                                    <TableCell className="text-right font-medium text-slate-600 tabular-nums">{p.nextMatchScore}</TableCell>
                                    <TableCell className="text-right font-bold tabular-nums border-l"><span className={`px-2 py-0.5 rounded text-xs ${getScoreColor(p.playerScore)}`}>{p.playerScore}</span></TableCell>
                                  </>
                                )}
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="charts">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Mercado: Precio Real vs Score IA</CardTitle>
                  <CardDescription>
                    Esta gráfica muestra la regresión lineal que define si un jugador es Ganga, Sobrevalorado o Precio Justo.
                    La línea representa el Precio Esperado según su Score IA actual.
                  </CardDescription>
                  <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex gap-2 items-center">
                      <Label htmlFor="chart-position">Posición:</Label>
                      <select
                        id="chart-position"
                        className="flex h-9 w-[120px] items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                        value={chartFilterPosition}
                        onChange={(e) => setChartFilterPosition(e.target.value)}
                      >
                        <option value="all">Todas</option>
                        <option value="1">Porteros</option>
                        <option value="2">Defensas</option>
                        <option value="3">Centrocampistas</option>
                        <option value="4">Delanteros</option>
                      </select>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Label htmlFor="chart-price">Precio Max:</Label>
                      <select
                        id="chart-price"
                        className="flex h-9 w-[140px] items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                        value={chartFilterMaxPrice}
                        onChange={(e) => setChartFilterMaxPrice(Number(e.target.value))}
                      >
                        <option value={100000000}>Sin límite</option>
                        <option value={20000000}>20M €</option>
                        <option value={15000000}>15M €</option>
                        <option value={10000000}>10M €</option>
                        <option value={5000000}>5M €</option>
                        <option value={2000000}>2M €</option>
                        <option value={1000000}>1M €</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                          dataKey="score" 
                          type="number" 
                          name="Score IA" 
                          domain={[0, 100]} 
                          label={{ value: 'Score IA (Basado en Puntos y Racha)', position: 'insideBottom', offset: -10 }} 
                        />
                        <YAxis 
                          dataKey="price" 
                          type="number" 
                          name="Precio" 
                          tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} 
                          label={{ value: 'Precio de Mercado (€)', angle: -90, position: 'insideLeft', offset: -10 }}
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white border rounded p-3 shadow text-sm">
                                  <p className="font-bold">{data.name}</p>
                                  <p className="text-slate-500">Score IA: {data.score}</p>
                                  <p className="text-slate-500">Precio Real: {new Intl.NumberFormat('es-ES').format(data.price)} €</p>
                                  <p className="text-slate-500">Precio Esperado: {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(data.expected)} €</p>
                                  <div className="mt-2">
                                    <Badge variant="outline" className={data.label === 'Ganga' ? 'text-emerald-600 border-emerald-600' : data.label === 'Sobrevalorado' ? 'text-red-500 border-red-500' : ''}>
                                      {data.label}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter name="Jugadores" dataKey="price" fill="#64748b" opacity={0.6} />
                        <Line type="monotone" dataKey="expected" name="Regresión (Precio Esperado)" stroke="#2563eb" strokeWidth={3} dot={false} activeDot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="elo">
              <Card>
                <CardHeader>
                  <CardTitle>Rankings Club ELO Mundiales</CardTitle>
                  <CardDescription>Clasificación actual extraída de la API de Club ELO para evaluar fortalezas de equipos globalmente.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] border rounded-md">
                    <Table>
                      <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm border-b">
                        <TableRow>
                          <TableHead className="w-20 text-center">Rango</TableHead>
                          <TableHead>Club</TableHead>
                          <TableHead className="text-center">País</TableHead>
                          <TableHead className="text-center">Nivel País</TableHead>
                          <TableHead className="text-right">Puntuación ELO</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clubEloRaw.slice(0, 150).map((row, idx) => (
                           <TableRow key={idx}>
                             <TableCell className="text-center font-black text-slate-400">{row.rank}</TableCell>
                             <TableCell className="font-bold text-slate-700">{row.club}</TableCell>
                             <TableCell className="text-center">
                               <span title={row.country} className="text-lg">{row.country === 'ESP' ? '🇪🇸' : row.country === 'ENG' ? '🏴󠁧󠁢󠁥󠁮󠁧󠁿' : row.country === 'GER' ? '🇩🇪' : row.country === 'ITA' ? '🇮🇹' : row.country === 'FRA' ? '🇫🇷' : row.country}</span>
                             </TableCell>
                             <TableCell className="text-center text-slate-500">{row.level}</TableCell>
                             <TableCell className="text-right font-medium text-emerald-600 tabular-nums">{parseFloat(row.elo).toFixed(1)}</TableCell>
                           </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Ajustes de Análisis</CardTitle>
                  <CardDescription>Configura los límites para los roles especiales de tu liga.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="captain-limit">Límite de Precio para Capitán (€)</Label>
                    <div className="flex gap-4 items-center">
                      <Input 
                        id="captain-limit" 
                        type="number" 
                        value={captainLimit} 
                        onChange={(e) => setCaptainLimit(Number(e.target.value))}
                        className="max-w-[200px]"
                      />
                      <span className="text-sm text-slate-500">{new Intl.NumberFormat('es-ES').format(captainLimit)} €</span>
                    </div>
                    <p className="text-xs text-slate-400">Jugadores por debajo de este precio serán analizados como posibles capitanes económicos.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="striker-limit">Límite de Precio para Ariete (€)</Label>
                    <div className="flex gap-4 items-center">
                      <Input 
                        id="striker-limit" 
                        type="number" 
                        value={strikerLimit} 
                        onChange={(e) => setStrikerLimit(Number(e.target.value))}
                        className="max-w-[200px]"
                      />
                      <span className="text-sm text-slate-500">{new Intl.NumberFormat('es-ES').format(strikerLimit)} €</span>
                    </div>
                    <p className="text-xs text-slate-400">Jugadores por debajo de este precio recibirán el tag de APTO ARIETE si su score es bueno.</p>
                  </div>

                  <div className="space-y-2 mt-4 pt-4 border-t">
                    <Label htmlFor="max-players">Máximo de jugadores por equipo en la alineación</Label>
                    <div className="flex gap-4 items-center">
                      <Input 
                        id="max-players" 
                        type="number" 
                        value={maxPlayersPerTeam} 
                        onChange={(e) => setMaxPlayersPerTeam(Number(e.target.value))}
                        className="max-w-[100px]"
                        min="1"
                        max="11"
                      />
                    </div>
                    <p className="text-xs text-slate-400">Si intentas elegir más jugadores de este número de un mismo equipo, irán al banquillo / reservas.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <PlayerDetails 
        playerSlug={selectedPlayerSlug} 
        isOpen={selectedPlayerSlug !== null} 
        onClose={() => setSelectedPlayerSlug(null)} 
        enhancedCatalog={enhancedCatalog}
        teams={teams}
      />
    </div>
  );
}
