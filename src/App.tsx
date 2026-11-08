import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, Plus, FileText, CheckCircle2, Clock, DollarSign, FileCheck,
  Paperclip, Sun, Moon, X, Filter, AlertCircle, Phone, Trash2, Pencil,
  Layers, User, Printer, Settings2
} from 'lucide-react';

import { supabase } from '../utils/supabase';

const ETAPAS = [
  'ABERTURA',
  'EM INSTRUÇÃO',
  'EMPENHADO',
  'AGUARDANDO NF',
  'EM LIQUIDAÇÃO',
  'AGUARDANDO PAGAMENTO',
  'CONCLUÍDO'
];

const IDX_EMPENHO = ETAPAS.indexOf('EMPENHADO');
const ETAPAS_PRE = ETAPAS.slice(0, IDX_EMPENHO);
const ETAPAS_POS = ETAPAS.slice(IDX_EMPENHO + 1);

const corEtapa = (s: string) =>
  s === 'CONCLUÍDO' || s === 'EMPENHADO'
    ? 'bg-emerald-500'
    : ETAPAS_PRE.includes(s)
      ? 'bg-blue-500'
      : 'bg-amber-500';

const hoje = () => new Date().toLocaleDateString('pt-BR');

const anoDoProcesso = (p: any) => {
  if (p.ano) return String(p.ano);

  // Compatibilidade com registros antigos que ainda não possuem o campo "ano".
  const anoData = String(p.dataCriacao || '').match(/\/(\d{4})$/)?.[1];
  if (anoData) return anoData;

  const anoNumeroProcesso = String(p.processo || '').match(/\/(\d{4})-/)?.[1];
  return anoNumeroProcesso || String(new Date().getFullYear());
};

const brl = (v: number | string) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(v) || 0);

const emptyEmpenho = {
  numero: '',
  data: '',
  valor: '',
  documentoAnexo: ''
};

const emptyProcesso = {
  processo: '',
  unidDemandante: 'Fac Odonto',
  tipo: 'Consumo',
  requisitante: '',
  beneficiario: '',
  cnpj: '',
  telefone: '',
  objeto: '',
  classificacao: 'CUSTEIO',
  fonte: 'Participativo',
  modalidade: 'ATA',
  valorBruto: '',
  darfRetencao: ''
};

function Field({
  id,
  label,
  dark,
  as = 'input',
  children,
  ...props
}: any) {
  const cls = `w-full p-2.5 rounded-lg border outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition ${
    dark
      ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
  }`;

  const El = as;

  return (
    <div>
      <label htmlFor={id} className="block text-slate-400 font-medium mb-1">
        {label}
      </label>
      <El id={id} className={cls} {...props}>
        {children}
      </El>
    </div>
  );
}

function Modal({
  open,
  onClose,
  title,
  icon,
  dark,
  children,
  size = 'max-w-lg'
}: any) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) =>
      e.key === 'Escape' && onClose();

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${size} max-h-[90vh] overflow-y-auto scroll-thin rounded-2xl border p-6 shadow-2xl relative ${
          dark
            ? 'bg-[#1e293b] border-slate-700 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold mb-4 flex items-center gap-2">
          {icon}
          {title}
        </h3>

        {children}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  dark,
  onClick,
  active
}: any) {
  const base = `p-4 rounded-xl border shadow-sm text-left w-full transition ${
    dark
      ? 'bg-[#1e293b] border-slate-700/60'
      : 'bg-white border-slate-200'
  }`;

  const content = (
    <>
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>{label}</span>
        <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
      </div>

      <div className={`mt-2 text-xl font-bold tracking-tight ${color}`}>
        {value}
      </div>

      {onClick && (
        <div className={`mt-1 text-[10px] font-medium ${active ? 'text-blue-400' : 'text-slate-500'}`}>
          {active ? 'Filtro ativo · clique para limpar' : 'Clique para filtrar'}
        </div>
      )}
    </>
  );

  if (!onClick) return <div className={base}>{content}</div>;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${base} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        active
          ? 'ring-2 ring-blue-500 border-blue-500/70'
          : dark
            ? 'hover:border-slate-500 hover:bg-slate-800/80'
            : 'hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {content}
    </button>
  );
}

const STATUS_FILTROS: Record<string, any> = {
  TODOS: {
    label: 'Todos',
    test: () => true
  },
  CONCLUIDOS: {
    label: 'Concluídos',
    test: (p: any) => p.statusGeral === 'CONCLUÍDO'
  },
  ANDAMENTO: {
    label: 'Em Andamento',
    test: (p: any) => p.statusGeral !== 'CONCLUÍDO'
  },
  SEM_EMPENHO: {
    label: 'Aguardando Empenho',
    test: (p: any) => !p.empenho
  }
};

