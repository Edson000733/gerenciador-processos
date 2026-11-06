import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Plus, FileText, CheckCircle2, Clock, DollarSign, FileCheck,
  Paperclip, Sun, Moon, X, Filter, AlertCircle, Phone, Trash2, Pencil, Layers, User, Printer
} from 'lucide-react';

const ETAPAS = ['ABERTURA', 'EM INSTRUÇÃO', 'EMPENHADO', 'AGUARDANDO NF', 'EM LIQUIDAÇÃO', 'AGUARDANDO PAGAMENTO', 'CONCLUÍDO'];
const IDX_EMPENHO = ETAPAS.indexOf('EMPENHADO');
const ETAPAS_PRE = ETAPAS.slice(0, IDX_EMPENHO);
const ETAPAS_POS = ETAPAS.slice(IDX_EMPENHO + 1);
const corEtapa = (s) => s === 'CONCLUÍDO' || s === 'EMPENHADO' ? 'bg-emerald-500' : ETAPAS_PRE.includes(s) ? 'bg-blue-500' : 'bg-amber-500';
const hoje = () => new Date().toLocaleDateString('pt-BR');
const brl = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const initialProcessos = [
  {
    id: '1', empenho: '2026NE0001', processo: '23079.234435/2025-12', requisitante: 'Setor de Almoxarifado',
    beneficiario: 'EMBALAGENS LTDA', cnpj: '23.829.669/0001-96', telefone: '(11) 98765-4321',
    objeto: 'PAPEL HIGIENICO (Material de Limpeza)', classificacao: 'CUSTEIO', fonte: 'Participativo',
    modalidade: 'ATA', valorBruto: 25230.98, darfRetencao: 306.01, statusGeral: 'CONCLUÍDO', dataCriacao: '05/01/2026',
    historico: [
      { id: 'h0', data: '05/01/2026', status: 'ABERTURA', descricao: 'Processo aberto a partir da solicitação do setor de almoxarifado.', documentoAnexo: 'Memorando de Solicitação.pdf' },
      { id: 'h1', data: '15/01/2026', status: 'EMPENHADO', descricao: 'Empenho emitido no sistema e enviado ao fornecedor.', documentoAnexo: 'Nota de Empenho nº 2026NE0001.pdf' },
      { id: 'h2', data: '28/01/2026', status: 'AGUARDANDO NF', descricao: 'Material entregue no almoxarifado. Aguardando emissão da NF.', documentoAnexo: 'Termo de Recebimento Provisório.pdf' },
      { id: 'h3', data: '05/02/2026', status: 'EM LIQUIDAÇÃO', descricao: 'Nota Fiscal nº 618 atestada. Calculado DARF de R$ 306,01.', documentoAnexo: 'NF 618 + Ateste de Conformidade.pdf' },
      { id: 'h4', data: '10/02/2026', status: 'AGUARDANDO PAGAMENTO', descricao: 'Processo enviado para a Tesouraria para emissão da OB.', documentoAnexo: 'Ordem Bancária OB12345.pdf' },
      { id: 'h5', data: '12/02/2026', status: 'CONCLUÍDO', descricao: 'Pagamento efetuado e comprovante anexado ao processo.', documentoAnexo: 'Comprovante de Transferência.pdf' }
    ]
  },
  {
    id: '2', empenho: '2026NE0002', processo: '23079.234450/2025-88', requisitante: 'Departamento de TI',
    beneficiario: 'TECH & INFORMAÇÕES S.A.', cnpj: '04.123.987/0001-22', telefone: '(21) 99876-5432',
    objeto: 'SERVIDORES E MONITORES LCD', classificacao: 'INVESTIMENTO', fonte: 'Próprio',
    modalidade: 'PREGÃO', valorBruto: 63400.50, darfRetencao: 225.00, statusGeral: 'AGUARDANDO NF', dataCriacao: '08/01/2026',
    historico: [
      { id: 'h20', data: '08/01/2026', status: 'ABERTURA', descricao: 'Processo aberto para aquisição de equipamentos de TI.', documentoAnexo: 'Termo de Referência.pdf' },
      { id: 'h21', data: '18/01/2026', status: 'EMPENHADO', descricao: 'Empenho de material permanente emitido.', documentoAnexo: 'Nota de Empenho nº 2026NE0002.pdf' },
      { id: 'h22', data: '02/02/2026', status: 'AGUARDANDO NF', descricao: 'Equipamentos entregues e sob análise técnica TI.', documentoAnexo: 'Relatorio_Tecnico_Inspeção.pdf' }
    ]
  }
];