export default function App() {
  const [dark, setDark] = useState(true);

  // AUTENTICAÇÃO
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // BANCO DE DADOS
  const [processos, setProcessos] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dadosCarregados, setDadosCarregados] = useState(false);
  const [erroBanco, setErroBanco] = useState('');

  const idsAnteriores = useRef<string[]>([]);
  const filaSincronizacao = useRef<Promise<void>>(Promise.resolve());

  // ESTADOS DA INTERFACE
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('TODOS');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isHistOpen, setIsHistOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [unidPrintFilter, setUnidPrintFilter] = useState('TODAS');

  const [novo, setNovo] = useState<any>(emptyProcesso);
  const [ocorrencia, setOcorrencia] = useState({
    data: hoje(),
    status: 'EM INSTRUÇÃO',
    descricao: '',
    documentoAnexo: ''
  });
  const [isEmpOpen, setIsEmpOpen] = useState(false);
  const [empForm, setEmpForm] = useState<any>(emptyEmpenho);
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingHistId, setEditingHistId] = useState<string | null>(null);

  // VERIFICA A SESSÃO DO USUÁRIO
  useEffect(() => {
    let ativo = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!ativo) return;

      if (error) {
        setLoginError(error.message);
      }

      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      ativo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // CARREGA OS PROCESSOS DO SUPABASE
  useEffect(() => {
    if (!user) {
      setProcessos([]);
      setSelectedId(null);
      setDadosCarregados(false);
      idsAnteriores.current = [];
      return;
    }

    let ativo = true;

    const carregarProcessos = async () => {
      setDadosCarregados(false);
      setErroBanco('');

      const { data, error } = await supabase
        .from('processos')
        .select('id, dados');

      if (!ativo) return;

      if (error) {
        setErroBanco('Erro ao carregar os processos: ' + error.message);
        return;
      }

      const lista = (data || []).map((item: any) => ({
        ...item.dados,
        ano: anoDoProcesso(item.dados)
      }));

      setProcessos(lista);
      const anoAtual = String(new Date().getFullYear());
      const anosDisponiveis = lista.map((p: any) => String(p.ano));
      const anoInicial = anosDisponiveis.includes(anoAtual)
        ? anoAtual
        : (anosDisponiveis.sort((a: string, b: string) => Number(b) - Number(a))[0] || anoAtual);
      setSelectedYear(anoInicial);
      setSelectedId(lista.find((p: any) => String(p.ano) === anoInicial)?.id || null);
      idsAnteriores.current = lista.map((p: any) => p.id);

      setDadosCarregados(true);
    };

    carregarProcessos();

    return () => {
      ativo = false;
    };
  }, [user]);

  // GRAVA AUTOMATICAMENTE AS ALTERAÇÕES NO SUPABASE
  useEffect(() => {
    if (!user || !dadosCarregados) return;

    const listaAtual = [...processos];

    filaSincronizacao.current = filaSincronizacao.current
      .then(async () => {
        const registros = listaAtual.map((p: any) => ({
          id: p.id,
          dados: p
        }));

        if (registros.length > 0) {
          const { error } = await supabase
            .from('processos')
            .upsert(registros, { onConflict: 'id' });

          if (error) throw error;
        }

        const idsAtuais = listaAtual.map((p: any) => p.id);

        const idsRemovidos = idsAnteriores.current.filter(
          (id) => !idsAtuais.includes(id)
        );

        if (idsRemovidos.length > 0) {
          const { error } = await supabase
            .from('processos')
            .delete()
            .in('id', idsRemovidos);

          if (error) throw error;
        }

        idsAnteriores.current = idsAtuais;
        setErroBanco('');
      })
      .catch((error: any) => {
        console.error('Erro na sincronização:', error);
        setErroBanco(
          'Não foi possível salvar os dados no banco: ' + error.message
        );
      });
  }, [processos, user, dadosCarregados]);

  // ENTRAR NO SISTEMA
  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoginLoading(true);
    setLoginError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });

    if (error) {
      setLoginError('E-mail ou senha incorretos. Verifique seus dados.');
    }

    setLoginLoading(false);
  };

  // SAIR DO SISTEMA
  const sair = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setErroBanco('Não foi possível sair: ' + error.message);
    }
  };

  const toggleStatus = (key: string) =>
    setStatusFilter((cur) => (cur === key ? 'TODOS' : key));

  const anosDisponiveis = useMemo(() => {
    const anos = [...new Set([
      String(new Date().getFullYear()),
      ...processos.map((p) => anoDoProcesso(p))
    ])];
    return anos.sort((a, b) => Number(b) - Number(a));
  }, [processos]);

  const processosAno = useMemo(
    () => processos.filter((p) => anoDoProcesso(p) === selectedYear),
    [processos, selectedYear]
  );

  const selecionarAno = (ano: string) => {
    setSelectedYear(ano);
    setSelectedId(processos.find((p) => anoDoProcesso(p) === ano)?.id || null);
    setSearchTerm('');
    setFilterClass('TODOS');
    setStatusFilter('TODOS');
    setShowYearSelector(false);
  };

  const selected = useMemo(
    () => processosAno.find((p) => p.id === selectedId) || processosAno[0],
    [processosAno, selectedId]
  );

  const totalBruto = processosAno.reduce(
    (a, p) => a + (Number(p.valorBruto) || 0),
    0
  );

  const totalRet = processosAno.reduce(
    (a, p) => a + (Number(p.darfRetencao) || 0),
    0
  );

  const concluidos = processosAno.filter(
    (p) => p.statusGeral === 'CONCLUÍDO'
  ).length;

  const semEmpenho = processosAno.filter((p) => !p.empenho).length;

  const etapasOcorrencia = selected?.empenho
    ? ETAPAS_POS
    : ETAPAS_PRE.slice(1);

  const openOcorrencia = () => {
    if (!selected) return;

    setEditingHistId(null);

    setOcorrencia({
      data: hoje(),
      status: etapasOcorrencia[0],
      descricao: '',
      documentoAnexo: ''
    });

    setIsHistOpen(true);
  };

  const openEditOcorrencia = (h: any) => {
    setEditingHistId(h.id);

    setOcorrencia({
      data: h.data,
      status: h.status,
      descricao: h.descricao,
      documentoAnexo: h.documentoAnexo || ''
    });

    setIsHistOpen(true);
  };

  const removeOcorrencia = (h: any) => {
    if (!selected) return;

    if (selected.historico.length <= 1) {
      alert('O processo precisa ter ao menos uma movimentação.');
      return;
    }

    if (!confirm(`Excluir a movimentação de ${h.data} (${h.status})?`)) {
      return;
    }

    setProcessos((atuais) =>
      atuais.map((p) => {
        if (p.id !== selected.id) return p;

        const historico = p.historico.filter(
          (x: any) => x.id !== h.id
        );

        const aindaEmpenhado = historico.some(
          (x: any) => x.status === 'EMPENHADO'
        );

        return {
          ...p,
          historico,
          empenho: aindaEmpenhado ? p.empenho : '',
          statusGeral: historico[historico.length - 1].status
        };
      })
    );
  };

  const openNovo = () => {
    setEditingId(null);
    setNovo({ ...emptyProcesso });
    setIsNewOpen(true);
  };

  const openEditProcesso = () => {
    if (!selected) return;

    setEditingId(selected.id);

    setNovo({
      processo: selected.processo,
      unidDemandante: selected.unidDemandante || 'Fac Odonto',
      tipo: selected.tipo || 'Consumo',
      requisitante: selected.requisitante || '',
      beneficiario: selected.beneficiario,
      cnpj: selected.cnpj || '',
      telefone: selected.telefone || '',
      objeto: selected.objeto || '',
      classificacao: selected.classificacao,
      fonte: selected.fonte,
      modalidade: selected.modalidade,
      empenho: selected.empenho || '',
      valorBruto: selected.valorBruto
        ? String(selected.valorBruto)
        : '',
      darfRetencao: selected.darfRetencao
        ? String(selected.darfRetencao)
        : ''
    });

    setIsNewOpen(true);
  };

  const openEmpenho = () => {
    if (!selected) return;

    setEmpForm({
      ...emptyEmpenho,
      data: hoje(),
      valor: selected.valorBruto || ''
    });

    setIsEmpOpen(true);
  };

  // REGISTRAR EMPENHO
  const registrarEmpenho = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selected) return;

    const item = {
      id: String(Date.now()),
      data: empForm.data,
      status: 'EMPENHADO',
      descricao: `Nota de Empenho ${empForm.numero} emitida no valor de ${brl(
        parseFloat(empForm.valor) || 0
      )}.`,
      documentoAnexo:
        empForm.documentoAnexo ||
        `Nota de Empenho nº ${empForm.numero}.pdf`
    };

    setProcessos((atuais) =>
      atuais.map((p) =>
        p.id === selected.id
          ? {
              ...p,
              empenho: empForm.numero,
              valorBruto:
                parseFloat(empForm.valor) || p.valorBruto,
              statusGeral: 'EMPENHADO',
              historico: [...p.historico, item]
            }
          : p
      )
    );

    setIsEmpOpen(false);
  };

  // FILTRAGEM
  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase();

    return processosAno.filter(
      (p) =>
        [
          p.empenho || '',
          p.processo || '',
          p.beneficiario || '',
          p.requisitante || '',
          p.objeto || '',
          p.unidDemandante || '',
          p.tipo || ''
        ].some((f) => f.toLowerCase().includes(t)) &&
        (filterClass === 'TODOS' ||
          p.classificacao === filterClass) &&
        STATUS_FILTROS[statusFilter].test(p)
    );
  }, [processosAno, searchTerm, filterClass, statusFilter]);

  // PROCESSOS FILTRADOS EXCLUSIVAMENTE PARA IMPRESSÃO
  const filteredPrint = useMemo(() => {
    if (unidPrintFilter === 'TODAS') return filtered;
    return filtered.filter((p) => p.unidDemandante === unidPrintFilter);
  }, [filtered, unidPrintFilter]);

  const card = dark
    ? 'bg-[#1e293b] border-slate-700/60'
    : 'bg-white border-slate-200';

  const muted = dark ? 'text-slate-400' : 'text-slate-500';

  // CRIAR OU EDITAR PROCESSO
  const createProcesso = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setProcessos((atuais) =>
        atuais.map((p) =>
          p.id === editingId
            ? {
                ...p,
                ...novo,
                empenho: p.empenho
                  ? novo.empenho || p.empenho
                  : p.empenho,
                valorBruto: parseFloat(novo.valorBruto) || 0,
                darfRetencao: parseFloat(novo.darfRetencao) || 0
              }
            : p
        )
      );

      setIsNewOpen(false);
      setEditingId(null);
      setNovo({ ...emptyProcesso });

      return;
    }

    const id = String(Date.now());

    const obj = {
      ...novo,
      id,
      ano: selectedYear,
      empenho: '',
      valorBruto: parseFloat(novo.valorBruto) || 0,
      darfRetencao: parseFloat(novo.darfRetencao) || 0,
      statusGeral: 'ABERTURA',
      dataCriacao: hoje(),
      historico: [
        {
          id: id + 'h',
          data: hoje(),
          status: 'ABERTURA',
          descricao: 'Abertura do processo no sistema.',
          documentoAnexo: ''
        }
      ]
    };

    setProcessos((atuais) => [obj, ...atuais]);
    setSelectedId(id);
    setIsNewOpen(false);
    setNovo({ ...emptyProcesso });
  };

  // ADICIONAR OU EDITAR MOVIMENTAÇÃO
  const addOcorrencia = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selected) return;

    if (editingHistId) {
      setProcessos((atuais) =>
        atuais.map((p) => {
          if (p.id !== selected.id) return p;

          const historico = p.historico.map((h: any) =>
            h.id === editingHistId
              ? { ...h, ...ocorrencia }
              : h
          );

          return {
            ...p,
            historico,
            statusGeral: historico[historico.length - 1].status
          };
        })
      );

      setEditingHistId(null);
      setIsHistOpen(false);

      return;
    }

    const item = {
      ...ocorrencia,
      id: String(Date.now())
    };

    setProcessos((atuais) =>
      atuais.map((p) =>
        p.id === selected.id
          ? {
              ...p,
              statusGeral: ocorrencia.status,
              historico: [...p.historico, item]
            }
          : p
      )
    );

    setIsHistOpen(false);

    setOcorrencia({
      data: hoje(),
      status: 'EM LIQUIDAÇÃO',
      descricao: '',
      documentoAnexo: ''
    });
  };

  // EXCLUIR PROCESSO
  const removeProcesso = () => {
    if (!selected) return;

    if (!confirm(`Excluir o processo ${selected.processo}?`)) {
      return;
    }

    const rest = processos.filter(
      (p) => p.id !== selected.id
    );

    setProcessos(rest);
    setSelectedId(rest[0]?.id || null);
  };

  const handlePrint = () => {
    setIsPrintModalOpen(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const etapaIdx = selected
    ? ETAPAS.indexOf(selected.statusGeral)
    : -1;

  // TELA DE CARREGAMENTO
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-slate-300">
        Verificando acesso ao sistema...
      </div>
    );
  }

  // TELA DE LOGIN
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
        <form
          onSubmit={entrar}
          className="w-full max-w-md bg-[#1e293b] border border-slate-700 rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex justify-center mb-5">
            <div className="p-3 bg-blue-600 rounded-xl text-white">
              <FileText className="w-8 h-8" />
            </div>
          </div>

          <h1 className="text-xl font-bold text-center text-white">
            SISTEMA DE ACOMPANHAMENTO
          </h1>

          <p className="text-sm text-slate-400 text-center mt-2 mb-7">
            Informe suas credenciais para acessar o sistema.
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                E-mail
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 text-white outline-none focus:border-blue-500"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Senha
              </label>

              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 text-white outline-none focus:border-blue-500"
                placeholder="Sua senha"
              />
            </div>

            {loginError && (
              <p className="text-sm text-rose-400">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
            >
              {loginLoading ? 'Entrando...' : 'Entrar no Sistema'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // AGUARDA O CARREGAMENTO DOS DADOS
  if (!dadosCarregados) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-slate-300 p-4">
        <p>Carregando processos...</p>

        {erroBanco && (
          <p className="text-rose-400 mt-3 text-sm">
            {erroBanco}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${dark ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>

      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
      `}</style>

      {/* RELATÓRIO PARA IMPRESSÃO */}
      <div className="print-only p-8">
        <h1 className="text-xl font-bold mb-1">
          RELATÓRIO RESUMIDO DE PROCESSOS {unidPrintFilter !== 'TODAS' ? `- UNID: ${unidPrintFilter}` : ''}
        </h1>

        <p className="text-xs text-slate-600 mb-4">
          Gerado em: {hoje()} · Ano: {selectedYear} · Unidade: {unidPrintFilter} · Total de Processos Exibidos: {filteredPrint.length}
        </p>

        <table className="w-full border-collapse border border-slate-300 text-left text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 p-2 font-bold">Nº PROCESSO</th>
              <th className="border border-slate-300 p-2 font-bold">UNID. DEMANDANTE</th>
              <th className="border border-slate-300 p-2 font-bold">TIPO</th>
              <th className="border border-slate-300 p-2 font-bold">EMPENHO</th>
              <th className="border border-slate-300 p-2 font-bold">REQUISITANTE</th>
              <th className="border border-slate-300 p-2 font-bold">BENEFICIÁRIO</th>
              <th className="border border-slate-300 p-2 font-bold">OBJETO</th>
              <th className="border border-slate-300 p-2 font-bold">VALOR BRUTO</th>
              <th className="border border-slate-300 p-2 font-bold">STATUS</th>
            </tr>
          </thead>

          <tbody>
            {filteredPrint.map((p) => (
              <tr key={p.id}>
                <td className="border border-slate-300 p-2 font-mono font-bold">{p.processo}</td>
                <td className="border border-slate-300 p-2">{p.unidDemandante || '-'}</td>
                <td className="border border-slate-300 p-2">{p.tipo || '-'}</td>
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

      {/* PAINEL PRINCIPAL */}
      <div className="no-print">
        <header className={`sticky top-0 z-30 border-b backdrop-blur-md ${dark ? 'bg-[#1e293b]/90 border-slate-700/60' : 'bg-white/90 border-slate-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">

            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-500/20 shrink-0">
                <FileText className="w-5 h-5" aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold tracking-tight truncate">
                  SISTEMA DE ACOMPANHAMENTO DE PROCESSOS
                </h1>

                <p className={`text-xs ${muted} truncate`}>
                  Ficha de Registro e Histórico de Ocorrências
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowYearSelector((aberto) => !aberto)}
                  aria-expanded={showYearSelector}
                  aria-label={`Selecionar ano. Ano atual: ${selectedYear}`}
                  title="Organizar processos por ano"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                    dark
                      ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Ano: {selectedYear}</span>
                </button>

                {showYearSelector && (
                  <div className={`absolute right-0 top-full mt-2 z-50 w-52 rounded-xl border p-3 shadow-xl ${
                    dark ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'
                  }`}>
                    <label htmlFor="seletor-ano" className="block text-xs font-semibold mb-2 text-slate-400">
                      Visualizar processos do ano
                    </label>
                    <select
                      id="seletor-ano"
                      value={selectedYear}
                      onChange={(e) => selecionarAno(e.target.value)}
                      className={`w-full p-2 rounded-lg border text-sm outline-none focus:border-blue-500 ${
                        dark
                          ? 'bg-slate-800 border-slate-700 text-slate-100'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      {anosDisponiveis.map((ano) => (
                        <option key={ano} value={ano}>{ano}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-2">
                      Os registros de outros anos permanecem salvos e não serão misturados.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={sair}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium shrink-0 ${
                  dark
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Sair
              </button>

              <button
                onClick={() => setIsPrintModalOpen(true)}
                title="Imprimir Relatório"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium shrink-0 transition ${
                  dark
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Printer className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Imprimir Resumo</span>
              </button>

              <button
                onClick={() => setDark(!dark)}
                aria-label={dark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
                className={`p-2 rounded-lg border shrink-0 ${
                  dark
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-amber-400'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

          {erroBanco && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
              {erroBanco}
            </div>
          )}

          {/* RESUMO */}
          <section aria-label="Resumo" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard dark={dark} label="Valor Bruto" value={brl(totalBruto)} icon={DollarSign} color="text-blue-500" />
            <StatCard dark={dark} label="DARF / Retenção" value={brl(totalRet)} icon={AlertCircle} color="text-rose-500" />
            <StatCard dark={dark} label="Valor Líquido" value={brl(totalBruto - totalRet)} icon={FileCheck} color="text-emerald-500" />

            <StatCard
              dark={dark}
              label="Concluídos"
              value={concluidos}
              icon={CheckCircle2}
              color="text-emerald-500"
              onClick={() => toggleStatus('CONCLUIDOS')}
              active={statusFilter === 'CONCLUIDOS'}
            />

            <StatCard
              dark={dark}
              label="Em Andamento"
              value={processosAno.length - concluidos}
              icon={Clock}
              color="text-amber-500"
              onClick={() => toggleStatus('ANDAMENTO')}
              active={statusFilter === 'ANDAMENTO'}
            />

            <StatCard
              dark={dark}
              label="Aguardando Empenho"
              value={semEmpenho}
              icon={FileText}
              color="text-sky-400"
              onClick={() => toggleStatus('SEM_EMPENHO')}
              active={statusFilter === 'SEM_EMPENHO'}
            />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* LISTA DE PROCESSOS */}
            <section
              aria-label="Processos cadastrados"
              className={`lg:col-span-5 rounded-2xl border p-4 shadow-sm flex flex-col lg:h-[740px] ${card}`}
            >
              <div className={`flex flex-col gap-3 pb-3 border-b ${dark ? 'border-slate-700/50' : 'border-slate-200'}`}>

                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-sm uppercase tracking-wider text-slate-400">
                    Processos Cadastrados
                  </h2>

                  <button
                    onClick={openNovo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    Novo Processo
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />

                  <label htmlFor="busca" className="sr-only">
                    Buscar processos
                  </label>

                  <input
                    id="busca"
                    type="search"
                    placeholder="Buscar por processo, requisitante ou beneficiário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-none focus:border-blue-500 ${
                      dark
                        ? 'bg-slate-800/80 border-slate-700 text-slate-200 placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por classificação">
                  <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />

                  {['TODOS', 'CUSTEIO', 'INVESTIMENTO'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setFilterClass(c)}
                      aria-pressed={filterClass === c}
                      className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap text-[11px] ${
                        filterClass === c
                          ? 'bg-blue-600 text-white'
                          : dark
                            ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por situação">
                  <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />

                  {Object.entries(STATUS_FILTROS).map(([key, f]: [string, any]) => {
                    const count = processosAno.filter(f.test).length;
                    const on = statusFilter === key;

                    return (
                      <button
                        key={key}
                        onClick={() => setStatusFilter(key)}
                        aria-pressed={on}
                        className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap text-[11px] inline-flex items-center gap-1.5 ${
                          on
                            ? 'bg-blue-600 text-white'
                            : dark
                              ? 'bg-[#1e293b] text-slate-400 hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {f.label}

                        <span className={`px-1.5 rounded-full text-[10px] ${
                          on
                            ? 'bg-white/20'
                            : dark
                              ? 'bg-slate-700'
                              : 'bg-slate-200'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className={`text-[11px] ${muted}`} aria-live="polite">
                  Exibindo <b>{filtered.length}</b> de {processosAno.length} processo(s)
                  {statusFilter !== 'TODOS' && (
                    <>
                      {' · '}
                      <span className="text-blue-400">
                        {STATUS_FILTROS[statusFilter].label}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <ul className="flex-1 overflow-y-auto scroll-thin pt-3 flex flex-col gap-2.5 pr-1">
                {filtered.length === 0 ? (
                  <li className="text-center py-12 text-slate-400 text-xs">
                    Nenhum processo encontrado com esses termos.
                  </li>
                ) : (
                  filtered.map((item) => {
                    const sel = item.id === selected?.id;
                    const done = item.statusGeral === 'CONCLUÍDO';

                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setSelectedId(item.id)}
                          aria-current={sel}
                          className={`w-full text-left p-3.5 rounded-xl border transition ${
                            sel
                              ? dark
                                ? 'bg-blue-900/30 border-blue-500/70 ring-1 ring-blue-500/30'
                                : 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-400/30'
                              : dark
                                ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80'
                                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold text-sm tracking-wide text-blue-400 font-mono">
                                {item.processo}
                              </span>

                              <p className={`text-xs mt-0.5 ${muted}`}>
                                {item.empenho ? (
                                  <>
                                    Empenho:{' '}
                                    <span className="font-medium">{item.empenho}</span>
                                  </>
                                ) : (
                                  <span className="text-sky-400 font-medium">
                                    Aguardando empenho
                                  </span>
                                )}
                              </p>
                            </div>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              item.classificacao === 'CUSTEIO'
                                ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                                : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                            }`}>
                              {item.classificacao}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-400 font-medium">
                            {item.unidDemandante && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-700/50 border border-slate-600/40 text-slate-300">
                                {item.unidDemandante}
                              </span>
                            )}
                            {item.tipo && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-700/50 border border-slate-600/40 text-slate-300">
                                {item.tipo}
                              </span>
                            )}
                          </div>

                          {item.requisitante && (
                            <div className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1">
                              <User className="w-3 h-3 text-blue-400" />
                              Req: {item.requisitante}
                            </div>
                          )}

                          <div className="mt-1 text-xs font-medium truncate">
                            {item.beneficiario}
                          </div>

                          <div className={`mt-3 flex items-center justify-between text-[11px] pt-2 border-t ${
                            dark ? 'border-slate-700/40' : 'border-slate-200'
                          }`}>
                            <span className="text-slate-400">
                              {item.dataCriacao}
                            </span>

                            <span className={`font-semibold ${
                              done ? 'text-emerald-500' : 'text-amber-500'
                            }`}>
                              {item.statusGeral}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </section>

            {/* DETALHES DO PROCESSO */}
            <section
              aria-label="Detalhes do processo"
              className={`lg:col-span-7 rounded-2xl border p-6 shadow-sm lg:min-h-[740px] ${card}`}
            >
              {selected ? (
                <div className="flex flex-col gap-6">

                  <div className={`border-b pb-5 ${dark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">

                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-1 font-bold rounded-md bg-blue-600 text-white">
                          {selected.modalidade}
                        </span>

                        <span className={`text-xs px-2.5 py-1 font-bold rounded-md border ${
                          selected.classificacao === 'CUSTEIO'
                            ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                            : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                        }`}>
                          {selected.classificacao}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={openEditProcesso}
                          aria-label="Editar processo"
                          title="Editar processo"
                          className={`p-1.5 rounded-lg border text-blue-400 ${
                            dark
                              ? 'border-slate-700 hover:bg-blue-500/10'
                              : 'border-slate-200 hover:bg-blue-50'
                          }`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={removeProcesso}
                          aria-label="Excluir processo"
                          title="Excluir processo"
                          className={`p-1.5 rounded-lg border text-rose-500 ${
                            dark
                              ? 'border-slate-700 hover:bg-rose-500/10'
                              : 'border-slate-200 hover:bg-rose-50'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {!selected.empenho && (
                          <button
                            onClick={openEmpenho}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                          >
                            <FileCheck className="w-3.5 h-3.5" aria-hidden="true" />
                            Registrar Empenho
                          </button>
                        )}

                        <button
                          onClick={openOcorrencia}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          Nova Movimentação
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
                      <div>
                        <p className={`text-[11px] uppercase font-semibold tracking-wider ${muted}`}>
                          Nº Processo
                        </p>

                        <h2 className="text-xl sm:text-2xl font-black tracking-tight font-mono">
                          {selected.processo}
                        </h2>

                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {selected.unidDemandante && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              Unid: {selected.unidDemandante}
                            </span>
                          )}
                          {selected.tipo && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                              Tipo: {selected.tipo}
                            </span>
                          )}
                        </div>

                        {selected.requisitante && (
                          <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Requisitante: <b>{selected.requisitante}</b>
                          </p>
                        )}

                        <p className={`text-xs mt-1 ${muted}`}>
                          Empenho: {selected.empenho ? (
                            <span className="font-mono text-blue-400 font-semibold">
                              {selected.empenho}
                            </span>
                          ) : (
                            <span className="text-sky-400 font-semibold">
                              ainda não empenhado
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <div className="text-xs text-slate-400">
                          {selected.empenho ? 'Valor Líquido' : 'Valor Estimado'}
                        </div>

                        <div className="text-xl font-extrabold text-emerald-500">
                          {brl((selected.valorBruto || 0) - (selected.darfRetencao || 0))}
                        </div>
                      </div>
                    </div>

                    <ol className="mt-5 grid grid-cols-7 gap-1.5" aria-label="Etapas do processo">
                      {ETAPAS.map((et, i) => (
                        <li
                          key={et}
                          className="flex flex-col gap-1.5"
                          aria-current={i === etapaIdx ? 'step' : undefined}
                        >
                          <div className={`h-1.5 rounded-full ${
                            i <= etapaIdx
                              ? etapaIdx === ETAPAS.length - 1
                                ? 'bg-emerald-500'
                                : 'bg-blue-500'
                              : dark
                                ? 'bg-slate-700'
                                : 'bg-slate-200'
                          }`} />

                          <span className={`text-[9px] sm:text-[10px] font-semibold leading-tight ${
                            i <= etapaIdx
                              ? dark
                                ? 'text-slate-200'
                                : 'text-slate-700'
                              : 'text-slate-500'
                          }`}>
                            {et}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* DADOS DO BENEFICIÁRIO E FINANCEIROS */}
                  <div className={`p-4 rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-4 ${
                    dark
                      ? 'bg-slate-800/40 border-slate-700/50'
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                        Beneficiário
                      </span>

                      <div className="text-xs font-bold mt-0.5">
                        {selected.beneficiario}
                      </div>

                      {selected.cnpj && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          CNPJ: {selected.cnpj}
                        </div>
                      )}

                      {selected.telefone && (
                        <div className="text-[11px] text-blue-400 mt-1 flex items-center gap-1 font-medium">
                          <Phone className="w-3 h-3" aria-hidden="true" />
                          {selected.telefone}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                        Objeto
                      </span>

                      <div className="text-xs font-bold mt-0.5">
                        {selected.objeto || 'Não informado'}
                      </div>
                    </div>

                    <div className={`pt-2 border-t ${
                      dark ? 'border-slate-700/40' : 'border-slate-200'
                    }`}>
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                        Classificação / Fonte
                      </span>

                      <div className="text-xs mt-0.5">
                        Classificação: <b>{selected.classificacao}</b> | Fonte: <b>{selected.fonte}</b>
                      </div>
                    </div>

                    <div className={`pt-2 border-t ${
                      dark ? 'border-slate-700/40' : 'border-slate-200'
                    }`}>
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                        Detalhamento Financeiro
                      </span>

                      <div className="text-xs mt-0.5">
                        Bruto: <b>{brl(selected.valorBruto)}</b>
                        <span className="text-rose-500">
                          {' '}| DARF: <b>{brl(selected.darfRetencao)}</b>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* HISTÓRICO */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" aria-hidden="true" />
                      Histórico de Movimentações e Documentos
                    </h3>

                    <ol className={`relative pl-7 flex flex-col gap-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 ${
                      dark ? 'before:bg-slate-700/60' : 'before:bg-slate-200'
                    }`}>
                      {selected.historico.map((h: any) => (
                        <li key={h.id} className="relative">
                          <div className={`absolute -left-7 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ${
                            dark ? 'ring-[#1e293b]' : 'ring-white'
                          } ${corEtapa(h.status)}`}>
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>

                          <div className={`p-3.5 rounded-xl border ${
                            dark
                              ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-blue-400">
                                {h.data} - <span className="uppercase tracking-wide">{h.status}</span>
                              </span>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => openEditOcorrencia(h)}
                                  aria-label={`Editar movimentação de ${h.data}`}
                                  title="Editar"
                                  className={`p-1 rounded-md text-slate-400 hover:text-blue-400 ${
                                    dark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
                                  }`}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => removeOcorrencia(h)}
                                  aria-label={`Excluir movimentação de ${h.data}`}
                                  title="Excluir"
                                  className={`p-1 rounded-md text-slate-400 hover:text-rose-500 ${
                                    dark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
                                  }`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className={`text-xs mt-1.5 ${
                              dark ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                              {h.descricao}
                            </p>

                            {h.documentoAnexo && (
                              <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-medium">
                                <Paperclip className="w-3 h-3" aria-hidden="true" />
                                Documento Anexo: {h.documentoAnexo}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-400 text-xs text-center">
                  Nenhum processo cadastrado. Clique em "Novo Processo" para começar.
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* MODAL OPÇÕES DE IMPRESSÃO */}
      <Modal
        open={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        dark={dark}
        size="max-w-md"
        title="Imprimir Relatório"
        icon={<Printer className="w-4 h-4 text-blue-500" />}
      >
        <div className="flex flex-col gap-4 text-xs">
          <p className={muted}>
            Selecione qual filtro deseja aplicar ao relatório impresso:
          </p>

          <Field
            dark={dark}
            id="print-unid-filter"
            as="select"
            label="Unidade Demandante"
            value={unidPrintFilter}
            onChange={(e: any) => setUnidPrintFilter(e.target.value)}
          >
            <option value="TODAS">Imprimir Tudo (Todas as Unidades)</option>
            <option value="Fac Odonto">Fac Odonto</option>
            <option value="Fac Medicina">Fac Medicina</option>
            <option value="IESC">IESC</option>
            <option value="NEEDIER">NEEDIER</option>
          </Field>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(false)}
              className={`px-4 py-2 rounded-lg border font-medium ${
                dark
                  ? 'border-slate-600 hover:bg-slate-700'
                  : 'border-slate-300 hover:bg-slate-100'
              }`}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm inline-flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Gerar e Imprimir
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL NOVO / EDITAR PROCESSO */}
      <Modal
        open={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        dark={dark}
        title={editingId ? 'Editar Processo' : 'Abrir Novo Processo'}
        icon={
          editingId
            ? <Pencil className="w-4 h-4 text-blue-500" />
            : <Plus className="w-4 h-4 text-blue-500" />
        }
      >
        <form onSubmit={createProcesso} className="flex flex-col gap-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field
              dark={dark}
              id="n-proc"
              label="Nº Processo *"
              required
              placeholder="23079.00123/2026-00"
              value={novo.processo}
              onChange={(e: any) => setNovo({ ...novo, processo: e.target.value })}
            />

            <Field
              dark={dark}
              id="n-unid"
              as="select"
              label="Unid Demandante"
              value={novo.unidDemandante}
              onChange={(e: any) => setNovo({ ...novo, unidDemandante: e.target.value })}
            >
              <option value="Fac Odonto">Fac Odonto</option>
              <option value="Fac Medicina">Fac Medicina</option>
              <option value="IESC">IESC</option>
              <option value="NEEDIER">NEEDIER</option>
            </Field>

            <Field
              dark={dark}
              id="n-tipo"
              as="select"
              label="Tipo"
              value={novo.tipo}
              onChange={(e: any) => setNovo({ ...novo, tipo: e.target.value })}
            >
              <option value="Consumo">Consumo</option>
              <option value="Permanente">Permanente</option>
              <option value="Serviço">Serviço</option>
            </Field>
          </div>

          <Field
            dark={dark}
            id="n-req"
            label="Setor Requisitante / Solicitante"
            placeholder="Ex: Almoxarifado / TI / Gabinete"
            value={novo.requisitante}
            onChange={(e: any) => setNovo({ ...novo, requisitante: e.target.value })}
          />

          {editingId && novo.empenho && (
            <Field
              dark={dark}
              id="n-emp"
              label="Nº Empenho"
              value={novo.empenho}
              onChange={(e: any) => setNovo({ ...novo, empenho: e.target.value })}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field
              dark={dark}
              id="n-ben"
              label="Beneficiário *"
              required
              placeholder="FORNECEDOR ABC LTDA"
              value={novo.beneficiario}
              onChange={(e: any) => setNovo({ ...novo, beneficiario: e.target.value })}
            />

            <Field
              dark={dark}
              id="n-cnpj"
              label="CNPJ"
              placeholder="00.000.000/0001-00"
              value={novo.cnpj}
              onChange={(e: any) => setNovo({ ...novo, cnpj: e.target.value })}
            />
          </div>

          <Field
            dark={dark}
            id="n-tel"
            label="Telefone de Contato"
            type="tel"
            placeholder="(00) 00000-0000"
            value={novo.telefone}
            onChange={(e: any) => setNovo({ ...novo, telefone: e.target.value })}
          />

          <Field
            dark={dark}
            id="n-obj"
            label="Objeto / Descrição Resumida"
            placeholder="Ex: Material de Limpeza / Papel"
            value={novo.objeto}
            onChange={(e: any) => setNovo({ ...novo, objeto: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-3">
            <Field
              dark={dark}
              id="n-class"
              as="select"
              label="Classificação"
              value={novo.classificacao}
              onChange={(e: any) => setNovo({ ...novo, classificacao: e.target.value })}
            >
              <option value="CUSTEIO">CUSTEIO</option>
              <option value="INVESTIMENTO">INVESTIMENTO</option>
            </Field>

            <Field
              dark={dark}
              id="n-fonte"
              as="select"
              label="Fonte"
              value={novo.fonte}
              onChange={(e: any) => setNovo({ ...novo, fonte: e.target.value })}
            >
              {!['Participativo', 'PROAP', 'Outros'].includes(novo.fonte) && novo.fonte && (
                <option value={novo.fonte}>Valor atual: {novo.fonte}</option>
              )}
              <option value="Participativo">Participativo</option>
              <option value="PROAP">PROAP</option>
              <option value="Outros">Outros</option>
            </Field>

            <Field
              dark={dark}
              id="n-mod"
              as="select"
              label="Modalidade"
              value={novo.modalidade}
              onChange={(e: any) => setNovo({ ...novo, modalidade: e.target.value })}
            >
              {!['ATA', 'Dispensa de Licitação', 'IRP', 'Pregão'].includes(novo.modalidade) && novo.modalidade && (
                <option value={novo.modalidade}>Valor atual: {novo.modalidade}</option>
              )}
              <option value="ATA">ATA</option>
              <option value="Dispensa de Licitação">Dispensa de Licitação</option>
              <option value="IRP">IRP</option>
              <option value="Pregão">Pregão</option>
            </Field>
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-[11px] text-blue-400 font-semibold mb-2">
              Valores (Opcionais no momento da abertura)
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Field
                dark={dark}
                id="n-bruto"
                label="Valor Estimado (R$)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={novo.valorBruto}
                onChange={(e: any) => setNovo({ ...novo, valorBruto: e.target.value })}
              />

              <Field
                dark={dark}
                id="n-darf"
                label="DARF / Retenção (R$)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={novo.darfRetencao}
                onChange={(e: any) => setNovo({ ...novo, darfRetencao: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewOpen(false)}
              className={`px-4 py-2 rounded-lg border font-medium ${
                dark
                  ? 'border-slate-600 hover:bg-slate-700'
                  : 'border-slate-300 hover:bg-slate-100'
              }`}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
            >
              {editingId ? 'Salvar Alterações' : 'Salvar Processo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL REGISTRAR MOVIMENTAÇÃO */}
      <Modal
        open={isHistOpen}
        onClose={() => setIsHistOpen(false)}
        dark={dark}
        size="max-w-md"
        title={editingHistId ? 'Editar Movimentação' : 'Adicionar Nova Ocorrência'}
        icon={
          editingHistId
            ? <Pencil className="w-4 h-4 text-emerald-500" />
            : <Plus className="w-4 h-4 text-emerald-500" />
        }
      >
        <form onSubmit={addOcorrencia} className="flex flex-col gap-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Field
              dark={dark}
              id="o-data"
              label="Data"
              required
              placeholder="DD/MM/AAAA"
              value={ocorrencia.data}
              onChange={(e: any) => setOcorrencia({ ...ocorrencia, data: e.target.value })}
            />

            <Field
              dark={dark}
              id="o-status"
              as="select"
              label="Status da Etapa"
              value={ocorrencia.status}
              onChange={(e: any) => setOcorrencia({ ...ocorrencia, status: e.target.value })}
            >
              {(editingHistId ? ETAPAS : etapasOcorrencia).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Field>
          </div>

          <Field
            dark={dark}
            id="o-desc"
            as="textarea"
            rows={3}
            label="Descrição / Despacho"
            required
            placeholder="Ex: Nota Fiscal atestada e encaminhada para pagamento..."
            value={ocorrencia.descricao}
            onChange={(e: any) => setOcorrencia({ ...ocorrencia, descricao: e.target.value })}
          />

          <Field
            dark={dark}
            id="o-doc"
            label="Documento Anexo (nome do arquivo)"
            placeholder="Ex: NF_618_Atestada.pdf"
            value={ocorrencia.documentoAnexo}
            onChange={(e: any) => setOcorrencia({ ...ocorrencia, documentoAnexo: e.target.value })}
          />

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsHistOpen(false)}
              className={`px-4 py-2 rounded-lg border font-medium ${
                dark
                  ? 'border-slate-600 hover:bg-slate-700'
                  : 'border-slate-300 hover:bg-slate-100'
              }`}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
            >
              {editingHistId ? 'Salvar Alterações' : 'Registrar Ocorrência'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL REGISTRAR EMPENHO */}
      <Modal
        open={isEmpOpen}
        onClose={() => setIsEmpOpen(false)}
        dark={dark}
        size="max-w-md"
        title="Registrar Empenho"
        icon={<FileCheck className="w-4 h-4 text-blue-500" />}
      >
        <form onSubmit={registrarEmpenho} className="flex flex-col gap-3 text-xs">
          <p className={`text-[11px] ${muted}`}>
            Processo{' '}
            <span className="font-mono text-blue-400">
              {selected?.processo}
            </span>
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field
              dark={dark}
              id="e-num"
              label="Nº Empenho"
              required
              placeholder="Ex: 2026NE0004"
              value={empForm.numero}
              onChange={(e: any) => setEmpForm({ ...empForm, numero: e.target.value })}
            />

            <Field
              dark={dark}
              id="e-data"
              label="Data"
              required
              placeholder="DD/MM/AAAA"
              value={empForm.data}
              onChange={(e: any) => setEmpForm({ ...empForm, data: e.target.value })}
            />
          </div>

          <Field
            dark={dark}
            id="e-valor"
            label="Valor Empenhado (R$)"
            required
            type="number"
            step="0.01"
            min="0"
            value={empForm.valor}
            onChange={(e: any) => setEmpForm({ ...empForm, valor: e.target.value })}
          />

          <Field
            dark={dark}
            id="e-doc"
            label="Documento Anexo (nome do arquivo)"
            placeholder="Nota de Empenho.pdf"
            value={empForm.documentoAnexo}
            onChange={(e: any) => setEmpForm({ ...empForm, documentoAnexo: e.target.value })}
          />

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEmpOpen(false)}
              className={`px-4 py-2 rounded-lg border font-medium ${
                dark
                  ? 'border-slate-600 hover:bg-slate-700'
                  : 'border-slate-300 hover:bg-slate-100'
              }`}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
            >
              Registrar Empenho
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