const emptyEmpenho = { numero: '', data: '', valor: '', documentoAnexo: '' };

const emptyProcesso = {
  processo: '', requisitante: '', beneficiario: '', cnpj: '', telefone: '', objeto: '',
  classificacao: 'CUSTEIO', fonte: 'Participativo', modalidade: 'ATA', valorBruto: '', darfRetencao: ''
};

function Field({ id, label, dark, as = 'input', children, ...props }) {
  const cls = `w-full p-2.5 rounded-lg border outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition ${dark ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'}`;
  const El = as;
  return (
    <div>
      <label htmlFor={id} className="block text-slate-400 font-medium mb-1">{label}</label>
      <El id={id} className={cls} {...props}>{children}</El>
    </div>
  );
}

function Modal({ open, onClose, title, icon, dark, children, size = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        className={`w-full ${size} max-h-[90vh] overflow-y-auto scroll-thin rounded-2xl border p-6 shadow-2xl relative ${dark ? 'bg-[#1e293b] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
        <button onClick={onClose} aria-label="Fechar" className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
        <h3 className="text-base font-bold mb-4 flex items-center gap-2">{icon}{title}</h3>
        {children}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, dark, onClick, active }) {
  const base = `p-4 rounded-xl border shadow-sm text-left w-full transition ${dark ? 'bg-[#1e293b] border-slate-700/60' : 'bg-white border-slate-200'}`;
  const content = (
    <>
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>{label}</span><Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
      </div>
      <div className={`mt-2 text-xl font-bold tracking-tight ${color}`}>{value}</div>
      {onClick && <div className={`mt-1 text-[10px] font-medium ${active ? 'text-blue-400' : 'text-slate-500'}`}>{active ? 'Filtro ativo · clique para limpar' : 'Clique para filtrar'}</div>}
    </>
  );
  if (!onClick) return <div className={base}>{content}</div>;
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`${base} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${active ? 'ring-2 ring-blue-500 border-blue-500/70' : dark ? 'hover:border-slate-500 hover:bg-slate-800/80' : 'hover:border-slate-300 hover:bg-slate-50'}`}>
      {content}
    </button>
  );
}

const STATUS_FILTROS = {
  TODOS: { label: 'Todos', test: () => true },
  CONCLUIDOS: { label: 'Concluídos', test: (p) => p.statusGeral === 'CONCLUÍDO' },
  ANDAMENTO: { label: 'Em Andamento', test: (p) => p.statusGeral !== 'CONCLUÍDO' },
  SEM_EMPENHO: { label: 'Aguardando Empenho', test: (p) => !p.empenho },
};

export default function App() {
  const [dark, setDark] = useState(true);
  const [processos, setProcessos] = useState(initialProcessos);
  const [selectedId, setSelectedId] = useState(initialProcessos[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('TODOS');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isHistOpen, setIsHistOpen] = useState(false);
  const [novo, setNovo] = useState(emptyProcesso);
  const [ocorrencia, setOcorrencia] = useState({ data: hoje(), status: 'EM INSTRUÇÃO', descricao: '', documentoAnexo: '' });
  const [isEmpOpen, setIsEmpOpen] = useState(false);
  const [empForm, setEmpForm] = useState(emptyEmpenho);
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [editingId, setEditingId] = useState(null);
  const [editingHistId, setEditingHistId] = useState(null);

  const toggleStatus = (key) => setStatusFilter((cur) => (cur === key ? 'TODOS' : key));

  const selected = useMemo(() => processos.find((p) => p.id === selectedId) || processos[0], [processos, selectedId]);
  const totalBruto = processos.reduce((a, p) => a + (p.valorBruto || 0), 0);
  const totalRet = processos.reduce((a, p) => a + (p.darfRetencao || 0), 0);
  const concluidos = processos.filter((p) => p.statusGeral === 'CONCLUÍDO').length;
  const semEmpenho = processos.filter((p) => !p.empenho).length;
  const etapasOcorrencia = selected?.empenho ? ETAPAS_POS : ETAPAS_PRE.slice(1);

  const openOcorrencia = () => {
    setEditingHistId(null);
    setOcorrencia({ data: hoje(), status: etapasOcorrencia[0], descricao: '', documentoAnexo: '' });
    setIsHistOpen(true);
  };

  const openEditOcorrencia = (h) => {
    setEditingHistId(h.id);
    setOcorrencia({ data: h.data, status: h.status, descricao: h.descricao, documentoAnexo: h.documentoAnexo || '' });
    setIsHistOpen(true);
  };

  const removeOcorrencia = (h) => {
    if (selected.historico.length <= 1) { alert('O processo precisa ter ao menos uma movimentação.'); return; }
    if (!confirm(`Excluir a movimentação de ${h.data} (${h.status})?`)) return;
    setProcessos(processos.map((p) => {
      if (p.id !== selected.id) return p;
      const historico = p.historico.filter((x) => x.id !== h.id);
      const aindaEmpenhado = historico.some((x) => x.status === 'EMPENHADO');
      return {
        ...p, historico,
        empenho: aindaEmpenhado ? p.empenho : '',
        statusGeral: historico[historico.length - 1].status,
      };
    }));
  };

  const openNovo = () => {
    setEditingId(null);
    setNovo(emptyProcesso);
    setIsNewOpen(true);
  };

  const openEditProcesso = () => {
    setEditingId(selected.id);
    setNovo({
      processo: selected.processo, requisitante: selected.requisitante || '', beneficiario: selected.beneficiario, cnpj: selected.cnpj || '',
      telefone: selected.telefone || '', objeto: selected.objeto || '', classificacao: selected.classificacao,
      fonte: selected.fonte, modalidade: selected.modalidade, empenho: selected.empenho || '',
      valorBruto: selected.valorBruto ? String(selected.valorBruto) : '', darfRetencao: selected.darfRetencao ? String(selected.darfRetencao) : '',
    });
    setIsNewOpen(true);
  };

  const openEmpenho = () => {
    setEmpForm({ ...emptyEmpenho, data: hoje(), valor: selected?.valorBruto || '' });
    setIsEmpOpen(true);
  };

  const registrarEmpenho = (e) => {
    e.preventDefault();
    const item = {
      id: String(Date.now()), data: empForm.data, status: 'EMPENHADO',
      descricao: `Nota de Empenho ${empForm.numero} emitida no valor de ${brl(parseFloat(empForm.valor) || 0)}.`,
      documentoAnexo: empForm.documentoAnexo || `Nota de Empenho nº ${empForm.numero}.pdf`
    };
    setProcessos(processos.map((p) => p.id === selected.id ? {
      ...p, empenho: empForm.numero, valorBruto: parseFloat(empForm.valor) || p.valorBruto,
      statusGeral: 'EMPENHADO', historico: [...p.historico, item]
    } : p));
    setIsEmpOpen(false);
  };

  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return processos.filter((p) =>
      [(p.empenho || ''), (p.processo || ''), (p.beneficiario || ''), (p.requisitante || ''), (p.objeto || '')].some((f) => f.toLowerCase().includes(t)) &&
      (filterClass === 'TODOS' || p.classificacao === filterClass) &&
      STATUS_FILTROS[statusFilter].test(p));
  }, [processos, searchTerm, filterClass, statusFilter]);

  const card = dark ? 'bg-[#1e293b] border-slate-700/60' : 'bg-white border-slate-200';
  const muted = dark ? 'text-slate-400' : 'text-slate-500';

  const createProcesso = (e) => {
    e.preventDefault();
    if (editingId) {
      setProcessos(processos.map((p) => p.id === editingId ? {
        ...p, ...novo,
        empenho: p.empenho ? (novo.empenho || p.empenho) : p.empenho,
        valorBruto: parseFloat(novo.valorBruto) || 0,
        darfRetencao: parseFloat(novo.darfRetencao) || 0,
      } : p));
      setIsNewOpen(false);
      setEditingId(null);
      setNovo(emptyProcesso);
      return;
    }
    const id = String(Date.now());
    const obj = {
      ...novo, id, empenho: '',
      valorBruto: parseFloat(novo.valorBruto) || 0,
      darfRetencao: parseFloat(novo.darfRetencao) || 0,
      statusGeral: 'ABERTURA', dataCriacao: hoje(),
      historico: [{ id: id + 'h', data: hoje(), status: 'ABERTURA', descricao: 'Abertura do processo no sistema.', documentoAnexo: '' }]
    };
    setProcessos([obj, ...processos]);
    setSelectedId(id);
    setIsNewOpen(false);
    setNovo(emptyProcesso);
  };

  const addOcorrencia = (e) => {
    e.preventDefault();
    if (editingHistId) {
      setProcessos(processos.map((p) => {
        if (p.id !== selected.id) return p;
        const historico = p.historico.map((h) => h.id === editingHistId ? { ...h, ...ocorrencia } : h);
        return { ...p, historico, statusGeral: historico[historico.length - 1].status };
      }));
      setEditingHistId(null);
      setIsHistOpen(false);
      return;
    }
    const item = { ...ocorrencia, id: String(Date.now()) };
    setProcessos(processos.map((p) => p.id === selected.id ? { ...p, statusGeral: ocorrencia.status, historico: [...p.historico, item] } : p));
    setIsHistOpen(false);
    setOcorrencia({ data: hoje(), status: 'EM LIQUIDAÇÃO', descricao: '', documentoAnexo: '' });
  };

  const removeProcesso = () => {
    if (!selected || !confirm(`Excluir o processo ${selected.processo}?`)) return;
    const rest = processos.filter((p) => p.id !== selected.id);
    setProcessos(rest);
    setSelectedId(rest[0]?.id);
  };

  const handlePrint = () => {
    window.print();
  };

  const etapaIdx = selected ? ETAPAS.indexOf(selected.statusGeral) : -1;

  return (
    <div className={`min-h-screen transition-colors ${dark ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Estilos para a Impressão */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
      `}</style>

      {/* TELA DE IMPRESSÃO */}
      <div className="print-only p-8">
        <h1 className="text-xl font-bold mb-1">RELATÓRIO RESUMIDO DE PROCESSOS</h1>
        <p className="text-xs text-slate-600 mb-4">Gerado em: {hoje()} · Total de Processos: {filtered.length}</p>

        <table className="w-full border-collapse border border-slate-300 text-left text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 p-2 font-bold">Nº PROCESSO</th>
              <th className="border border-slate-300 p-2 font-bold">EMPENHO</th>
              <th className="border border-slate-300 p-2 font-bold">REQUISITANTE</th>
              <th className="border border-slate-300 p-2 font-bold">BENEFICIÁRIO</th>
              <th className="border border-slate-300 p-2 font-bold">OBJETO</th>
              <th className="border border-slate-300 p-2 font-bold">VALOR BRUTO</th>
              <th className="border border-slate-300 p-2 font-bold">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="border border-slate-300 p-2 font-mono font-bold">{p.processo}</td>
                <td className="border border-slate-300 p-2">{p.empenho || 'Pendente'}</td>
                <td className="border border-slate-300 p-2">{p.requisitante || '-'}</td>
                <td className="border border-slate-300 p-2">{p.beneficiario}</td>
                <td className="border border-slate-300 p-2">{p.objeto || '-'}</td>
                <td className="border border-slate-300 p-2">{brl(p.valorBruto)}</td>
                <td className="border border-slate-300 p-2 font-semibold">{p.statusGeral}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAINEL PRINCIPAL DO SISTEMA */}
      <div className="no-print">
        <header className={`sticky top-0 z-30 border-b backdrop-blur-md ${dark ? 'bg-[#1e293b]/90 border-slate-700/60' : 'bg-white/90 border-slate-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-500/20 shrink-0"><FileText className="w-5 h-5" aria-hidden="true" /></div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold tracking-tight truncate">SISTEMA DE ACOMPANHAMENTO DE PROCESSOS</h1>
                <p className={`text-xs ${muted} truncate`}>Ficha de Registro e Histórico de Ocorrências</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handlePrint} title="Imprimir Relatório"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium shrink-0 transition ${dark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'}`}>
                <Printer className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Imprimir Resumo</span>
              </button>

              <button onClick={() => setDark(!dark)} aria-label={dark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
                className={`p-2 rounded-lg border shrink-0 ${dark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-amber-400' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'}`}>
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
          <section aria-label="Resumo" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard dark={dark} label="Valor Bruto" value={brl(totalBruto)} icon={DollarSign} color="text-blue-500" />
            <StatCard dark={dark} label="DARF / Retenção" value={brl(totalRet)} icon={AlertCircle} color="text-rose-500" />
            <StatCard dark={dark} label="Valor Líquido" value={brl(totalBruto - totalRet)} icon={FileCheck} color="text-emerald-500" />
            <StatCard dark={dark} label="Concluídos" value={concluidos} icon={CheckCircle2} color="text-emerald-500" onClick={() => toggleStatus('CONCLUIDOS')} active={statusFilter === 'CONCLUIDOS'} />
            <StatCard dark={dark} label="Em Andamento" value={processos.length - concluidos} icon={Clock} color="text-amber-500" onClick={() => toggleStatus('ANDAMENTO')} active={statusFilter === 'ANDAMENTO'} />
            <StatCard dark={dark} label="Aguardando Empenho" value={semEmpenho} icon={FileText} color="text-sky-400" onClick={() => toggleStatus('SEM_EMPENHO')} active={statusFilter === 'SEM_EMPENHO'} />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Lista */}
            <section aria-label="Processos cadastrados" className={`lg:col-span-5 rounded-2xl border p-4 shadow-sm flex flex-col lg:h-[740px] ${card}`}>
              <div className={`flex flex-col gap-3 pb-3 border-b ${dark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-sm uppercase tracking-wider text-slate-400">Processos Cadastrados</h2>
                  <button onClick={openNovo} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-sm">
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />Novo Processo
                  </button>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <label htmlFor="busca" className="sr-only">Buscar processos</label>
                  <input id="busca" type="search" placeholder="Buscar por processo, requisitante ou beneficiário..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-none focus:border-blue-500 ${dark ? 'bg-slate-800/80 border-slate-700 text-slate-200 placeholder-slate-500' : 'bg-slate-50 border-slate-200 placeholder-slate-400'}`} />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por classificação">
                  <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  {['TODOS', 'CUSTEIO', 'INVESTIMENTO'].map((c) => (
                    <button key={c} onClick={() => setFilterClass(c)} aria-pressed={filterClass === c}
                      className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap text-[11px] ${filterClass === c ? 'bg-blue-600 text-white' : dark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{c}</button>
                  ))}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por situação">
                  <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  {Object.entries(STATUS_FILTROS).map(([key, f]) => {
                    const count = processos.filter(f.test).length;
                    const on = statusFilter === key;
                    return (
                      <button key={key} onClick={() => setStatusFilter(key)} aria-pressed={on}
                        className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap text-[11px] inline-flex items-center gap-1.5 ${on ? 'bg-blue-600 text-white' : dark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {f.label}
                        <span className={`px-1.5 rounded-full text-[10px] ${on ? 'bg-white/20' : dark ? 'bg-slate-700' : 'bg-slate-200'}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
                <p className={`text-[11px] ${muted}`} aria-live="polite">
                  Exibindo <b>{filtered.length}</b> de {processos.length} processo(s){statusFilter !== 'TODOS' && <> · <span className="text-blue-400">{STATUS_FILTROS[statusFilter].label}</span></>}
                </p>
              </div>

              <ul className="flex-1 overflow-y-auto scroll-thin pt-3 flex flex-col gap-2.5 pr-1">
                {filtered.length === 0 ? (
                  <li className="text-center py-12 text-slate-400 text-xs">Nenhum processo encontrado com esses termos.</li>
                ) : filtered.map((item) => {
                  const sel = item.id === selected?.id;
                  const done = item.statusGeral === 'CONCLUÍDO';
                  return (
                    <li key={item.id}>
                      <button onClick={() => setSelectedId(item.id)} aria-current={sel}
                        className={`w-full text-left p-3.5 rounded-xl border transition ${sel ? (dark ? 'bg-blue-900/30 border-blue-500/70 ring-1 ring-blue-500/30' : 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-400/30') : (dark ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/80')}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-sm tracking-wide text-blue-400 font-mono">{item.processo}</span>
                            <p className={`text-xs mt-0.5 ${muted}`}>
                              {item.empenho ? <>Empenho: <span className="font-medium">{item.empenho}</span></> : <span className="text-sky-400 font-medium">Aguardando empenho</span>}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.classificacao === 'CUSTEIO' ? 'bg-amber-500/15 text-amber-500 border-amber-500/30' : 'bg-purple-500/15 text-purple-400 border-purple-500/30'}`}>{item.classificacao}</span>
                        </div>
                        {item.requisitante && <div className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1"><User className="w-3 h-3 text-blue-400" />Req: {item.requisitante}</div>}
                        <div className="mt-1 text-xs font-medium truncate">{item.beneficiario}</div>
                        <div className={`mt-3 flex items-center justify-between text-[11px] pt-2 border-t ${dark ? 'border-slate-700/40' : 'border-slate-200'}`}>
                          <span className="text-slate-400">{item.dataCriacao}</span>
                          <span className={`font-semibold ${done ? 'text-emerald-500' : 'text-amber-500'}`}>{item.statusGeral}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Detalhes */}
            <section aria-label="Detalhes do processo" className={`lg:col-span-7 rounded-2xl border p-6 shadow-sm lg:min-h-[740px] ${card}`}>
              {selected ? (
                <div className="flex flex-col gap-6">
                  <div className={`border-b pb-5 ${dark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-1 font-bold rounded-md bg-blue-600 text-white">{selected.modalidade}</span>
                        <span className={`text-xs px-2.5 py-1 font-bold rounded-md border ${selected.classificacao === 'CUSTEIO' ? 'bg-amber-500/15 text-amber-500 border-amber-500/30' : 'bg-purple-500/15 text-purple-400 border-purple-500/30'}`}>{selected.classificacao}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={openEditProcesso} aria-label="Editar processo" title="Editar processo" className={`p-1.5 rounded-lg border text-blue-400 ${dark ? 'border-slate-700 hover:bg-blue-500/10' : 'border-slate-200 hover:bg-blue-50'}`}><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={removeProcesso} aria-label="Excluir processo" title="Excluir processo" className={`p-1.5 rounded-lg border text-rose-500 ${dark ? 'border-slate-700 hover:bg-rose-500/10' : 'border-slate-200 hover:bg-rose-50'}`}><Trash2 className="w-3.5 h-3.5" /></button>
                        {!selected.empenho && (
                          <button onClick={openEmpenho} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm">
                            <FileCheck className="w-3.5 h-3.5" aria-hidden="true" />Registrar Empenho
                          </button>
                        )}
                        <button onClick={openOcorrencia} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm">
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />Nova Movimentação
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
                      <div>
                        <p className={`text-[11px] uppercase font-semibold tracking-wider ${muted}`}>Nº Processo</p>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight font-mono">{selected.processo}</h2>
                        {selected.requisitante && <p className="text-xs text-blue-400 mt-0.5 flex items-center gap-1"><User className="w-3 h-3" />Requisitante: <b>{selected.requisitante}</b></p>}
                        <p className={`text-xs mt-1 ${muted}`}>Empenho: {selected.empenho
                          ? <span className="font-mono text-blue-400 font-semibold">{selected.empenho}</span>
                          : <span className="text-sky-400 font-semibold">ainda não empenhado</span>}</p>
                      </div>
                      <div className="sm:text-right">
                        <div className="text-xs text-slate-400">{selected.empenho ? 'Valor Líquido' : 'Valor Estimado'}</div>
                        <div className="text-xl font-extrabold text-emerald-500">{brl((selected.valorBruto || 0) - (selected.darfRetencao || 0))}</div>
                      </div>
                    </div>

                    <ol className="mt-5 grid grid-cols-7 gap-1.5" aria-label="Etapas do processo">
                      {ETAPAS.map((et, i) => (
                        <li key={et} className="flex flex-col gap-1.5" aria-current={i === etapaIdx ? 'step' : undefined}>
                          <div className={`h-1.5 rounded-full ${i <= etapaIdx ? (etapaIdx === ETAPAS.length - 1 ? 'bg-emerald-500' : 'bg-blue-500') : dark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                          <span className={`text-[9px] sm:text-[10px] font-semibold leading-tight ${i <= etapaIdx ? (dark ? 'text-slate-200' : 'text-slate-700') : 'text-slate-500'}`}>{et}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className={`p-4 rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-4 ${dark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase">Beneficiário</span>
                      <div className="text-xs font-bold mt-0.5">{selected.beneficiario}</div>
                      {selected.cnpj && <div className="text-[11px] text-slate-500 mt-0.5">CNPJ: {selected.cnpj}</div>}
                      {selected.telefone && <div className="text-[11px] text-blue-400 mt-1 flex items-center gap-1 font-medium"><Phone className="w-3 h-3" aria-hidden="true" />{selected.telefone}</div>}
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase">Objeto</span>
                      <div className="text-xs font-bold mt-0.5">{selected.objeto || 'Não informado'}</div>
                    </div>
                    <div className={`pt-2 border-t ${dark ? 'border-slate-700/40' : 'border-slate-200'}`}>
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase">Classificação / Fonte</span>
                      <div className="text-xs mt-0.5">Classificação: <b>{selected.classificacao}</b> | Fonte: <b>{selected.fonte}</b></div>
                    </div>
                    <div className={`pt-2 border-t ${dark ? 'border-slate-700/40' : 'border-slate-200'}`}>
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase">Detalhamento Financeiro</span>
                      <div className="text-xs mt-0.5">Bruto: <b>{brl(selected.valorBruto)}</b> <span className="text-rose-500">| DARF: <b>{brl(selected.darfRetencao)}</b></span></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" aria-hidden="true" />Histórico de Movimentações e Documentos
                    </h3>
                    <ol className={`relative pl-7 flex flex-col gap-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 ${dark ? 'before:bg-slate-700/60' : 'before:bg-slate-200'}`}>
                      {selected.historico.map((h) => (
                        <li key={h.id} className="relative">
                          <div className={`absolute -left-7 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ${dark ? 'ring-[#1e293b]' : 'ring-white'} ${corEtapa(h.status)}`}>
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                          <div className={`p-3.5 rounded-xl border ${dark ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-blue-400">{h.data} - <span className="uppercase tracking-wide">{h.status}</span></span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => openEditOcorrencia(h)} aria-label={`Editar movimentação de ${h.data}`} title="Editar" className={`p-1 rounded-md text-slate-400 hover:text-blue-400 ${dark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => removeOcorrencia(h)} aria-label={`Excluir movimentação de ${h.data}`} title="Excluir" className={`p-1 rounded-md text-slate-400 hover:text-rose-500 ${dark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                            <p className={`text-xs mt-1.5 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{h.descricao}</p>
                            {h.documentoAnexo && (
                              <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-medium">
                                <Paperclip className="w-3 h-3" aria-hidden="true" />Documento Anexo: {h.documentoAnexo}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-400 text-xs">Nenhum processo cadastrado. Clique em "Novo Processo" para começar.</div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* MODAL NOVO / EDITAR PROCESSO */}
      <Modal open={isNewOpen} onClose={() => setIsNewOpen(false)} dark={dark} title={editingId ? 'Editar Processo' : 'Abrir Novo Processo'} icon={editingId ? <Pencil className="w-4 h-4 text-blue-500" /> : <Plus className="w-4 h-4 text-blue-500" />}>
        <form onSubmit={createProcesso} className="flex flex-col gap-3 text-xs">
          <Field dark={dark} id="n-proc" label="Nº Processo *" required placeholder="23079.00123/2026-00" value={novo.processo} onChange={(e) => setNovo({ ...novo, processo: e.target.value })} />
          <Field dark={dark} id="n-req" label="Setor Requisitante / Solicitante" placeholder="Ex: Almoxarifado / TI / Gabinete" value={novo.requisitante} onChange={(e) => setNovo({ ...novo, requisitante: e.target.value })} />
          
          {editingId && novo.empenho && (
            <Field dark={dark} id="n-emp" label="Nº Empenho" value={novo.empenho} onChange={(e) => setNovo({ ...novo, empenho: e.target.value })} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field dark={dark} id="n-ben" label="Beneficiário *" required placeholder="FORNECEDOR ABC LTDA" value={novo.beneficiario} onChange={(e) => setNovo({ ...novo, beneficiario: e.target.value })} />
            <Field dark={dark} id="n-cnpj" label="CNPJ" placeholder="00.000.000/0001-00" value={novo.cnpj} onChange={(e) => setNovo({ ...novo, cnpj: e.target.value })} />
          </div>
          <Field dark={dark} id="n-tel" label="Telefone de Contato" type="tel" placeholder="(00) 00000-0000" value={novo.telefone} onChange={(e) => setNovo({ ...novo, telefone: e.target.value })} />
          <Field dark={dark} id="n-obj" label="Objeto / Descrição Resumida" placeholder="Ex: Material de Limpeza / Papel" value={novo.objeto} onChange={(e) => setNovo({ ...novo, objeto: e.target.value })} />
          
          <div className="grid grid-cols-3 gap-3">
            <Field dark={dark} id="n-class" as="select" label="Classificação" value={novo.classificacao} onChange={(e) => setNovo({ ...novo, classificacao: e.target.value })}>
              <option value="CUSTEIO">CUSTEIO</option><option value="INVESTIMENTO">INVESTIMENTO</option>
            </Field>
            <Field dark={dark} id="n-fonte" label="Fonte" value={novo.fonte} onChange={(e) => setNovo({ ...novo, fonte: e.target.value })} />
            <Field dark={dark} id="n-mod" label="Modalidade" value={novo.modalidade} onChange={(e) => setNovo({ ...novo, modalidade: e.target.value })} />
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-[11px] text-blue-400 font-semibold mb-2">Valores (Opcionais no momento da abertura)</p>
            <div className="grid grid-cols-2 gap-3">
              <Field dark={dark} id="n-bruto" label="Valor Estimado (R$)" type="number" step="0.01" min="0" placeholder="0,00" value={novo.valorBruto} onChange={(e) => setNovo({ ...novo, valorBruto: e.target.value })} />
              <Field dark={dark} id="n-darf" label="DARF / Retenção (R$)" type="number" step="0.01" min="0" placeholder="0,00" value={novo.darfRetencao} onChange={(e) => setNovo({ ...novo, darfRetencao: e.target.value })} />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setIsNewOpen(false)} className={`px-4 py-2 rounded-lg border font-medium ${dark ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-100'}`}>Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">{editingId ? 'Salvar Alterações' : 'Salvar Processo'}</button>
          </div>
        </form>
      </Modal>

      {/* MODAL REGISTRAR MOVIMENTAÇÃO */}
      <Modal open={isHistOpen} onClose={() => setIsHistOpen(false)} dark={dark} size="max-w-md" title={editingHistId ? 'Editar Movimentação' : 'Adicionar Nova Ocorrência'} icon={editingHistId ? <Pencil className="w-4 h-4 text-emerald-500" /> : <Plus className="w-4 h-4 text-emerald-500" />}>
        <form onSubmit={addOcorrencia} className="flex flex-col gap-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Field dark={dark} id="o-data" label="Data" required placeholder="DD/MM/AAAA" value={ocorrencia.data} onChange={(e) => setOcorrencia({ ...ocorrencia, data: e.target.value })} />
            <Field dark={dark} id="o-status" as="select" label="Status da Etapa" value={ocorrencia.status} onChange={(e) => setOcorrencia({ ...ocorrencia, status: e.target.value })}>
              {(editingHistId ? ETAPAS : etapasOcorrencia).map((s) => <option key={s} value={s}>{s}</option>)}
            </Field>
          </div>
          <Field dark={dark} id="o-desc" as="textarea" rows={3} label="Descrição / Despacho" required placeholder="Ex: Nota Fiscal atestada e encaminhada para pagamento..." value={ocorrencia.descricao} onChange={(e) => setOcorrencia({ ...ocorrencia, descricao: e.target.value })} />
          <Field dark={dark} id="o-doc" label="Documento Anexo (nome do arquivo)" placeholder="Ex: NF_618_Atestada.pdf" value={ocorrencia.documentoAnexo} onChange={(e) => setOcorrencia({ ...ocorrencia, documentoAnexo: e.target.value })} />
          <div className="pt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setIsHistOpen(false)} className={`px-4 py-2 rounded-lg border font-medium ${dark ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-100'}`}>Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm">{editingHistId ? 'Salvar Alterações' : 'Registrar Ocorrência'}</button>
          </div>
        </form>
      </Modal>

      {/* MODAL REGISTRAR EMPENHO */}
      <Modal open={isEmpOpen} onClose={() => setIsEmpOpen(false)} dark={dark} size="max-w-md" title="Registrar Empenho" icon={<FileCheck className="w-4 h-4 text-blue-500" />}>
        <form onSubmit={registrarEmpenho} className="flex flex-col gap-3 text-xs">
          <p className={`text-[11px] ${muted}`}>Processo <span className="font-mono text-blue-400">{selected?.processo}</span></p>
          <div className="grid grid-cols-2 gap-3">
            <Field dark={dark} id="e-num" label="Nº Empenho" required placeholder="Ex: 2026NE0004" value={empForm.numero} onChange={(e) => setEmpForm({ ...empForm, numero: e.target.value })} />
            <Field dark={dark} id="e-data" label="Data" required placeholder="DD/MM/AAAA" value={empForm.data} onChange={(e) => setEmpForm({ ...empForm, data: e.target.value })} />
          </div>
          <Field dark={dark} id="e-valor" label="Valor Empenhado (R$)" required type="number" step="0.01" min="0" value={empForm.valor} onChange={(e) => setEmpForm({ ...empForm, valor: e.target.value })} />
          <Field dark={dark} id="e-doc" label="Documento Anexo (nome do arquivo)" placeholder="Nota de Empenho.pdf" value={empForm.documentoAnexo} onChange={(e) => setEmpForm({ ...empForm, documentoAnexo: e.target.value })} />
          <div className="pt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setIsEmpOpen(false)} className={`px-4 py-2 rounded-lg border font-medium ${dark ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-100'}`}>Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">Registrar Empenho</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
